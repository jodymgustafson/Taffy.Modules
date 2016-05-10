module Storage
{
    /**
     * Defines the interface for async storage.
     * If storage is not supported by the browser these calls should fail silently.
     */
    export interface IAppStorageAsync
    {
        /**
         * Sets the raw value of an item (without converting it to json first).
         * Note: this only works on storage frameworks that support storing objects.
         * For other frameworks it will be the same as calling setValue without a replacer.
         * @param key Key
         * @param val Value
         * @param callback Optional function to call when saved
         */
        setItem(key: string, val: any, callback?: () => any): IAppStorageAsync;

        /**
         * Gets the raw value of an item (without parsing it from json).
         * Note: this only works on storage frameworks that support storing objects.
         * For other frameworks it will be the same as calling getValue without a reviver.
         * @param key Key
         * @param callback Fuction to call with the item. Value will be null if not found.
         */
        getItem<T>(key: string, callback: (data: T) => any): IAppStorageAsync;

        /**
         * Sets the value with the specified key converting it to json first (using the replacer)
         * @param key Key
         * @param val Value
         * @param callback Optional function to call when saved
         * @param replacer Optional replacer function to use when stringifying the value
         */
        setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): IAppStorageAsync;

        /**
         * Gets the value with the specified key parsing it from json (using the reviver)
         * @param key Key
         * @param callback Fuction to call with the value. Value will be null if not found.
         * @param reviver Optional reviver to use when parsing the JSON 
         */
        getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): IAppStorageAsync;

        /**
         * Removes the value with the specified key
         * @param key Key
         * @param callback Optional function to call when removed
         */
        remove(key: string, callback?: () => any): IAppStorageAsync;

        /**
         * Removes all values
         * @param callback Optional function to call when removed
         */
        removeAll(callback?: () => any): IAppStorageAsync;

        /**
         * Determines if the specified key has a value
         * @param key Key
         * @param callback Fuction to call with the result of the check.
         */
        contains(key: string, callback: (result: boolean) => any): IAppStorageAsync;

        /**
         * Gets all the keys, or optionally those that match a filter
         * @param filter Optional function that returns true if the key should be included in the result
         * @param callback Function to call with the array of keys. If none are found the list will be empty (never null).
         */
        getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): IAppStorageAsync;


        addStorageListener(callback: (evt: IStorageEventAsync) => any): IAppStorageAsync;
    }

    export interface IStorageEventAsync
    {
        key: string;
        oldValue: any;
        newValue: any;
        storageArea: string;
    }
}