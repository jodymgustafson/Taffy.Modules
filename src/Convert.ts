import * as System from "./System";

/** Parses a string into a decimal number (i.e. not an integer) */
export function toFloat(str: string): number
{
    return parseFloat(str);
}

/** Parses a string into an integer number */
export function toInt(str: string, radix: number = 10): number
{
    return parseInt(str, radix);
}

/** Converts a value to a string or empty string if undefined or null */
export function toString(val: any): string
{
    return (System.isNullOrUndefined(val)) ? "" : val.toString();
}

/** Converts a css-type dasherized string to camel case. (e.g. background-color => backgroundColor) */
export function toCamelCase(name: string): string
{
    var result = "";
    name.split("-").forEach((s, i) =>
    {
        result += (i > 0 ? s[0].toUpperCase() + s.slice(1) : s);
    });
    return result;
}