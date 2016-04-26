import {Router, route} from 'laforge'
import {merge} from 'lodash'
import {pluralize, capitalize, underscore} from 'inflection'

export default class CollectionRouter extends Router {

  constructor(opts) {
    super(opts)
    process.nextTick(()=> {
      this.database = opts.database
      this.collectionSingular = this.getCollectionName()
      this.collection = pluralize(this.collectionSingular)
      this.model = this.getModel(this.collectionSingular)
      this.registerRoutes()
    })
  }
  
  @route('get', '/')
  getAll(opts, http) {
    let defaults = {
      page: 0,
      limit: 50,
      include: []
    }
    let o = merge({}, defaults, opts.query)    
    let limit = o.limit
    let offset = (o.page === 0 || o.page === 1) ? 0 : (limit * o.page)
    let include = this.getAssociations(this.parseInclude(o.include || []))
    return this.model.findAll({
      limit,
      offset,
      include
    })
  }

  @route('post', '/')
  create(opts, http) {
    return this.model.create(opts.data)
  }

  @route('get', '/:id')
  getOne(opts, http) {
    return this.model.findById(opts.params.id, {
      include: this.getAssociations(this.parseInclude('all'))
    })
  }

  @route('put', '/:id')
  update(opts, http) {
    return this.model.updateById(opts.params.id, opts.data)
  }

  @route('delete', '/:id')
  remove(opts, http) {
    return this.model.remove(opts.params.id)
  }

  getModel(model) {
    return this.database[model]
  }

  getAssociations(models = []) {
    return models.map(k => this.model.associations[k])
  }

  getCollectionName() {
    let constructorName = Object.getPrototypeOf(this).constructor.name
    return capitalize(underscore(constructorName).split('_')[0])
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
