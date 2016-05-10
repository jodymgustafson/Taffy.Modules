/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import {Map} from "../../src/collections/map";

describe("Collections.Map", () =>
{
    describe("Map of strings", () =>
    {
        let map: Map<string>;

        beforeEach(() =>
        {
            map = new Map<string>();
            map.setItem("item1", "value1");
            map.setItem("item2", "value2");
            map.setItem("item3", "value3");
        });

        it("should be able to find all keys", () =>
        {
            expect(map.containsKey("item1")).toBeTruthy();
            expect(map.containsKey("item2")).toBeTruthy();
            expect(map.containsKey("item3")).toBeTruthy();
            let count = 0;
            map.eachKey(() => count++);
            expect(count).toBe(3);
        });

        it("should be able to get all values", () =>
        {
            expect(map.getItem("item1")).toBe("value1");
            expect(map.getItem("item2")).toBe("value2");
            expect(map.getItem("item3")).toBe("value3");
        });

        it("should be able to iterate over all keys", () =>
        {
            let count = 0;
            map.eachKey(() => count++);
            expect(count).toBe(3);
        });

        it("should be able to iterate over all values", () =>
        {
            let count = 0;
            map.each(() => count++);
            expect(count).toBe(3);
        });

        it("should be able to remove items", () =>
        {
            map.removeItem("item1");
            expect(map.getItem("item1")).toBeUndefined();
            expect(map.getItem("item2")).toBe("value2");
            expect(map.getItem("item3")).toBe("value3");
            map.removeItem("item2");
            expect(map.getItem("item2")).toBeUndefined();
            expect(map.getItem("item3")).toBe("value3");
            map.removeItem("item3");
            expect(map.getItem("item3")).toBeUndefined();
        });

        it("should be able to clear all items", () =>
        {
            map.clear();
            expect(map.getItem("item1")).toBeUndefined();
            expect(map.getItem("item2")).toBeUndefined();
            expect(map.getItem("item3")).toBeUndefined();
        });
    });

    describe("Map of objects", () =>
    {
        let map: Map<ITestInterface>;

        beforeEach(() =>
        {
            map = new Map<ITestInterface>();
            map.setItem("item1", { a: "value1", b: 1 });
            map.setItem("item2", { a: "value2", b: 2 });
            map.setItem("item3", { a: "value3", b: 3 });
        });

        it("should be able to get all values", () =>
        {
            expect(map.getItem("item1")).toEqual({ a: "value1", b: 1 });
            expect(map.getItem("item2")).toEqual({ a: "value2", b: 2 });
            expect(map.getItem("item3")).toEqual({ a: "value3", b: 3 });
        });

        it("should be able to iterate over all values", () =>
        {
            let count = 0;
            map.each(() => count++);
            expect(count).toBe(3);
        });
    });

    interface ITestInterface
    {
        a: string;
        b: number;
    }
});