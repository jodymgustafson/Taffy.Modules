/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import * as System from "../../src/System";

describe("System", () =>
{
    describe("isNullOrUndefined()", () =>
    {
        it("isNullOrUndefined(null) should be true", () => expect(System.isNullOrUndefined(null)).toBe(true));
        it("isNullOrUndefined(void(0)) should be true", () => expect(System.isNullOrUndefined(void(0))).toBe(true));
        it("isNullOrUndefined(true) should be false", () => expect(System.isNullOrUndefined(true)).toBe(false));
        it("isNullOrUndefined(false) should be false", () => expect(System.isNullOrUndefined(false)).toBe(false));
        it("isNullOrUndefined(0) should be false", () => expect(System.isNullOrUndefined(0)).toBe(false));
        it("isNullOrUndefined('') should be false", () => expect(System.isNullOrUndefined("")).toBe(false));
    });

    describe("isUndefined()", () =>
    {
        it("isUndefined(void(0)) should be true", () => expect(System.isUndefined(void (0))).toBe(true));
        it("isUndefined(null) should be false", () => expect(System.isUndefined(null)).toBe(false));
        it("isUndefined(false) should be false", () => expect(System.isUndefined(false)).toBe(false));
        it("isUndefined(0) should be false", () => expect(System.isUndefined(0)).toBe(false));
        it("isUndefined('') should be false", () => expect(System.isUndefined("")).toBe(false));
    });

    describe("isNumber()", () =>
    {
        it("isNumber(0) should be true", () => expect(System.isNumber(0)).toBe(true));
        it("isNumber(-1) should be true", () => expect(System.isNumber(-1)).toBe(true));
        it("isNumber(1.23456) should be true", () => expect(System.isNumber(1.23456)).toBe(true));
        it("isNumber(NaN) should be true", () => expect(System.isNumber(NaN)).toBe(true));
        it("isNumber(Infinity) should be true", () => expect(System.isNumber(Infinity)).toBe(true));
        it("isNumber('0') should be false", () => expect(System.isNumber("0")).toBe(false));
        it("isNumber(null) should be false", () => expect(System.isNumber(null)).toBe(false));
        it("isNumber(void(0)) should be false", () => expect(System.isNumber(void(0))).toBe(false));
    });

    describe("isFiniteNumber()", () =>
    {
        it("isFiniteNumber(0) should be true", () => expect(System.isFiniteNumber(0)).toBe(true));
        it("isFiniteNumber(-1) should be true", () => expect(System.isFiniteNumber(-1)).toBe(true));
        it("isFiniteNumber(1.23456) should be true", () => expect(System.isFiniteNumber(1.23456)).toBe(true));
        it("isFiniteNumber(NaN) should be false", () => expect(System.isFiniteNumber(NaN)).toBe(false));
        it("isFiniteNumber(Infinity) should be false", () => expect(System.isFiniteNumber(Infinity)).toBe(false));
    });

    describe("isNotANumber()", () =>
    {
        it("isNotANumber(NaN) should be true", () => expect(System.isNotANumber(NaN)).toBe(true));
        it("isNotANumber(Infinity) should be false", () => expect(System.isNotANumber(Infinity)).toBe(false));
        it("isNotANumber(0) should be false", () => expect(System.isNotANumber(0)).toBe(false));
        it("isNotANumber(1.2345) should be false", () => expect(System.isNotANumber(1.2345)).toBe(false));
    });

    describe("isString()", () =>
    {
        it("isString('0') should be true", () => expect(System.isString("0")).toBe(true));
        it("isString('a') should be true", () => expect(System.isString("a")).toBe(true));
        it("isString('abc123') should be true", () => expect(System.isString("abc123")).toBe(true));
        it("isString(0) should be false", () => expect(System.isString(0)).toBe(false));
        it("isString(null) should be false", () => expect(System.isString(null)).toBe(false));
        it("isString(undefined) should be false", () => expect(System.isString(void(0))).toBe(false));
    });

    describe("toJSON()", () =>
    {
        it("should convert object to json", () =>
        {
            expect(System.toJson(testObject)).toBe('{"a":1,"b":"b"}');
        });
    });

    describe("parseJSON()", () =>
    {
        it("should parse json to object", () =>
        {
            var o = System.parseJson<any>('{"a":1,"b":"b"}');
            expect(o).toEqual(testObject);
        });
    });

    describe("clone()", () =>
    {
        it("should clone object", () =>
        {
            var copy = System.clone<any>(testObject);
            expect(copy).toEqual(testObject);
            // Make sure it's not the same object
            expect(copy).not.toBe(testObject);
        });
    });

    let testObject = {
        a: 1,
        b: "b"
    };
});