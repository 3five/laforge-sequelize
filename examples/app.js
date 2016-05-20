import {Router, route} from 'laforge'
import {CollectionRouter} from '../lib'
import Express from 'express'
import database from './models'

class Test extends Router {

  testMethod() {
    return 'test'
  }

  @route('get', '/foo')
  foo(opts, http) {
    return Promise.resolve('foo')
  }

  @route('get', '/bar')
  bar(opts, http) {
    return Promise.resolve('bar')
  }

}

class Baz extends Test {

  @route('get', '/baz')
  baz(opts, http) {
    return Promise.resolve('baz')
  }

  @route('get', '/bar')
  bar(opts, http) {
    return Promise.resolve(`overrride!!-${this.testMethod()}`)
  }

}


class Bar extends Baz {
  @route('get', '/bar')
  child(opts, http) {
    return Promise.resolve('CHild!')
  }
}


class PersonRouter extends CollectionRouter {

}

const app = Express()
export default app

const baz = new Baz()
const bar = new Bar()

app.use(baz.handler())

app.use('/child', bar.handler())


const persons = new PersonRouter({ database })

console.log(persons.routes)

app.use('/people', persons.handler())

app.get('/', (req, res)=> {
  res.sendStatus(200)
})
