# laforge-sequelize

Lets you do cool stuff like this:

```
import {route} from 'laforge'
import {CollectionRouter} from 'laforge-sequelize'

export default class ProductRouter extends CollectionRouter {

  // inherits standard REST methods

  GET / - Get all products

  POST / - Create product

  GET /:id - Get one product

  PUT /:id - Update one product

  DELETE /:id - Destroy one product

  @route('get', '/vendors', 1) // optional 3rd arg for defining route priority
  vendors() {                  // in this case needed to override GET /:id
    return this.model.findVendors()
  }

}
```

Instantiate like this:

```
import ProductRouter from './products'
import database from '../services/database' // must be Builder class from 
                                            // `sequelize-classes`

app.use('/products', (new ProductRouter({ database })).handler())
```

Roadmap is to include a management class for pulling a whole API together
and avoid having to manually instantiate these routers.