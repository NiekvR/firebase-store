# FirebaseStore

Use the FirebaseStoreService to generate an out-of-the-box CRUD-service on top off the `@angular/fire` collection module. 

## Installation
```
npm install @ternwebdesign/firebase-store
```
This library is dependent on [firebase](https://www.npmjs.com/package/firebase) and [@Angular/fire](https://www.npmjs.com/package/@angular/fire) libraries.
> Use the [angular fire quickstart](https://github.com/angular/angularfire/blob/HEAD/docs/install-and-setup.md) to set up firebase to your angular project.

## Usage
First make sure `@angular/fire` is initialized. Create a new service and extend that service with the FirebaseStoreService. Add the model you want to store in a firebase collection as generic type. Next inject the AngularFirestore into this service. Use this to add a firebase collection to the parent using the `this.setCollection()` method in the constructor of the service.
```
import { Injectable } from '@angular/core';
import { FirebaseStoreService } from '@ternwebdesign/firebase-store';
import { Model } from '../models/model.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends FirebaseStoreService<Model> {

  constructor(private db: AngularFirestore) {
    super();
    this.setCollection(db.collection<Model>('Model'));
  }
}
```  
## What do you get

### Get
```
service.get('ID');
```
Using this method it is possible to get a specific document from the collection using the specified id. All methods are developed to add the firebase identifier to the id-property of the model. So you can just use model.id to get the id that is used as an argument in this method.

### GetAll
```
service.getAll();
```
Use the getAll method to get all documents from the collection.

### Add
```
service.add(model: Model);
```
Adds the new document to the collection. Returns the document including the new id. It is not possible to prefill the id property when adding the model to the collection. Therefore the id property will always be deleted before uploading the model to the collection.

### Update
```
service.update(model: Model);
```
Updates the model in the firestore collection. Returns the document.

### Delete
```
service.delete(model: Model);
```
Deletes model from the collection. Returns empty observable.

### ConvertItem
```
protected convertItem(item: any): Model {
    return convertYourItemHere();
}
```
All items are converted using the convertItem method of the FirebaseStoreService. The only thing this initially does is return the same item, but you are able to overwrite this method in your class using above example. Use this for example to convert strings to dates or any other conversion you need to convert your backend model to something you can use in the frontend.

### Using a sub-collection
```
import { Injectable } from '@angular/core';
import { FirebaseStoreService } from '@ternwebdesign/firebase-store';
import { Model } from '../models/model.model';
import { Parent } from '../models/parent.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { ParentCollectionService } from '../core/parent-collection.service';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends FirebaseStoreService<Model> {

  constructor(private db: AngularFirestore, 
              private parentCollectionService: ParentCollectionService) {
    super();
    this.parentCollectionService.selected()
        .subscribe(selectedId => this.setCollection(
            db.doc<Parent>(`Parent/${selectedId}`)
            .collection<Model>('Model')))
  }
}
```
Getting a sub-collection is slightly more tricky since a sub-collection needs the doc/id of the specific parent. Somehow get the id of the parent collection and use this to get the sub-collection. Above you find an example of how we are getting the sub-collection for a selectedId from the parent collection It is only possible to add one collection to a service. 

### Extending the service
This service just adds the basic CRUD methods to your service. If you need anything else (query's for example) just use the AngularFirestore in you service to add any method you like on top of the existing methods. If you need a different implementation of a method, just overwrite the parents method and implement your own. 
