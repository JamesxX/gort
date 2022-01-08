import { conditional, executableArguments } from "../condition.class";
import Snoowrap from "snoowrap";

export class and extends conditional {

    private _conditions: conditional[];

    public constructor(...args: conditional[]) {
        super();
        this._conditions = args;
    }

    public override execute(args: executableArguments): Promise<boolean> {
        // Build promise array
        let promiseArray: Promise<boolean>[] = [];
        for (let condition of this._conditions) {
            promiseArray.push(condition.execute(args))
        }

        // Build return promise
        return new Promise<boolean>((resolve, reject) => {
            Promise.all(promiseArray).then((results) => {
                for (let conditionResult of results) { if (!conditionResult) { resolve(false) } }
                resolve(true)
            }).catch((reason) => { reject(reason) })
        })
    }

}

export class or extends conditional {

    private _conditions: conditional[];

    public constructor(...args: conditional[]) {
        super();
        this._conditions = args;
    }

    public override execute(args: executableArguments): Promise<boolean> {
        // Build promise array
        let promiseArray: Promise<boolean>[] = [];
        for (let condition of this._conditions) {
            promiseArray.push(condition.execute(args))
        }

        // Build return promise
        return new Promise<boolean>((resolve, reject) => {
            Promise.all(promiseArray).then((results) => {
                for (let conditionResult of results) { if (conditionResult) { resolve(true) } }
                resolve(false)
            }).catch((reason) => { reject(reason) })
        })
    }


}

export class not extends conditional {

    private _rhs: conditional;

    public constructor(rhs: conditional) {
        super();
        this._rhs = rhs;
    }

    public override execute(args: executableArguments): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._rhs.execute(args).then((result: boolean) => { resolve(!result) }).catch((reason) => { reject(reason) })
        })
    }

}