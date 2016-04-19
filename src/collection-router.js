import {Router, route} from 'laforge'
import {pluralize, capitalize, underscore} from 'inflection'

export default class CollectionRouter extends Router {

  constructor(opts) {
    super(opts)
    process.nextTick(()=> {
      this.database = opts.database
      this.collectionSingular = this.getCollectionName()
      this.collection = pluralize(this.collectionSingular)
      console.log(this.collectionSingular)
      this.model = this.database[this.collectionSingular]
      this.registerRoutes()
    })
  }
  
  @route('get', '/')
  getAll(opts, http) {
    return this.model.findAll()
  }

  @route('post', '/')
  create(opts, http) {
    return this.model.create(opts.data)
  }

  @route('get', '/:id')
  getOne(opts, http) {
    return this.model.findById(opts.params.id, {
      include: this.getAssociations(opts)
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

  getAssociations() {
    return Object.keys(this.model.associations)
      .map(k => this.model.associations[k])
  }

  getCollectionName() {
    let constructorName = Object.getPrototypeOf(this).constructor.name
    return capitalize(underscore(constructorName).split('_')[0])
  }

}