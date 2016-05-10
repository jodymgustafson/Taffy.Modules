/**
* Implements a typed map where the key is a string
*/
export class Map<V>
{
    private _map = {};

    public setItem(key: string, value: V): void
    {
        this._map[key] = value;
    }

    public getItem(key: string): V
    {
        return this._map[key];
    }

    public removeItem(key: string): void
    {
        delete this._map[key];
    }

    public clear(): void
    {
        this._map = {};
    }

    public containsKey(key: string): boolean
    {
        return (this._map[key] !== undefined);
    }

    public each(callback: (item: V, key: string, map: Map<V>) => any): void
    {
        for (var name in this._map)
        {
            callback(this._map[name], name, this);
        }
    }

    public eachKey(callback: (key: string) => any): void
    {
        for (var name in this._map)
        {
            callback(name);
        }
    }
}
