/// <reference path="../../typings/globals/localforage/index.d.ts" />
import {default as localForage} from "localforage"
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService, BaseResource } from '../lib/types/standard' 

@Injectable()
export class LFCacheService implements CacheService{
    tables: string[] =  ["kv", "properties", "units", "formulas", "favorites", "globals", "fgs", "variables", "categories", "crs", "varvals"]
	dbs:{ [key:string]:LocalForage; } = {};
	constructor(){

	}

	init():Observable<any>{
        this.tables.forEach(i => {
		    this.dbs[i] =  localForage.createInstance({
                name: i
            });
        })
        return Observable.empty();
    }
	
    deleteItem(table:string, id:string):Observable<any>{
        return Observable.create(or => {
            this.dbs[table].removeItem(id).then(() => {
                or.complete();
            }).catch(err => {
                or.error(err);
            })
        })
	}

	deleteMany(table:string, ids:Array<string>):Observable<any>{
		let oles = ids.map(id => {
            let promise = this.dbs[table].removeItem(id);
            return Observable.fromPromise(promise)
        });
        return Observable.from(oles)
                        .map(i => i)
                        .concatAll();
	}

    addItem(item:BaseResource):Observable<any>{
        let table = item.getTable();
        return Observable.create(or => {
            this.dbs[table].setItem(item.id, item.getState()).then((val) => {
                or.complete();
            }).catch((err) => { or.error(err)})
        })
    }

    updateItem(item:BaseResource):Observable<any>{
        let table = item.getTable();
        return Observable.create(or => {
            this.dbs[table].setItem(item.id, item.getState()).then((val) => {
                or.complete();
            }).catch((err) => { or.error(err)})
        })
    }

    updateIds(table: string, idField: string, oldId: string, newId: any): Observable<any>{
        return Observable.create(or => {
            this.dbs[table].iterate((val , key, i) => {
                if(val[idField] == oldId){
                    val[idField]=newId
                    this.dbs[table].setItem(val.id, val);
                }
            }).then(() => {
                or.complete();
                }
            ).catch(err => {
                or.error(err);
            })
        })
    }

    updateMany(items:Array<BaseResource>, field:string, val:any):Observable<any>{
    	if(items.length == 0)
    		return Observable.empty();

		let oles = items.map(item => {
            let promise = this.dbs[item.getTable()].setItem(item.id, item);
            return Observable.fromPromise(promise)
        });
        return Observable.from(oles)
                        .map(i => i)
                        .concatAll();

    }

    selectAll(table:string):Observable<any>{
        let res = [];
    	return Observable.create(or => {
            this.dbs[table].iterate((val , key, i) => {
                res.push(val)
            }).then(() => {
                or.next({rows: res})
                or.complete();
                }
            ).catch(err => {
                or.error(err);
            })
        })
    }

	selectAllByUserIds(table:string, ids:Array<number>):Observable<any>{
        let res = [];
        return Observable.create(or => {
            this.dbs[table].iterate((val , key, i) => {
                if(ids.indexOf(val["user_id"]) > -1)
                    res.push(val)
            }).then(() => {
                or.next({rows: res})
                or.complete();
                }
            ).catch(err => {
                or.error(err);
            })
        })
    }

    setKV(key:string, value:string):Observable<any>{
        let promise = this.dbs["kv"].setItem(key, value);
        return Observable.from(promise);
    }

    getKV(key:string ):Observable<any>{
    	let promise = this.dbs["kv"].getItem(key);
        return Observable.from(promise);
    }
}    