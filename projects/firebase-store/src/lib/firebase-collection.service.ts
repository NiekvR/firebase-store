import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AngularFirestoreCollection, DocumentSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCollectionService<T> {
  private collection = new BehaviorSubject<AngularFirestoreCollection<T>>(null as unknown as AngularFirestoreCollection<T>);

  constructor() {
  }

  public get(id: string): Observable<T> {
    return this.getCurrentCollection()
      .pipe(
        switchMap(col => col.doc<T>(id).get()),
        map(doc => this.convertDocToItem(doc as DocumentSnapshot<T>)));
  }

  public getAll(): Observable<T[]> {
    return this.getCollection$()
      .pipe(
        switchMap(col => !!col ? col.snapshotChanges() : of([])),
        map(list => list.map(documentChangeAction =>
          this.convertDocToItem(documentChangeAction.payload.doc as DocumentSnapshot<T>))));
  }

  public add(item: T): Observable<T> {
    delete (item as any).id;
    return this.getCurrentCollection()
      .pipe(
        switchMap(col => col.add(item)),
        switchMap(document => from(document.get())),
        map(doc => this.convertDocToItem(doc as DocumentSnapshot<T>)));
  }

  public update(item: T): Observable<T> {
    return this.getCurrentCollection()
      .pipe(
        switchMap(col => col.doc((item as any).id).update(item)),
        map(() => item));
  }

  public delete(item: T): Observable<void> {
    return this.getCurrentCollection()
      .pipe(switchMap(col => col.doc((item as any).id).delete()));
  }

  protected convertItem(item: any): T {
    return item;
  }

  protected setCollection(collection: AngularFirestoreCollection<T>): void {
    this.collection.next(collection);
  }

  private getCollection$(): Observable<AngularFirestoreCollection<T>> {
    return this.collection.asObservable();
  }

  private getCurrentCollection(): Observable<AngularFirestoreCollection<T>> {
    return this.getCollection$()
      .pipe(take(1), switchMap(col => !!col ? of(col) : throwError(new Error('Collection does not exist'))));
  }

  private convertDocToItem(doc: DocumentSnapshot<T>): T {
    let item = doc.data() as T;
    (item as any).id = doc.id;
    item = this.convertItem(item);
    return item;
  }
}
