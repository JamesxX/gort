import { conditional, executable, executableArguments } from "../condition.class";
import Snoowrap from "snoowrap";
import { logging } from '../logging';

const logger = logging.getLogger('core.conditionals.logic');

export class and extends executable<boolean>{
    private _conditionsType : 'executable<boolean>[]' | 'executable<boolean[]>';
    private _conditions: executable<boolean>[] | executable<boolean[]>;
    public constructor(first: executable<boolean> | executable<boolean[]>, ...remainder: executable<boolean>[]){
        super();
        if ( !Array.isArray(first) ){
            this._conditions = [ (<executable<boolean>>first), ...remainder];
            this._conditionsType = 'executable<boolean>[]';
        }else{
            this._conditions = first;
            this._conditionsType = 'executable<boolean[]>';
            if ( remainder.length > 0 ){
                logger.error("`And` predicate is malformed, arg2.length > 0")
            }
        }
    }
    public override execute(args: executableArguments): Promise<boolean> {

        if ( this._conditionsType == 'executable<boolean>[]' ) {
            // Build promise array
            let promiseArray: Promise<boolean>[] = [];
            for (let condition of <executable<boolean>[]>this._conditions) {
                promiseArray.push(condition.execute(args))
            }

            // Build return promise
            return new Promise<boolean>((resolve, reject) => {
                Promise.all(promiseArray).then((results) => { resolve(this.logic(results))}).catch((reason) => { reject(reason) })
            })
        } else { // this._conditionsType == 'executable<boolean[]>'
            return new Promise<boolean>( async (resolve, reject) => {
                resolve(this.logic( await (<executable<boolean[]>>this._conditions).execute(args) ))
            })
        }
    }
    private logic(results: boolean[]) : boolean{
        return results.reduce((previous, current) => previous && current)
    }
}

export class or extends executable<boolean>{
    private _conditionsType : 'executable<boolean>[]' | 'executable<boolean[]>';
    private _conditions: executable<boolean>[] | executable<boolean[]>;
    public constructor(first: executable<boolean> | executable<boolean[]>, ...remainder: executable<boolean>[]){
        super();
        if ( !Array.isArray(first) ){
            this._conditions = [ (<executable<boolean>>first), ...remainder];
            this._conditionsType = 'executable<boolean>[]';
        }else{ // this._conditionsType == 'executable<boolean[]>'
            this._conditions = first;
            this._conditionsType = 'executable<boolean[]>';
            if ( remainder.length > 0 ){
                logger.error("`Or` predicate is malformed, arg2.length > 0")
            }
        }
    }
    public override execute(args: executableArguments): Promise<boolean> {

        if ( this._conditionsType == 'executable<boolean>[]' ) {
            // Build promise array
            let promiseArray: Promise<boolean>[] = [];
            for (let condition of <executable<boolean>[]>this._conditions) {
                promiseArray.push(condition.execute(args))
            }

            // Build return promise
            return new Promise<boolean>((resolve, reject) => {
                Promise.all(promiseArray).then((results) => { resolve(this.logic(results))}).catch((reason) => { reject(reason) })
            })
        } else { // this._conditionsType == 'executable<boolean[]>'
            return new Promise<boolean>( async (resolve, reject) => {
                resolve(this.logic( await (<executable<boolean[]>>this._conditions).execute(args) ))
            })
        }
    }
    private logic(results: boolean[]) : boolean{
        return results.reduce((previous, current) => previous || current)
    }
}

export class not extends executable<boolean> {
    private _rhs: executable<boolean>;
    public constructor(rhs: executable<boolean>) {
        super();
        this._rhs = rhs;
    }
    public override execute(args: executableArguments): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._rhs.execute(args).then((result: boolean) => { resolve(!result) }).catch((reason) => { reject(reason) })
        })
    }
}

export class notArray extends executable<boolean[]> {
    private _conditionsType : 'executable<boolean>[]' | 'executable<boolean[]>';
    private _conditions: executable<boolean>[] | executable<boolean[]>;
    public constructor(first: executable<boolean> | executable<boolean[]>, ...remainder: executable<boolean>[]){
        super();
        if ( !Array.isArray(first) ){
            this._conditions = [ (<executable<boolean>>first), ...remainder];
            this._conditionsType = 'executable<boolean>[]';
        }else{
            this._conditions = first;
            this._conditionsType = 'executable<boolean[]>';
            if ( remainder.length > 0 ){
                logger.error("`Not` predicate is malformed, arg2.length > 0")
            }
        }
    }
    public override execute(args: executableArguments) : Promise<boolean[]> {
        if ( this._conditionsType == 'executable<boolean>[]' ) {
            // Build promise array
            let promiseArray: Promise<boolean>[] = [];
            for (let condition of <executable<boolean>[]>this._conditions) {
                promiseArray.push(condition.execute(args))
            }

            // Build return promise
            return new Promise<boolean[]>((resolve, reject) => {
                Promise.all(promiseArray).then((results) => { 
                    resolve(this.logic(results))
                }).catch((reason) => { reject(reason) })
            })
        } else { // this._conditionsType == 'executable<boolean[]>'
            return new Promise<boolean[]>( async (resolve, reject) => {
                resolve(this.logic( await (<executable<boolean[]>>this._conditions).execute(args) ))
            })
        }
    }
    private logic(results: boolean[]) : boolean[]{
        return results.map( value => !value )
    }
}
