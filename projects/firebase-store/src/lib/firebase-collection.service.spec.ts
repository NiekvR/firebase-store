import { FirebaseCollectionService } from './firebase-collection.service';
import { of } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { skip } from 'rxjs/operators';
import createSpy = jasmine.createSpy;

describe('FirebaseCollectionService', () => {
  let service: TestService;

  const id = 'id1';
  const input: User[] = [
    {name: 'Fred', lastName: 'Janssen'}
  ];
  const user = input[0];
  user.id = id;

  const data = () => input[0];

  const dataMock = {
    data,
    id
  };

  const docMock = {
    get: jasmine.createSpy('get').and.returnValue(of(dataMock)),
    update: jasmine.createSpy('update').and.returnValue(of({})),
    delete: jasmine.createSpy('delete').and.returnValue(of({})),
  };

  const collectionStub = {
    snapshotChanges: jasmine.createSpy('snapshotChanges').and.returnValue(of([{payload: {doc: dataMock}}])),
    doc: jasmine.createSpy('doc').and.returnValue(docMock),
    add: jasmine.createSpy('doc').and.returnValue(of(docMock)),
  };

  const newCollectionData = {name: 'Jojo', lastName: 'Visser'};

  const dataMockNewCollection = {
    data: () => newCollectionData,
    id: 'id2'
  };

  const docMockNewCollection = {
    get: jasmine.createSpy('get').and.returnValue(of(dataMockNewCollection)),
  };

  const newCollectionStub = {
    snapshotChanges: jasmine.createSpy('snapshotChanges').and.returnValue(of([{payload: {doc: dataMockNewCollection}}])),
    doc: jasmine.createSpy('doc').and.returnValue(docMockNewCollection),
  };

  beforeEach(() => {
    service = new TestService(collectionStub as unknown as AngularFirestoreCollection<User>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get document', () => {
    service.get('id')
      .subscribe(result => {
        expect(result.id).toEqual(id);
        expect(result.name).toEqual(input[0].name);
        expect(result.lastName).toEqual(input[0].lastName);

        expect(collectionStub.doc).toHaveBeenCalledWith('id');
      });
  });

  it('should get all documents', () => {
    service.getAll()
      .subscribe(result => {
        expect(result.length).toEqual(1);

        expect(result[0].id).toEqual(id);
        expect(result[0].name).toEqual(input[0].name);
        expect(result[0].lastName).toEqual(input[0].lastName);
      });
  });

  it('should add new document', () => {
    service.add(user)
      .subscribe(result => {
        expect(collectionStub.add).toHaveBeenCalledWith(input[0]);

        expect(result.id).toEqual(id);
        expect(result.name).toEqual(input[0].name);
        expect(result.lastName).toEqual(input[0].lastName);
      });
  });

  it('should update document', () => {
    service.update(user)
      .subscribe(result => {
        expect(collectionStub.doc).toHaveBeenCalledWith(id);
        expect(docMock.update).toHaveBeenCalledWith(user);

        expect(result.id).toEqual(id);
        expect(result.name).toEqual(user.name);
        expect(result.lastName).toEqual(user.lastName);
      });
  });

  it('should delete document', () => {
    service.delete(user)
      .subscribe(() => {
        expect(collectionStub.doc).toHaveBeenCalledWith(id);
        expect(docMock.delete).toHaveBeenCalled();
      });
  });

  it('should change collection', () => {
    service.changeCollection(newCollectionStub as unknown as AngularFirestoreCollection<User>);

    service.get('id2')
      .subscribe(result => {
        expect(result.id).toEqual(dataMockNewCollection.id);
        expect(result.name).toEqual(newCollectionData.name);
        expect(result.lastName).toEqual(newCollectionData.lastName);
      });
  });

  it('should return new collection items when changing collection', () => {
    service.getAll()
      .pipe(skip(1))
      .subscribe(result => {
        expect(result[0].id).toEqual(dataMockNewCollection.id);
        expect(result[0].name).toEqual(newCollectionData.name);
        expect(result[0].lastName).toEqual(newCollectionData.lastName);
      });

    service.changeCollection(newCollectionStub as unknown as AngularFirestoreCollection<User>);
  });

  it('should return empty array when no collection available and getting all documents', () => {
    service.changeCollection(null as unknown as AngularFirestoreCollection<User>);

    service.getAll()
      .pipe()
      .subscribe(result => expect(result.length).toEqual(0));
  });

  it('should throw error when no collection available and getting specific document', () => {
    const success = createSpy('success');
    const error = createSpy('error').and.callFake(err => expect(err.message).toEqual('Collection does not exist'));

    service.changeCollection(null as unknown as AngularFirestoreCollection<User>);

    service.get('id1')
      .pipe()
      .subscribe(
        () => success(),
        err => error(err));

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });
});

interface User {
  id?: string;
  name: string;
  lastName: string;
}

class TestService extends FirebaseCollectionService<User> {
  constructor(private collectionStub: AngularFirestoreCollection<User>) {
    super();
    this.setCollection(collectionStub);
  }

  public changeCollection(collectionStub: AngularFirestoreCollection<User>): void {
    this.setCollection(collectionStub);
  }
}
