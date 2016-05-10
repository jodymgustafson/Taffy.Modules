/// <reference path="../../scripts/typings/jasmine/jasmine.d.ts" />
import {Color, MutableColor} from "../../src/Color";

describe("Color", () =>
{
    describe("when create color using r,g,b", () =>
    {
        it("should get color components", () => expect(new Color(64, 128, 255).toRGBA()).toBe("rgba(64,128,255,1)"));
    });
    describe("when create color using r,g,b,a", () =>
    {
        it("should get color components", () => expect(new Color(64, 128, 255, .33).toRGBA()).toBe("rgba(64,128,255,0.33)"));
        it("should restrict alpha to 1", () => expect(new Color(64, 128, 255, 1.33).toRGBA()).toBe("rgba(64,128,255,1)"));
        it("should restrict alpha to 0", () => expect(new Color(64, 128, 255, -0.33).toRGBA()).toBe("rgba(64,128,255,0)"));
    });
    describe("when create color using hex specifier", () =>
    {
        it("should get color components for hex", () => expect(new Color("#112244").toRGBA()).toBe("rgba(17,34,68,1)"));
        it("should get color components for shorthand hex", () => expect(new Color("#248").toRGBA()).toBe("rgba(34,68,136,1)"));
    });
    describe("when create color using invalid r,g,b", () =>
    {
        it("should throw exception for invalid blue", () => expect(() => new Color(64, 128, 256)).toThrowError("Invalid value for color component: 256"));
        it("should throw exception for invalid red", () => expect(() => new Color(-1, 128, 0)).toThrowError("Invalid value for color component: -1"));
        it("should throw exception for invalid green", () => expect(() => new Color(0, 1048, 0)).toThrowError("Invalid value for color component: 1048"));
    });
    describe("when convert to string", () =>
    {
        it("should get rgb string", () => expect(new Color(64, 128, 255, .33).toRGB()).toBe("rgb(64,128,255)"));
        it("should get rgba string", () => expect(new Color(64, 128, 255, .33).toRGBA()).toBe("rgba(64,128,255,0.33)"));
        it("should get hex string", () => expect(new Color(64, 128, 255, .33).toHex()).toBe("#4080ff"));
        it("should get shorthand hex string", () => expect(new Color("#aabb11").toHex(true)).toBe("#ab1"));
    });
    describe("when make lighter", () =>
    {
        it("should lighten by default amount", () => expect(new Color(64, 128, 32).lighter().toRGBA()).toBe("rgba(70,140,35,1)"));
        it("should cap at 255", () => expect(new Color(64, 240, 255).lighter().toRGBA()).toBe("rgba(70,255,255,1)"));
        it("should lighten by specified amount", () => expect(new Color(64, 240, 32).lighter(.5).toRGBA()).toBe("rgba(96,255,48,1)"));
    });
    describe("when make darker", () =>
    {
        it("should darken by default amount", () => expect(new Color(64, 128, 32).darker().toRGBA()).toBe("rgba(57,115,28,1)"));
        it("should min at 0", () => expect(new Color(64, 12, 0).darker().toRGBA()).toBe("rgba(57,10,0,1)"));
        it("should darken by specified amount", () => expect(new Color(64, 240, 32).darker(.5).toRGBA()).toBe("rgba(32,120,16,1)"));
    });
    describe("when fade", () =>
    {
        it("should fade by default amount", () => expect(new Color(64, 128, 32, 1).fade().toRGBA()).toBe("rgba(64,128,32,0.9)"));
        it("should min at 0", () => expect(new Color(64, 12, 0, 0).fade().toRGBA()).toBe("rgba(64,12,0,0)"));
        it("should fade by specified amount", () => expect(new Color(64, 240, 32, 1).fade(.5).toRGBA()).toBe("rgba(64,240,32,0.5)"));
    });
    describe("when using mutable color", () =>
    {
        let color = new MutableColor(0, 0, 0);
        it("should be able to change color", () => expect(color.red(20).green(30).blue(40).toRGBA()).toBe("rgba(20,30,40,1)"));
        it("should be able to change color again", () => expect(color.red(120).green(130).blue(140).toRGBA()).toBe("rgba(120,130,140,1)"));
        it("should be able to lighten", () => expect(color.lighter().toRGBA()).toBe("rgba(132,143,154,1)"));
        it("should be able to darken", () => expect(color.darker().toRGBA()).toBe("rgba(118,128,138,1)"));
        it("should be able to fade", () => expect(color.fade().toRGBA()).toBe("rgba(118,128,138,0.9)"));
    });
});
