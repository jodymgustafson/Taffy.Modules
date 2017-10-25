export interface IAsyncAction
{
    /** Adds a function to be called when the action is completed */
    onCompleted: (callback: (action: IAsyncAction) => any) => IAsyncAction;
    /** Adds a function to be called when the action errors out */
    onError: (callback: (action: IAsyncAction, message: string) => any) => IAsyncAction;
    /** Called when the action should be started */
    start: () => IAsyncAction;
}

/**
* Abstract base class for building an async action with optional timeout.
* The start() method must be implemented.
* When the action is done it should call either complete() or error().
*/
export abstract class AsyncAction implements IAsyncAction
{
    private timeoutId = 0;
    private callbacks = {
        complete: <((action: AsyncAction) => any)[]>[],
        error: <((action: AsyncAction, message: string) => any)[]>[]
    };

    /** @param timeout (optional) Sets the number of ms before the action times out */
    constructor(timeout?: number)
    {
        if (timeout)
        {
            this.timeoutId = setTimeout(() =>
            {
                if (this.callbacks.error) this.error("Action timed out");
            }, timeout);
        }
    }

    /**
     *  Method to be called when the action should be started
     */
    abstract start(): AsyncAction;

    public onCompleted(callback: (action: AsyncAction) => any): AsyncAction
    {
        this.callbacks.complete.push(callback);
        return this;
    }

    public onError(callback: (action: AsyncAction, message: string) => any): AsyncAction
    {
        this.callbacks.error.push(callback);
        return this;
    }

    /** Method to be called when the action is complete */
    protected complete(): void
    {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.callbacks.complete.forEach((callback) => callback(this));
    }
    /** Method to be called when the action errors out */
    protected error(message: string): void
    {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.callbacks.error.forEach((callback) => callback(this, message));
    }
}
