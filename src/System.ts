/////////////////////////////////////////////////////////////////////////
// A library of JavaScript system functions 
// Usage: import * as System from "./System";
/////////////////////////////////////////////////////////////////////////

"use strict";

var _debug = false;
export var Console = window.console;

/** Puts URL query parameters into a map (an object). The values are url decoded. */
export function getQueryParameters(): any
{
    var args = {};
    var urlParams = window.location.search.slice(1);
    if (urlParams.length > 0)
    {
        urlParams.split("&").forEach(function (param)
        {
            var tokens = param.split("=");
            args[tokens[0]] = decodeURIComponent(tokens[1]);
        });
    }
    return args;
}

/** Clones a data object */
export function clone<T>(obj: T): T
{
    return <T>JSON.parse(JSON.stringify(obj));
}
/** Opens a new browser window */
export function openWindow(url?: string, target?: string, features?: string, replace?: boolean): Window
{
    return window.open(url, target, features, replace);
}
/** Determines if a value is null or undefined, as opposed to falsy */
export function isNullOrUndefined(val: any): boolean
{
    return (val === null || val === void(0));
}
/** Determines if a value is undefined, as opposed to falsy */
export function isUndefined(val: any): boolean
{
    return (val === void(0));
}
/** Determines if a value is a number */
export function isNumber(val: any): boolean
{
    return (typeof val === "number");
}
/** Determines if a value is a string */
export function isString(val: any): boolean
{
    return (typeof val === "string");
}
/** Determines if a number is finite.  If the argument is NaN, positive infinity, or negative infinity, this method returns false. */
export function isFiniteNumber(val: number): boolean
{
    return !isNullOrUndefined(val) && isFinite(val);
}
/** Determines if a number is NaN */
export function isNotANumber(val: number): boolean
{
    return isNaN(val);
}
/** Coerces a number to a 32-bit integer (may increase performance of math operations) */
export function toInt32(n: number): number
{
    return n | 0;
}
/** Puts a function in the event queue to be run.
    *  This will let other events in the queue (such as UI updates) be handled before the function runs.
    */
export function queueFn(callback: Function): void
{
    setTimeout(callback, 0);
}
/** Returns true of the browser supports touch events */
export function isTouchSupported(): boolean
{
    return ("ontouchstart" in document.documentElement);
}
/** Returns true of the browser supports pointer events */
export function isPointerSupported(): boolean
{
    return ("onpointerdown" in document.documentElement);
}
/** Returns true of the browser supports mouse events */
export function isMouseSupported(): boolean
{
    return ("onmousedown" in document.documentElement);
}

/////////////////////////////////////////////////////////////////////////
// JSON /////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/** Converts a value to a json string */
export function toJson(value: any): string
{
    return JSON.stringify(value);
}
/** Parses a json string to an object of the specified type */
export function parseJson<T>(text: string): T
{
    return <T>JSON.parse(text);
}

/////////////////////////////////////////////////////////////////////////
// Dialogs //////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

/** Shows a confirm dialog and returns the result */
export function confirm(message?: string): boolean
{
    return window.confirm(message);
}
/** Shows an alert dialog */
export function alert(message?: string): void
{
    window.alert(message);
}

/////////////////////////////////////////////////////////////////////////
// Timing ///////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

/** Requests an animation frame and returns the handle */
export function requestAnimationFrame(callback: FrameRequestCallback): number
{
    return window.requestAnimationFrame(callback);
}

export function cancelAnimationFrame(handle: number): void
{
    window.cancelAnimationFrame(handle);
}

export function setInterval(callback: Function, timeout?: any, ...args: any[]): number
{
    return window.setInterval(callback, timeout, args);
}

export function clearInterval(handle: number): void
{
    window.clearInterval(handle);
}

export function setTimeout(callback: Function, timeout?: any, ...args: any[]): number
{
    return window.setTimeout(callback, timeout, args);
}

export function clearTimeout(handle: number): void
{
    window.clearTimeout(handle);
}

/** Adds a function to be called when the DOM is ready */
export function ready(callback: () => any): void
{
    // If the dom has been loaded it will not fire an event so need to check if loaded and fire the callback immediately
    if (document.readyState == "interactive" || document.readyState == "complete")
    {
        callback();
    }
    else
    {
        document.addEventListener("DOMContentLoaded", (evt) => callback());
    }
}

// Static initializer
(() =>
{
// Normalize requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || window.msRequestAnimationFrame || window["webkitRequestAnimationFrame"] || window["mozRequestAnimationFrame"] ||
function (callback: FrameRequestCallback)
{
    return setTimeout(callback, 0);
};
window.cancelAnimationFrame = window.cancelAnimationFrame || window.msCancelRequestAnimationFrame || window["mozCancelAnimationFrame"] || function (handle: number) { };
})();
