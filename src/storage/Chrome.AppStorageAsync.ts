/// <reference path="iappstorageasync.ts" />
"use strict";

export enum AppStorageType
{
    sync, local, managed
}

interface StorageArea
{
    get(key: string, callback: (data: any) => any): void;
    get(keys: string[], callback: (data: any) => any): void;
    get(key: any, callback: (data: any) => any): void;
    set(items: any, callback?: () => any);
    remove(key: string, callback?: () => any): void;
    remove(keys: string[], callback?: () => any): void;
}

/**
    * Wraps Chrome storage to comply with the System.IAppStorageAsync interface.
    * Note: Chrome storage saves objects so you don't need to convert objects to json first.
    * Therefore you could use 
    */
export class AppStorageAsync implements Storage.IAppStorageAsync
{
    private static _chromeStorage = window["chrome"] ? window["chrome"]["storage"] : null;
    private static _isAvailable = Boolean(AppStorageAsync._chromeStorage);

    private _storageType: AppStorageType;
    private _storageArea: StorageArea;
    private _prefix = "";

    /** Used to determine if chrome storage available */
    public static get isAvailable(): boolean
    {
        return AppStorageAsync._isAvailable;
    }

    /** @param appName Name of the application(optional) */
    constructor(storageType: AppStorageType, appName?: string)
    {
        if (AppStorageAsync.isAvailable)
        {
            this._storageType = storageType;
            this._storageArea = AppStorageAsync._chromeStorage[AppStorageType[storageType]];
            this._prefix = (appName ? appName + "." : "");
        }
    }

    /** Gets the prefix that is prepended to each key */
    public get prefix() { return this._prefix; }

    /**
        * Sets the value with the specified key into this._storageArea as json.
        * @param key Key
        * @param val Value
        * @param callback Optional function to call when saved
        * @param replacer Optional replacer function to use when stringifying the value
        */
    public setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): AppStorageAsync
    {
        return this.setItem(key, JSON.stringify(val, replacer), callback);
    }

    /**
        * Gets the value with the specified key from this._storageArea and parses its json using the reviver
        * @key Key
        * @callback Fuction to call with the value. Value will be null if not found.
        * @reviver Optional reviver to use when parsing the JSON 
        */
    public getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            return this.getItem<T>(key, item =>
            {
                let v = item;
                if (item != null && typeof item === "string")
                {
                    v = JSON.parse(<any>item, reviver);
                }
                callback(v);
            });
        }
        else
        {
            callback(null);
        }
    }

    /**
        * Sets the value with the specified key into this._storageArea without converting to json first.
        * @param key Key
        * @param val Value
        * @param callback Optional function to call when saved
        */
    public setItem(key: string, val: any, callback?: () => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            key = this._prefix + key;
            let items = {};
            items[key] = val;
            this._storageArea.set(items, callback);
        }
        else
        {
            if (callback) callback();
        }
        return this;
    }

    /**
        * Gets the raw value of an item from this._storageArea without parsing it
        * @callback Fuction to call with the value. Value will be null if not found.
        */
    public getItem<T>(key: string, callback: (val: T) => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            // Note: In chrome the value returned is wrapped in an object, so we need to unwrap it
            key = this._prefix + key;
            this._storageArea.get(key, data =>
            {
                let v = (data.hasOwnProperty(key) ? data[key] : null);
                callback(v);
            });
        }
        else
        {
            if (callback) callback(null);
        }
        return this;
    }

    /** Removes the value with the specified key */
    public remove(key: string, callback?: () => any): AppStorageAsync
    {
        if (AppStorageAsync.isAvailable)
        {
            this._storageArea.remove(this._prefix + key, callback);
        }
        else
        {
            if (callback) callback();
        }
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
        * Determines if the specified key has a value in this._storageArea
        * @callback Fuction to call with the result.
        */
    public contains(key: string, callback: (result: boolean) => any): AppStorageAsync
    {
        this.getItem(key, item => callback(item !== null));
        return this;
    }

    /**
        * Gets the keys from this._storageArea for the application that optionally match a filter
        * @param filter: (Optional) A function that returns true if the key should be included in the result
        * @param callback Function to call with the array of keys. If none are found the list will be empty (never null).
        */
    public getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): AppStorageAsync
    {
        var keys: string[] = [];
        if (AppStorageAsync.isAvailable)
        {
            this._storageArea.get(null, allKeys =>
            {
                for (var key in allKeys)
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
                callback(keys);
            });
        }
        else
        {
            callback(keys);
        }

        return this;
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
        if (AppStorageAsync.isAvailable)
        {
            AppStorageAsync._chromeStorage.onChanged.addListener((changes: any, storageType: string) =>
            {
                for (let key in changes)
                {
                    var change = changes[key];
                    callback({
                        key: key,
                        oldValue: change.oldValue,
                        newValue: change.newValue,
                        storageArea: storageType,
                    });
                }
            });
        }
        return this;
    }
}
