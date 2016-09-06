import {Router, route} from 'laforge'
import JSON5 from 'json5'
import {merge, reduce} from 'lodash'
import {pluralize, capitalize, underscore} from 'inflection'

export default class CollectionRouter extends Router {

  constructor(opts) {
    super(opts)
    this.opts = opts
    this.database = opts.database
    this.collectionSingular = this.getCollectionName()
    this.collection = pluralize(this.collectionSingular)
    this.model = this.getModel(this.collectionSingular)
  }
  
  @route('get', '/')
  getAll(opts, http) {
    let query = this.getQueryFromParams(opts)
    let queryStr = opts.query.query
    if (queryStr) {
      let where = merge({}, query.where, { $or: {} })
      let fields = opts.query.fields ? opts.query.fields.split(',') : []
      query.where = reduce(fields, (m, field)=> {
        m.$or[field] = { $iLike: `%${queryStr}%` }
        return m
      }, where)      
    }
    
    let count = this.model.count({ where: query.where })
    let results = this.model.findAll(query)
    return Promise.all([count, results])
      .then(([count, rows])=> {
        http.res.set({'X-Row-Count': count})
        return rows
      })
  }

  @route('get', '/search') 
  search(opts, http) {
    let query = this.getQueryFromParams(opts)
    let fields = opts.query.fields ? opts.query.fields.split(',') : []
    let queryStr = opts.query.query
    let where = merge(query.where, { $or: {} })
    if (queryStr) {
      query.where = reduce(fields, (m, field)=> {
        m.$or[field] = { $iLike: `%${queryStr}%` }
        return m
      }, where)      
    }

    let count = this.model.count({ where: query.where })
    let results = this.model.findAll(query)

    return Promise.all([count, results])
      .then(([count, rows])=> {
        http.res.set({'X-Row-Count': count})
        return rows
      })
  }

  @route('post', '/')
  create(opts, http) {
    return this.model.create(opts.data, { 
      request: opts 
    })
  }

  @route('get', '/count', 99)
  getCount(opts, http) {
    let query = this.getQueryFromParams(opts)
    return this.model.count({
      include: query.include,
      where: query.where
    }).then(count => {
      return {count}
    })
  }

  @route('get', '/:id')
  getOne(opts, http) {
    let query = this.getQueryFromParams(opts)
    return this.model.findById(opts.params.id, {
      include: query.include,
      where: query.where
    })
  }

  @route('put', '/:id')
  update(opts, http) {
    delete opts.data.id
    let query = this.getQueryFromParams(opts)
    return this.model.findById(opts.params.id, {
      include: query.include,
      where: query.where
    }).then(record => {
        record.set(opts.data)
        return record.save({ 
          request: opts 
        })
      })
  }

  @route('delete', '/:id')
  remove(opts, http) {
    let query = this.getQueryFromParams(opts)
    return this.model.findById(opts.params.id, {
      include: query.include,
      where: query.where
    }).then(record => {
      return record.destroy()
    })
  }

  getModel(model) {
    return this.database[model]
  }

  getAssociations(models = []) {
    return models.map(k => this.model.associations[k])
  }

  getCollectionName() {
    if (this.opts.name) {
      return this.opts.name
    }
    let constructorName = Object.getPrototypeOf(this).constructor.name
    return capitalize(underscore(constructorName).split('_')[0])
  }
  
  getQueryFromParams(opts) {    
    let defaults = {
      page: 0,
      limit: 50,
      include: [],
      where: null,
      order: null
    }
    let o = merge({}, defaults, opts.query)    
    let limit = o.limit
    let offset = (o.page == 0 || o.page == 1) ? 0 : (limit * o.page)
    let include = this.getAssociations(this.parseInclude(o.include || []))
    let where = this.parseWhere(o.where || '')
    let order = this.parseOrder(o.order || '')

    return {
      limit,
      offset,
      include,
      where,
      order
    }
  }

  parseWhere(whereStr) {
    let query = {}
    if (!whereStr) {
      return query
    }
    try {
      query = JSON5.parse(whereStr)
    } catch(e) {
      console.log('QUERY PARSE ERROR: ', e)
    }
    return query
  }

  parseOrder(orderStr) {
    if (!orderStr) {
      return []
    }
    return orderStr.split(',')
      .map(str => {
        return str.trim()
      })
      .map(prop => {
        let firstChar = prop[0]
        if (firstChar === '-') {
          return [prop.slice(1), 'DESC']
        } else if (firstChar === '+') {
          return [prop.slice(1), 'ASC']
        } else {
          return prop
        }
      })
  }

  parseInclude(arr) {
    if (Array.isArray(arr)) return arr
    if (typeof arr === 'string') {
      if (arr.toLowerCase() === 'all') {
        return Object.keys(this.model.associations)
      }
      return arr.split(',')
    }
    return []
  }

}
