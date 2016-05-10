import {Byte} from "./Byte";
import * as Convert from "./Convert";
import * as System from "./System";

"use strict";

/**
 * An immutable color object
 * Usage: import {Color} from "./Color";
 */
export class Color
{
    protected r: number;
    protected g: number;
    protected b: number;
    protected a: number;

    /** Creates a color using hexadecimal or shorthand hex value (ex. #112233, #123) */
    constructor(s: string);
    /** Creates a color with specified color channel values
     * @param r The red value, 0 to 255
     * @param g The green value, 0 to 255
     * @param b The blue value, 0 to 255
    */
    constructor(r: number, g: number, b: number);
    /** Creates a color with specified color channel and alpha values
     * @param a The alpha value, between 0 and 1
     */
    constructor(r: number, g: number, b: number, a: number);
    constructor(sOrRed: any, g?: number, b?: number, a?: number)
    {
        if (arguments.length >= 3)
        {
            this.r = this.validateByte(arguments[0]);
            this.g = this.validateByte(arguments[1]);
            this.b = this.validateByte(arguments[2]);
            if (arguments.length === 4)
            {
                this.a = Math.min(1, Math.max(0, arguments[3]));
            }
            else this.a = 1;
        }
        else this.parse(sOrRed);
    }

    public red(): number
    {
        return this.r;
    }

    public green(): number
    {
        return this.g;
    }

    public blue(): number
    {
        return this.b;
    }

    public alpha(): number
    {
        return this.a;
    }

    protected _rgb: string;
    protected _rgba: string;
    protected _hex: string;

    /**
    * Gets the rgb(x,x,x) value of the color
    * @return String rgb color
    */
    public toRGB(): string
    {
        return this._rgb || (this._rgb = `rgb(${this.r},${this.g},${this.b})`);
    }

    /**
     * Gets the rgba(x,x,x,x) value of the color
    * @param alpha Optional overide for the alpha
    * @return String rgba color
    */
    public toRGBA(alpha?: string): string
    {
        return this._rgba || (this._rgba = `rgba(${this.r},${this.g},${this.b},${alpha || this.a})`);
    }

