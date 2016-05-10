/// <reference path="iappstorageasync.ts" />
"use strict";

export class AppStorageAsync implements Storage.IAppStorageAsync
{
    private _prefix = "";
    private static _isAvailable = Boolean(("localStorage" in window) && window["localStorage"]);

    /** Used to determine if local storage available */
    public static get isAvailable(): boolean
    {
        return AppStorageAsync._isAvailable;
    }

    /** @param appName Name of the application(optional) */
    constructor(appName?: string)
    {
        this._prefix = (appName ? appName + "." : "");
    }

    /** Gets the prefix that is prepended to each key */
    public prefix(): string { return this._prefix; }

    /**
        * Sets the value with the specified key into localStorage.
        * @param key Key
        * @param val Value
        * @param callback Optional function to call when saved
        * @param replacer Optional replacer function to use when stringifying the value
        */
    public setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            localStorage.setItem(this._prefix + key, JSON.stringify(val, replacer));
        }
        if (callback) callback();
        return this;
    }

    /**
        * Gets the value with the specified key from localStorage
        * @key Key
        * @callback Fuction to call with the value. Value will be null if not found.
        * @reviver Optional reviver to use when parsing the JSON 
        */
    public getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            let item = this.getRawItem(key);
            callback(item != null ? JSON.parse(item, reviver) : null);
        }
        else
        {
            callback(null);
        }
        return this;
    }

    /**
        * Sets the value with the specified key into localStorage.
        * Note: For localstorage this is the same as calling setValue without a replacer.
        * @param key Key
        * @param val Value
        * @param callback Optional function to call when saved
        * @param replacer Optional replacer function to use when stringifying the value
        */
    public setItem(key: string, val: any, callback?: () => any): AppStorageAsync
    {
        return this.setValue(key, val, callback);
    }

    /**
        * Gets the raw value of an item from localStorage without parsing it.
        * Note: For localstorage this is the same as calling getValue without a reviver.
        * @callback Fuction to call with the item. Value will be null if not found.
        */
    public getItem<T>(key: string, callback: (data: T) => any): AppStorageAsync
    {
        return this.getValue<T>(key, callback);
    }

    /** Removes the value with the specified key */
    public remove(key: string, callback?: () => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            localStorage.removeItem(this._prefix + key);
        }
        if (callback) callback();
        return this;
    }

    /** Removes all items associated with the app */
    public removeAll(callback?: () => any): AppStorageAsync
    {
        this.getKeys((keys: string[]) =>
        {
            for (var i in keys)
            {
                this.remove(keys[i]);
            }
            if (callback) callback();
        });
        return this;
    }

    /**
        * Determines if the specified key has a value in localStorage
        * @callback Fuction to call with the result.
        */
    public contains(key: string, callback: (result: boolean) => any): AppStorageAsync
    {
        var item: string;
        if (AppStorageAsync.isAvailable)
        {
            item = this.getRawItem(key);
        }
        callback(item !== null);
        return this;
    }

    /**
        * Gets the keys from localStorage for the application that optionally match a filter
        * @param filter: (Optional) A function that returns true if the key should be included in the result
        * @callback Fuction to call with the list of keys. If none are found the list will be empty (not null).
        */
    public getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): AppStorageAsync
    {
        var keys: string[] = [];
        if (AppStorageAsync.isAvailable)
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

        callback(keys);
        return this;
    }

    private getRawItem(key: string): string
    {
        return localStorage.getItem(this._prefix + key);
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
    public addStorageListener(callback: (evt: Storage.IStorageEventAsync) => any): AppStorageAsync
    {
        addEventListener("storage", (ev: StorageEvent) =>
        {
            callback({
                key: ev.key,
                oldValue: ev.oldValue,
                newValue: ev.newValue,
                storageArea: "localstorage",
            });
        });
        return this;
    }
}