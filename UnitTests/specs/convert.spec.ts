/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import * as Convert from "../../src/Convert";

describe("Convert", () =>
{
    it("should be able to convert to string", () =>
    {
        expect(Convert.toString(1.0)).toBe("1");
        expect(Convert.toString(null)).toBe("");
        expect(Convert.toString(void(0))).toBe("");
    });

    it("should be able to convert to camel case", () =>
    {
        expect(Convert.toCamelCase("")).toBe("");
        expect(Convert.toCamelCase("foo")).toBe("foo");
        expect(Convert.toCamelCase("foo-bar")).toBe("fooBar");
        expect(Convert.toCamelCase("foo-bar-baz")).toBe("fooBarBaz");
    });
});