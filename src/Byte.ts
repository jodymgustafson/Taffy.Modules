/**
 * A class for storing and manipulating an unsigned byte value (0 to 255)
 * Usage: import {Byte} from "./Byte";
 */
export class Byte
{
    /**
     * Create a new instance from a number.
     * If the number is too big or small to fit into a byte it will be truncated and the overflow flag set.
     * @param n
     */
    constructor(n: number)
    {
        this._value = Byte.truncate(n);
        this._overflow = (this._value !== n);
    }

    private _overflow = false;
    /** Used to determine if the number was modified to fit into a byte value */
    public get overflow(): boolean { return this._overflow; }

    private _value = 0;
    /** Gets the value of the byte as a number **/
    public get value(): number { return this._value; }

    public static MIN_VALUE = 0;
    public static MAX_VALUE = 255;

    /** Makes a number fit into a byte by truncating it */
    public static truncate(b: number): number
    {
        if (b > Byte.MAX_VALUE) return Byte.MAX_VALUE;
        if (b < Byte.MIN_VALUE) return Byte.MIN_VALUE;
        return b | 0;
    }

    /** Makes a number fit into a byte using modulus */
    public static mod(b: number): number
    {
        return (Math.abs(b) | 0) % 256;
    }

    /**
     * Checks is a number is in the range of a byte value
     */
    public static isByte(b: number): boolean
    {
        return b >= Byte.MIN_VALUE && b <= Byte.MAX_VALUE;
    }
}