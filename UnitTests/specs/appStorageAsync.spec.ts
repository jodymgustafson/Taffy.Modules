/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import {IAppStorageAsync} from "../../src/storage/IAppStorageAsync";
import {AppStorageAsync} from "../../src/storage/AppStorageAsync";
import * as ChromeStorage from "../../src/storage/Chrome.AppStorageAsync";

describe("AppStorageAsync", () =>
{
    function addTest(testName: string, appStorage: IAppStorageAsync)
    {
        describe(testName, () =>
        {
            beforeAll(() => appStorage.removeAll());
            afterAll(() => appStorage.removeAll());

            describe("When a string is added", () =>
            {
                testAddAndGet("testAddString");
            });

            describe("When an number is added", () =>
            {
                testAddAndGet(12345.67);
            });

            describe("When a boolean is added", () =>
            {
                testAddAndGet(true);
            });

            describe("When an array is added", () =>
            {
                testAddAndGet(["a", "b", "c"]);
            });

            describe("When an object is added", () =>
            {
                testAddAndGet({
                    a: 1,
                    b: "two",
                    c: false
                });
            });

            describe("When an object is added with a replacer", () =>
            {
                it("should get value that was set with a reviver", () =>
                {
                    testAddObjectWithReplacer();
                });
            });

            describe("When an item is added", () =>
            {
                testContains();
            });

            describe("When an item is removed", () =>
            {
                it("should remove item", () =>
                {
                    testRemove();
                });
            });

            describe("When get keys using a filter", () =>
            {
                it("should get keys that match the filter", () =>
                {
                    testGetKeys();
                });
            });
        });

        function testRemove(): void
        {
            let key = "testRemove";
            appStorage.setItem(key, {});
            appStorage.remove(key);
            appStorage.contains(key, result => expect(result).toBe(false));
        }

        function testGetKeys(): void
        {
            let key = "testGetKeys";
            appStorage.setItem(key + "a", {});
            appStorage.setItem(key + "b", {});
            appStorage.setItem(key + "c", {});
            appStorage.getKeys(keys =>
            {
                expect(keys).toEqual(["testGetKeysa", "testGetKeysb", "testGetKeysc"]);
            },
                k => k.indexOf(key) === 0);
        }

        function testContains(): void
        {
            let key = "testContains";
            it("should contain the key", () =>
            {
                appStorage.setItem(key, {});
                appStorage.contains(key, result => expect(result).toBe(true));
            });
            it("should not contain the key that wasn't used", () =>
            {
                appStorage.setItem(key, {});
                appStorage.contains(key + "x", result => expect(result).toBe(false));
            });
        }
        
        function testAddAndGet<T>(testValue: T): void
        {
            let key = "testAddItem_" + typeof testValue;

            it("should get item that was set", () =>
            {
                appStorage.setItem(key, testValue, () =>
                {
                    appStorage.getItem<T>(key, s => expect(s).toEqual(testValue));
                });
            });

            it("should get value that was set", () =>
            {
                appStorage.setValue(key, testValue, () =>
                {
                    appStorage.getValue<T>(key, s => expect(s).toEqual(testValue));
                });
            });
        }

        function testAddObjectWithReplacer(): void
        {
            let obj = {
                a: 1,
                b: false
            };

            let key = "testAddObject";
            appStorage.setValue(key, obj, () =>
            {
                // test without a reviver
                appStorage.getValue<any>(key, s =>
                {
                    expect(s.a).toEqual(obj.a);
                    expect(s.b).toEqual(true);
                });

                // test with a reviver
                appStorage.getValue<any>(key, s =>
                {
                    expect(s.a).toEqual(obj.a);
                    expect(s.b).toEqual(false);
                },
                    (k, v) =>
                    {
                        if (k === "b") return false;
                        return v;
                    }
                );
            },
                (k, v) =>
                {
                    if (k === "b") return true;
                    return v;
                });
        }
    }

    class MockChromeStorage
    {
        private map = {};
        public set(items: any, callback?: () => any)
        {
            for (let i in items)
            {
                this.map[i] = items[i];
            }
            if (callback) callback();
        }
        public get(key: string, callback: (v: any) => any)
        {
            if (key === null)
            {
                callback(this.map);
            }
            else
            {
                let data = {};
                if (this.map.hasOwnProperty(key))
                {
                    data[key] = this.map[key];
                }
                callback(data);
            }
        }
        public remove(key: string, callback?: () => any)
        {
            delete this.map[key];
            if (callback) callback();
        }
    }

    function getChromeStorage(): ChromeStorage.AppStorageAsync
    {
        var chrome = (window["chrome"] = window["chrome"] || {});
        chrome.storage = chrome.storage || {};
        chrome.storage.local = chrome.storage.local || new MockChromeStorage();
        ChromeStorage.chromeStorage = chrome.storage;
        let storage = new ChromeStorage.AppStorageAsync(ChromeStorage.AppStorageType.local, "TaffyUnitTests");
        return storage;
    }

    addTest("System.AppStorageAsync", new AppStorageAsync("TaffyUnitTests"));
    addTest("Chrome.AppStorage", getChromeStorage());
});
