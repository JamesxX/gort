import condition from "../condition.class";
import { listable } from "../properties.class";
import Snoowrap from "snoowrap";

export class arrayIncludes extends condition{

    private _lhs: listable;
    private _rhs: listable

    public constructor(lhs: listable, rhs: listable){
        super()
        this._lhs = lhs;
        this._rhs = rhs
    }

    public override execute(user: Snoowrap.RedditUser, target: Snoowrap.Comment | Snoowrap.Submission): boolean {
        return this._lhs.execute(user, target) == this._rhs.execute(user, target)
    }

}