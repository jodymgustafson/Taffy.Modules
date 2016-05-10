import {IAsyncAction} from "./AsyncAction";
"use strict";

/**
* Used to track the progress of any number of async actions, usually loading external resources.
* Usage: import {AsyncActionTracker} from "../../src/AsyncActionTracker";
*/
export class AsyncActionTracker<T extends IAsyncAction>
{
    constructor()
    {
    }

    private internal = {
        totalCount: 0,
        loadedCount: 0,
        errorCount: 0
    };
    private callbacks = {
        actionCompleted: (action: T, tracker: AsyncActionTracker<T>) => void (0),
        actionError: (action: T, errmsg: string, tracker: AsyncActionTracker<T>) => void (0),
        done: (tracker: AsyncActionTracker<T>, hasErrors?: boolean) => void (0)
    };

    /** Percentage of actions that have been completed (including errors), between 0 and 1 */
    public get percentComplete(): number
    {
        return (this.internal.loadedCount + this.internal.errorCount) / this.internal.totalCount;
    }
    /** Total number of actions being tracked */
    public get totalCount(): number
    {
        return this.internal.totalCount;
    }
    /** Total number of actions that have been successfully completed */
    public get completedCount(): number
    {
        return this.internal.loadedCount;
    }
    /** Total number of actions that have errored out */
    public get errorCount(): number
    {
        return this.internal.errorCount;
    }
    /** Used to determine if all actions have been completed */
    public get isDone(): boolean
    {
        return this.internal.loadedCount + this.internal.errorCount === this.internal.totalCount;
    }

    /** Adds any number of actions to the tracker and starts them */
    public addActions(...items: T[]): AsyncActionTracker<T>
    {
        items.forEach((item) => this.addAction(item));
        return this;
    }

    /** Adds one action to the tracker and starts it */
    public addAction(item: T): AsyncActionTracker<T>
    {
        this.internal.totalCount++;

        item.onCompleted(() =>
        {
            this.internal.loadedCount++;
            this.callbacks.actionCompleted(item, this);
            if (this.isDone)
            {
                this.callbacks.done(this, this.internal.errorCount > 0);
            }
        })
        .onError((action, errmsg) =>
        {
            this.internal.errorCount++;
            this.callbacks.actionError(item, errmsg, this);
            if (this.isDone)
            {
                this.callbacks.done(this, this.internal.errorCount > 0);
            }
        })
        .start();

        return this;
    }

    /** Sets the function to be called when an action is successfully completed */
    public actionComplete(callback: (item: T, tracker: AsyncActionTracker<T>) => any): AsyncActionTracker<T>
    {
        this.callbacks.actionCompleted = callback;
        return this;
    }

    /** Sets the function to call when an action errors out */
    public actionError(callback: (item: T, errmsg: string, tracker: AsyncActionTracker<T>) => any): AsyncActionTracker<T>
    {
        this.callbacks.actionError = callback;
        return this;
    }

    /** Sets the function to call when all actions have completed or errored out */
    public done(callback: (tracker: AsyncActionTracker<T>, hasErrors: boolean) => any): AsyncActionTracker<T>
    {
        this.callbacks.done = callback;
        return this;
    }
}