    /** Gets the hex value of the color
    * @param shorthandAcceptable If true will return #333 instead of #333333, default is false
    * @return String hex color
    */
    public toHex(shorthandAcceptable = false): string
    {
        if (this._hex) return this._hex;

        this._hex = `#${this.toColorPart(this.r)}${this.toColorPart(this.g)}${this.toColorPart(this.b)}`;
        if (shorthandAcceptable)
        {
            this._hex = this._hex.replace(/^#([\da-f])\1([\da-f])\2([\da-f])\3$/i, "#$1$2$3");
        }
        return this._hex;
    }

    /**
    * Get a color that is lighter than this color
    * @param amount Amount to lighten where 0 is 0% and 1 is 100%
    */
    public lighter(amount = .1): Color
    {
        var pct = 1 + amount;
        return new Color(Byte.truncate(pct * this.r), Byte.truncate(pct * this.g), Byte.truncate(pct * this.b), this.a);
    }

    /**
    * Get a color that is darker than this color
    * @param amount Amount to darken where 0 is 0% and 1 is 100%
    */
    public darker(amount = .1): Color
    {
        var pct = Math.max(0, 1 - amount);
        return new Color(Byte.truncate(pct * this.r), Byte.truncate(pct * this.g), Byte.truncate(pct * this.b), this.a);
    }

    /**
     * Get a color that is more transparent than this color
     * @param amount Amount to fade where 0 is 0% and 1 is 100%
     */
    public fade(amount = .1): Color
    {
        var pct = Math.max(0, 1 - amount);
        return new Color(this.r, this.g, this.b, pct * this.a);
    }

    protected validateByte(n: number): number
    {
        if (!Byte.isByte(n)) throw new Error("Invalid value for color component: " + n);
        return n;
    }

    private toColorPart(n: number): string
    {
        return ((n < 16 ? '0' : '') + n.toString(16));
    }

    private reHex = /^#?([\da-f]{3}|[\da-f]{6})$/i;
    private reRgb = /^rgb\s*\(\s*(\d{0,3})\s*,\s*(\d{0,3})\s*,\s*(\d{0,3})\s*\)$/i;
    private reRgba = /^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*((0\.|\.)?\d+)\s*\)$/i;
    /**
    * Parse color strings into Color objects.
    * @param str hexadecimal, shorthand hex, rgb() or rgba()
    * @return Color {r: XXX, g: XXX, b: XXX, a: x} or undefined if invalid
    */
    private parse(str: string)
    {
        if (this.reHex.test(str))
        {
            // Remove hash if present
            str = str.replace(/^#/, '');
            // If shorthand hex convert to long
            str = str.replace(/^([\da-f])([\da-f])([\da-f])$/i, "$1$1$2$2$3$3");

            // Convert each part to number and place in object
            this.r = Convert.toInt(str.slice(0, 2), 16);
            this.g = Convert.toInt(str.slice(2, 4), 16);
            this.b = Convert.toInt(str.slice(4, 6), 16);
            this.a = 1;
        }
        else if (this.reRgb.test(str))
        {
            var parts = str.match(this.reRgb);
            this.r = Convert.toInt(parts[1]);
            this.g = Convert.toInt(parts[2]);
            this.b = Convert.toInt(parts[3]);
            this.a = 1;
        }
        else if (this.reRgba.test(str))
        {
            var parts = str.match(this.reRgba);
            this.r = Convert.toInt(parts[1]);
            this.g = Convert.toInt(parts[2]);
            this.b = Convert.toInt(parts[3]);
            this.a = Convert.toFloat(parts[4]);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
/**
 * A set of static color objects by name
 */
export var colors = {
    red: new Color(255, 0, 0),
    yellow: new Color(255, 255, 0),
    green: new Color(0, 255, 0),
    cyan: new Color(0, 255, 255),
    blue: new Color(0, 0, 255),
    purple: new Color(255, 0, 255),
};

///////////////////////////////////////////////////////////////////////////////
/**
 * A mutable color object
 */
export class MutableColor extends Color
{
    public red(): number;
    public red(r: number): MutableColor;
    public red(r?: number): any
    {
        if (System.isUndefined(r)) return this.r;
        this.r = this.validateByte(r);
        this.reset();
        return this;
    }

    public green(): number;
    public green(g: number): MutableColor;
    public green(g?: number): any
    {
        if (System.isUndefined(g)) return this.g;
        this.g = this.validateByte(g);
        this.reset();
        return this;
    }

    public blue(): number;
    public blue(b: number): MutableColor;
    public blue(b?: number): any
    {
        if (System.isUndefined(b)) return this.b;
        this.b = this.validateByte(b);
        this.reset();
        return this;
    }

    public alpha(): number;
    public alpha(a: number): MutableColor;
    public alpha(a?: number): any
    {
        if (System.isUndefined(a)) return this.a;
        this.a = Math.min(1, Math.max(0, a));
        this.reset();
        return this;
    }

    /**
    * Makes the color lighter
    * @param amount Amount to lighten where 0 is 0% and 1 is 100%
    */
    public lighter(amount = .1): MutableColor
    {
        var pct = 1 + amount;
        return this.red(Byte.truncate(pct * this.r)).green(Byte.truncate(pct * this.g)).blue(Byte.truncate(pct * this.b));
    }

    /**
    * Makes the color darker
    * @param amount Amount to darken where 0 is 0% and 1 is 100%
    */
    public darker(amount = .1): Color
    {
        var pct = Math.max(0, 1 - amount);
        return this.red(Byte.truncate(pct * this.r)).green(Byte.truncate(pct * this.g)).blue(Byte.truncate(pct * this.b));
    }

    /**
     * Makes the color more transparent
     * @param amount Amount to fade where 0 is 0% and 1 is 100%
     */
    public fade(amount = .1): Color
    {
        var pct = Math.max(0, 1 - amount);
        return this.alpha(pct * this.a);
    }

    private reset(): void
    {
        this._rgb = this._rgba = this._hex = null;
    }
}
