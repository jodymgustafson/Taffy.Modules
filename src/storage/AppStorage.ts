var _isAvailable = Boolean(("localStorage" in window) && window["localStorage"]);
/** Used to determine if local storage available */
export function isAvailable(): boolean
{
    return _isAvailable;
}

/**
* Wrapper for localstorage that optionally prefixes all keys with the app name
*/
export class AppStorage
{
    private _prefix = "";
    /** Used to determine if local storage available */
    public static get isAvailable(): boolean
    {
        return isAvailable();
    }

    /** @param appName Name of the application(optional) */
    constructor(appName?: string)
    {
        this._prefix = (appName ? appName + "." : "");
    }

    /** Gets the prefix that is prepended to each key */
    public get prefix() { return this._prefix; }

    /**
        * Sets the value with the specified key into localStorage.
        * @param key Key
        * @param val Value
        * @param replacer Replacer function to use when stringifying the value
        */
    public setValue(key: string, val: any, replacer?: (key: string, value: any) => any): AppStorage
    {
        if (AppStorage.isAvailable)
        {
            localStorage.setItem(this._prefix + key, JSON.stringify(val, replacer));
        }
        return this;
    }

    /**
        * Gets the value with the specified key from localStorage
        * @returns The value or null if not found
        */
    public getValue<T>(key: string, reviver?: (key: any, value: any) => any): T
    {
        if (AppStorage.isAvailable)
        {
            var item = this.getItem(key);
            return item != null ? JSON.parse(item, reviver) : null;
        }
        return null;
    }

    /**
        * Gets the raw value of an item from localStorage without parsing it
        * @returns The value or null if not found
        */
    public getItem(key: string): string
    {
        return (AppStorage.isAvailable ? localStorage.getItem(this._prefix + key) : null);
    }

    /** Removes the value with the specified key */
    public remove(key: string): AppStorage
    {
        if (AppStorage.isAvailable)
        {
            localStorage.removeItem(this._prefix + key);
        }
        return this;
    }

    /** Removes all items associated with the app */
    public removeAll(): AppStorage
    {
        var keys = this.getKeys();
        for (var i in keys)
        {
            this.remove(keys[i]);
        }
        return this;
    }

    /**
        * Determines if the specified key has a value in localStorage
        * @returns True if the key has a value
        */
    public contains(key: string): boolean
    {
        return this.getItem(key) !== null;
    }

    /**
        * Gets the keys from localStorage for the application that optionally match a filter
        * @param filter: (Optional) A function that returns true if the key should be included in the result
        * @returns An array of keys
        */
    public getKeys(filter?: (key: string) => boolean): string[]
    {
        var keys: string[] = [];
        if (AppStorage.isAvailable)
        {
            for (var key in localStorage)
            {
                if (this.isAppKey(key))
                {
                    // Remove the prefix from the key
                    if (this._prefix) key = key.slice(this._prefix.length);
                    // Check the filter
                    if (!filter || filter(key))
                    {
                        keys.push(key);
                    }
                }
            }
        }

        return keys;
    }

    private isAppKey(key: string): boolean
    {
        if (this._prefix)
        {
            return key.indexOf(this._prefix) === 0;
        }
        return true;
    }

    /** Adds a storage event handler */
    public addStorageListener(callback: (evt: StorageEvent) => any, useCapture?: boolean): AppStorage
    {
        addEventListener("storage", callback, useCapture);
        return this;
    }
}