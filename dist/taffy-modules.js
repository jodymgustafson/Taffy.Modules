var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("AsyncAction", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * Abstract base class for building an async action with optional timeout.
    * The start() method must be implemented.
    * When the action is done it should call either complete() or error().
    */
    var AsyncAction = (function () {
        /** @param timeout (optional) Sets the number of ms before the action times out */
        function AsyncAction(timeout) {
            var _this = this;
            this.timeoutId = 0;
            this.callbacks = {
                complete: [],
                error: []
            };
            if (timeout) {
                this.timeoutId = setTimeout(function () {
                    if (_this.callbacks.error)
                        _this.error("Action timed out");
                }, timeout);
            }
        }
        AsyncAction.prototype.onCompleted = function (callback) {
            this.callbacks.complete.push(callback);
            return this;
        };
        AsyncAction.prototype.onError = function (callback) {
            this.callbacks.error.push(callback);
            return this;
        };
        /** Method to be called when the action is complete */
        AsyncAction.prototype.complete = function () {
            var _this = this;
            if (this.timeoutId)
                clearTimeout(this.timeoutId);
            this.callbacks.complete.forEach(function (callback) { return callback(_this); });
        };
        /** Method to be called when the action errors out */
        AsyncAction.prototype.error = function (message) {
            var _this = this;
            if (this.timeoutId)
                clearTimeout(this.timeoutId);
            this.callbacks.error.forEach(function (callback) { return callback(_this, message); });
        };
        return AsyncAction;
    }());
    exports.AsyncAction = AsyncAction;
});
define("AsyncActionTracker", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * Used to track the progress of any number of async actions, usually loading external resources.
    * Usage: import {AsyncActionTracker} from "../../src/AsyncActionTracker";
    */
    var AsyncActionTracker = (function () {
        function AsyncActionTracker() {
            this.internal = {
                totalCount: 0,
                loadedCount: 0,
                errorCount: 0
            };
            this.callbacks = {
                actionCompleted: function (action, tracker) { return void (0); },
                actionError: function (action, errmsg, tracker) { return void (0); },
                done: function (tracker, hasErrors) { return void (0); }
            };
        }
        Object.defineProperty(AsyncActionTracker.prototype, "percentComplete", {
            /** Percentage of actions that have been completed (including errors), between 0 and 1 */
            get: function () {
                return (this.internal.loadedCount + this.internal.errorCount) / this.internal.totalCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AsyncActionTracker.prototype, "totalCount", {
            /** Total number of actions being tracked */
            get: function () {
                return this.internal.totalCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AsyncActionTracker.prototype, "completedCount", {
            /** Total number of actions that have been successfully completed */
            get: function () {
                return this.internal.loadedCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AsyncActionTracker.prototype, "errorCount", {
            /** Total number of actions that have errored out */
            get: function () {
                return this.internal.errorCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AsyncActionTracker.prototype, "isDone", {
            /** Used to determine if all actions have been completed */
            get: function () {
                return this.internal.loadedCount + this.internal.errorCount === this.internal.totalCount;
            },
            enumerable: true,
            configurable: true
        });
        /** Adds any number of actions to the tracker and starts them */
        AsyncActionTracker.prototype.addActions = function () {
            var _this = this;
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            items.forEach(function (item) { return _this.addAction(item); });
            return this;
        };
        /** Adds one action to the tracker and starts it */
        AsyncActionTracker.prototype.addAction = function (item) {
            var _this = this;
            this.internal.totalCount++;
            item.onCompleted(function () {
                _this.internal.loadedCount++;
                _this.callbacks.actionCompleted(item, _this);
                if (_this.isDone) {
                    _this.callbacks.done(_this, _this.internal.errorCount > 0);
                }
            })
                .onError(function (action, errmsg) {
                _this.internal.errorCount++;
                _this.callbacks.actionError(item, errmsg, _this);
                if (_this.isDone) {
                    _this.callbacks.done(_this, _this.internal.errorCount > 0);
                }
            })
                .start();
            return this;
        };
        /** Sets the function to be called when an action is successfully completed */
        AsyncActionTracker.prototype.actionComplete = function (callback) {
            this.callbacks.actionCompleted = callback;
            return this;
        };
        /** Sets the function to call when an action errors out */
        AsyncActionTracker.prototype.actionError = function (callback) {
            this.callbacks.actionError = callback;
            return this;
        };
        /** Sets the function to call when all actions have completed or errored out */
        AsyncActionTracker.prototype.done = function (callback) {
            this.callbacks.done = callback;
            return this;
        };
        return AsyncActionTracker;
    }());
    exports.AsyncActionTracker = AsyncActionTracker;
});
define("Byte", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A class for storing and manipulating an unsigned byte value (0 to 255)
     * Usage: import {Byte} from "./Byte";
     */
    var Byte = (function () {
        /**
         * Create a new instance from a number.
         * If the number is too big or small to fit into a byte it will be truncated and the overflow flag set.
         * @param n
         */
        function Byte(n) {
            this._overflow = false;
            this._value = 0;
            this._value = Byte.truncate(n);
            this._overflow = (this._value !== n);
        }
        Object.defineProperty(Byte.prototype, "overflow", {
            /** Used to determine if the number was modified to fit into a byte value */
            get: function () { return this._overflow; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Byte.prototype, "value", {
            /** Gets the value of the byte as a number **/
            get: function () { return this._value; },
            enumerable: true,
            configurable: true
        });
        /** Makes a number fit into a byte by truncating it */
        Byte.truncate = function (b) {
            if (b > Byte.MAX_VALUE)
                return Byte.MAX_VALUE;
            if (b < Byte.MIN_VALUE)
                return Byte.MIN_VALUE;
            return b | 0;
        };
        /** Makes a number fit into a byte using modulus */
        Byte.mod = function (b) {
            return (Math.abs(b) | 0) % 256;
        };
        /**
         * Checks is a number is in the range of a byte value
         */
        Byte.isByte = function (b) {
            return b >= Byte.MIN_VALUE && b <= Byte.MAX_VALUE;
        };
        return Byte;
    }());
    Byte.MIN_VALUE = 0;
    Byte.MAX_VALUE = 255;
    exports.Byte = Byte;
});
/////////////////////////////////////////////////////////////////////////
// A library of JavaScript system functions 
// Usage: import * as System from "./System";
/////////////////////////////////////////////////////////////////////////
define("System", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _debug = false;
    exports.Console = window.console;
    /** Puts URL query parameters into a map (an object). The values are url decoded. */
    function getQueryParameters() {
        var args = {};
        var urlParams = window.location.search.slice(1);
        if (urlParams.length > 0) {
            urlParams.split("&").forEach(function (param) {
                var tokens = param.split("=");
                args[tokens[0]] = decodeURIComponent(tokens[1]);
            });
        }
        return args;
    }
    exports.getQueryParameters = getQueryParameters;
    /** Clones a data object */
    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    exports.clone = clone;
    /** Opens a new browser window */
    function openWindow(url, target, features, replace) {
        return window.open(url, target, features, replace);
    }
    exports.openWindow = openWindow;
    /** Determines if a value is null or undefined, as opposed to falsy */
    function isNullOrUndefined(val) {
        return (val === null || val === void (0));
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    /** Determines if a value is undefined, as opposed to falsy */
    function isUndefined(val) {
        return (val === void (0));
    }
    exports.isUndefined = isUndefined;
    /** Determines if a value is a number */
    function isNumber(val) {
        return (typeof val === "number");
    }
    exports.isNumber = isNumber;
    /** Determines if a value is a string */
    function isString(val) {
        return (typeof val === "string");
    }
    exports.isString = isString;
    /** Determines if a number is finite.  If the argument is NaN, positive infinity, or negative infinity, this method returns false. */
    function isFiniteNumber(val) {
        return !isNullOrUndefined(val) && isFinite(val);
    }
    exports.isFiniteNumber = isFiniteNumber;
    /** Determines if a number is NaN */
    function isNotANumber(val) {
        return isNaN(val);
    }
    exports.isNotANumber = isNotANumber;
    /** Coerces a number to a 32-bit integer (may increase performance of math operations) */
    function toInt32(n) {
        return n | 0;
    }
    exports.toInt32 = toInt32;
    /** Puts a function in the event queue to be run.
        *  This will let other events in the queue (such as UI updates) be handled before the function runs.
        */
    function queueFn(callback) {
        setTimeout(callback, 0);
    }
    exports.queueFn = queueFn;
    /** Returns true of the browser supports touch events */
    function isTouchSupported() {
        return ("ontouchstart" in document.documentElement);
    }
    exports.isTouchSupported = isTouchSupported;
    /** Returns true of the browser supports pointer events */
    function isPointerSupported() {
        return ("onpointerdown" in document.documentElement);
    }
    exports.isPointerSupported = isPointerSupported;
    /** Returns true of the browser supports mouse events */
    function isMouseSupported() {
        return ("onmousedown" in document.documentElement);
    }
    exports.isMouseSupported = isMouseSupported;
    /////////////////////////////////////////////////////////////////////////
    // JSON /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /** Converts a value to a json string */
    function toJson(value) {
        return JSON.stringify(value);
    }
    exports.toJson = toJson;
    /** Parses a json string to an object of the specified type */
    function parseJson(text) {
        return JSON.parse(text);
    }
    exports.parseJson = parseJson;
    /////////////////////////////////////////////////////////////////////////
    // Dialogs //////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /** Shows a confirm dialog and returns the result */
    function confirm(message) {
        return window.confirm(message);
    }
    exports.confirm = confirm;
    /** Shows an alert dialog */
    function alert(message) {
        window.alert(message);
    }
    exports.alert = alert;
    /////////////////////////////////////////////////////////////////////////
    // Timing ///////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    /** Requests an animation frame and returns the handle */
    function requestAnimationFrame(callback) {
        return window.requestAnimationFrame(callback);
    }
    exports.requestAnimationFrame = requestAnimationFrame;
    function cancelAnimationFrame(handle) {
        window.cancelAnimationFrame(handle);
    }
    exports.cancelAnimationFrame = cancelAnimationFrame;
    function setInterval(callback, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return window.setInterval(callback, timeout, args);
    }
    exports.setInterval = setInterval;
    function clearInterval(handle) {
        window.clearInterval(handle);
    }
    exports.clearInterval = clearInterval;
    function setTimeout(callback, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return window.setTimeout(callback, timeout, args);
    }
    exports.setTimeout = setTimeout;
    function clearTimeout(handle) {
        window.clearTimeout(handle);
    }
    exports.clearTimeout = clearTimeout;
    /** Adds a function to be called when the DOM is ready */
    function ready(callback) {
        // If the dom has been loaded it will not fire an event so need to check if loaded and fire the callback immediately
        if (document.readyState == "interactive" || document.readyState == "complete") {
            callback();
        }
        else {
            document.addEventListener("DOMContentLoaded", function (evt) { return callback(); });
        }
    }
    exports.ready = ready;
    // Static initializer
    (function () {
        // Normalize requestAnimationFrame
        window.requestAnimationFrame = window.requestAnimationFrame || window["msRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["mozRequestAnimationFrame"] ||
            function (callback) {
                return setTimeout(callback, 0);
            };
        window.cancelAnimationFrame = window.cancelAnimationFrame || window["msCancelRequestAnimationFrame"] || window["mozCancelAnimationFrame"] || function (handle) { };
    })();
});
define("Convert", ["require", "exports", "System"], function (require, exports, System) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Parses a string into a decimal number (i.e. not an integer) */
    function toFloat(str) {
        return parseFloat(str);
    }
    exports.toFloat = toFloat;
    /** Parses a string into an integer number */
    function toInt(str, radix) {
        if (radix === void 0) { radix = 10; }
        return parseInt(str, radix);
    }
    exports.toInt = toInt;
    /** Converts a value to a string or empty string if undefined or null */
    function toString(val) {
        return (System.isNullOrUndefined(val)) ? "" : val.toString();
    }
    exports.toString = toString;
    /** Converts a css-type dasherized string to camel case. (e.g. background-color => backgroundColor) */
    function toCamelCase(name) {
        var result = "";
        name.split("-").forEach(function (s, i) {
            result += (i > 0 ? s[0].toUpperCase() + s.slice(1) : s);
        });
        return result;
    }
    exports.toCamelCase = toCamelCase;
});
define("Color", ["require", "exports", "Byte", "Convert", "System"], function (require, exports, Byte_1, Convert, System) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An immutable color object
     * Usage: import {Color} from "./Color";
     */
    var Color = (function () {
        function Color(sOrRed, g, b, a) {
            this.reHex = /^#?([\da-f]{3}|[\da-f]{6})$/i;
            this.reRgb = /^rgb\s*\(\s*(\d{0,3})\s*,\s*(\d{0,3})\s*,\s*(\d{0,3})\s*\)$/i;
            this.reRgba = /^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*((0\.|\.)?\d+)\s*\)$/i;
            if (arguments.length >= 3) {
                this.r = this.validateByte(arguments[0]);
                this.g = this.validateByte(arguments[1]);
                this.b = this.validateByte(arguments[2]);
                if (arguments.length === 4) {
                    this.a = Math.min(1, Math.max(0, arguments[3]));
                }
                else
                    this.a = 1;
            }
            else
                this.parse(sOrRed);
        }
        Color.prototype.red = function () {
            return this.r;
        };
        Color.prototype.green = function () {
            return this.g;
        };
        Color.prototype.blue = function () {
            return this.b;
        };
        Color.prototype.alpha = function () {
            return this.a;
        };
        /**
        * Gets the rgb(x,x,x) value of the color
        * @return String rgb color
        */
        Color.prototype.toRGB = function () {
            return this._rgb || (this._rgb = "rgb(" + this.r + "," + this.g + "," + this.b + ")");
        };
        /**
         * Gets the rgba(x,x,x,x) value of the color
        * @param alpha Optional overide for the alpha
        * @return String rgba color
        */
        Color.prototype.toRGBA = function (alpha) {
            return this._rgba || (this._rgba = "rgba(" + this.r + "," + this.g + "," + this.b + "," + (alpha || this.a) + ")");
        };
        /** Gets the hex value of the color
        * @param shorthandAcceptable If true will return #333 instead of #333333, default is false
        * @return String hex color
        */
        Color.prototype.toHex = function (shorthandAcceptable) {
            if (shorthandAcceptable === void 0) { shorthandAcceptable = false; }
            if (this._hex)
                return this._hex;
            this._hex = "#" + this.toColorPart(this.r) + this.toColorPart(this.g) + this.toColorPart(this.b);
            if (shorthandAcceptable) {
                this._hex = this._hex.replace(/^#([\da-f])\1([\da-f])\2([\da-f])\3$/i, "#$1$2$3");
            }
            return this._hex;
        };
        /**
        * Get a color that is lighter than this color
        * @param amount Amount to lighten where 0 is 0% and 1 is 100%
        */
        Color.prototype.lighter = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = 1 + amount;
            return new Color(Byte_1.Byte.truncate(pct * this.r), Byte_1.Byte.truncate(pct * this.g), Byte_1.Byte.truncate(pct * this.b), this.a);
        };
        /**
        * Get a color that is darker than this color
        * @param amount Amount to darken where 0 is 0% and 1 is 100%
        */
        Color.prototype.darker = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = Math.max(0, 1 - amount);
            return new Color(Byte_1.Byte.truncate(pct * this.r), Byte_1.Byte.truncate(pct * this.g), Byte_1.Byte.truncate(pct * this.b), this.a);
        };
        /**
         * Get a color that is more transparent than this color
         * @param amount Amount to fade where 0 is 0% and 1 is 100%
         */
        Color.prototype.fade = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = Math.max(0, 1 - amount);
            return new Color(this.r, this.g, this.b, pct * this.a);
        };
        Color.prototype.validateByte = function (n) {
            if (!Byte_1.Byte.isByte(n))
                throw new Error("Invalid value for color component: " + n);
            return n;
        };
        Color.prototype.toColorPart = function (n) {
            return ((n < 16 ? '0' : '') + n.toString(16));
        };
        /**
        * Parse color strings into Color objects.
        * @param str hexadecimal, shorthand hex, rgb() or rgba()
        * @return Color {r: XXX, g: XXX, b: XXX, a: x} or undefined if invalid
        */
        Color.prototype.parse = function (str) {
            if (this.reHex.test(str)) {
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
            else if (this.reRgb.test(str)) {
                var parts = str.match(this.reRgb);
                this.r = Convert.toInt(parts[1]);
                this.g = Convert.toInt(parts[2]);
                this.b = Convert.toInt(parts[3]);
                this.a = 1;
            }
            else if (this.reRgba.test(str)) {
                var parts = str.match(this.reRgba);
                this.r = Convert.toInt(parts[1]);
                this.g = Convert.toInt(parts[2]);
                this.b = Convert.toInt(parts[3]);
                this.a = Convert.toFloat(parts[4]);
            }
        };
        return Color;
    }());
    exports.Color = Color;
    ///////////////////////////////////////////////////////////////////////////////
    /**
     * A set of static color objects by name
     */
    exports.colors = {
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
    var MutableColor = (function (_super) {
        __extends(MutableColor, _super);
        function MutableColor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MutableColor.prototype.red = function (r) {
            if (System.isUndefined(r))
                return this.r;
            this.r = this.validateByte(r);
            this.reset();
            return this;
        };
        MutableColor.prototype.green = function (g) {
            if (System.isUndefined(g))
                return this.g;
            this.g = this.validateByte(g);
            this.reset();
            return this;
        };
        MutableColor.prototype.blue = function (b) {
            if (System.isUndefined(b))
                return this.b;
            this.b = this.validateByte(b);
            this.reset();
            return this;
        };
        MutableColor.prototype.alpha = function (a) {
            if (System.isUndefined(a))
                return this.a;
            this.a = Math.min(1, Math.max(0, a));
            this.reset();
            return this;
        };
        /**
        * Makes the color lighter
        * @param amount Amount to lighten where 0 is 0% and 1 is 100%
        */
        MutableColor.prototype.lighter = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = 1 + amount;
            return this.red(Byte_1.Byte.truncate(pct * this.r)).green(Byte_1.Byte.truncate(pct * this.g)).blue(Byte_1.Byte.truncate(pct * this.b));
        };
        /**
        * Makes the color darker
        * @param amount Amount to darken where 0 is 0% and 1 is 100%
        */
        MutableColor.prototype.darker = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = Math.max(0, 1 - amount);
            return this.red(Byte_1.Byte.truncate(pct * this.r)).green(Byte_1.Byte.truncate(pct * this.g)).blue(Byte_1.Byte.truncate(pct * this.b));
        };
        /**
         * Makes the color more transparent
         * @param amount Amount to fade where 0 is 0% and 1 is 100%
         */
        MutableColor.prototype.fade = function (amount) {
            if (amount === void 0) { amount = .1; }
            var pct = Math.max(0, 1 - amount);
            return this.alpha(pct * this.a);
        };
        MutableColor.prototype.reset = function () {
            this._rgb = this._rgba = this._hex = null;
        };
        return MutableColor;
    }(Color));
    exports.MutableColor = MutableColor;
});
define("KeyCodes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Key codes for handling keyboard events */
    var KeyCode;
    (function (KeyCode) {
        KeyCode[KeyCode["NUL"] = 0] = "NUL";
        KeyCode[KeyCode["TAB"] = 9] = "TAB";
        KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
        KeyCode[KeyCode["SHIFT"] = 16] = "SHIFT";
        KeyCode[KeyCode["CONTROL"] = 17] = "CONTROL";
        KeyCode[KeyCode["ALT"] = 18] = "ALT";
        KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
        KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
        KeyCode[KeyCode["HOME"] = 36] = "HOME";
        KeyCode[KeyCode["LEFT"] = 37] = "LEFT";
        KeyCode[KeyCode["UP"] = 38] = "UP";
        KeyCode[KeyCode["RIGHT"] = 39] = "RIGHT";
        KeyCode[KeyCode["DOWN"] = 40] = "DOWN";
        KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
        KeyCode[KeyCode["NUM0"] = 48] = "NUM0";
        KeyCode[KeyCode["NUM1"] = 49] = "NUM1";
        KeyCode[KeyCode["NUM2"] = 50] = "NUM2";
        KeyCode[KeyCode["NUM3"] = 51] = "NUM3";
        KeyCode[KeyCode["NUM4"] = 52] = "NUM4";
        KeyCode[KeyCode["NUM5"] = 53] = "NUM5";
        KeyCode[KeyCode["NUM6"] = 54] = "NUM6";
        KeyCode[KeyCode["NUM7"] = 55] = "NUM7";
        KeyCode[KeyCode["NUM8"] = 56] = "NUM8";
        KeyCode[KeyCode["NUM9"] = 57] = "NUM9";
        KeyCode[KeyCode["A"] = 65] = "A";
        KeyCode[KeyCode["B"] = 66] = "B";
        KeyCode[KeyCode["C"] = 67] = "C";
        KeyCode[KeyCode["D"] = 68] = "D";
        KeyCode[KeyCode["E"] = 69] = "E";
        KeyCode[KeyCode["F"] = 70] = "F";
        KeyCode[KeyCode["G"] = 71] = "G";
        KeyCode[KeyCode["H"] = 72] = "H";
        KeyCode[KeyCode["I"] = 73] = "I";
        KeyCode[KeyCode["J"] = 74] = "J";
        KeyCode[KeyCode["K"] = 75] = "K";
        KeyCode[KeyCode["L"] = 76] = "L";
        KeyCode[KeyCode["M"] = 77] = "M";
        KeyCode[KeyCode["N"] = 78] = "N";
        KeyCode[KeyCode["O"] = 79] = "O";
        KeyCode[KeyCode["P"] = 80] = "P";
        KeyCode[KeyCode["Q"] = 81] = "Q";
        KeyCode[KeyCode["R"] = 82] = "R";
        KeyCode[KeyCode["S"] = 83] = "S";
        KeyCode[KeyCode["T"] = 84] = "T";
        KeyCode[KeyCode["U"] = 85] = "U";
        KeyCode[KeyCode["V"] = 86] = "V";
        KeyCode[KeyCode["W"] = 87] = "W";
        KeyCode[KeyCode["X"] = 88] = "X";
        KeyCode[KeyCode["Y"] = 89] = "Y";
        KeyCode[KeyCode["Z"] = 90] = "Z";
        KeyCode[KeyCode["PLUS"] = 107] = "PLUS";
        KeyCode[KeyCode["MINUS"] = 109] = "MINUS";
        KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
        KeyCode[KeyCode["PERIOD"] = 190] = "PERIOD";
    })(KeyCode = exports.KeyCode || (exports.KeyCode = {}));
});
define("LoadImageAction", ["require", "exports", "AsyncAction"], function (require, exports, AsyncAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LoadImageAction = (function (_super) {
        __extends(LoadImageAction, _super);
        function LoadImageAction(img, timeout) {
            var _this = _super.call(this, timeout) || this;
            _this.img = img;
            return _this;
        }
        LoadImageAction.prototype.start = function () {
            var _this = this;
            this.img.onload = function () {
                _this.complete();
            };
            this.img.onerror = function (ev) {
                _this.error("Error loading image: " + _this.img.src);
            };
            return this;
        };
        return LoadImageAction;
    }(AsyncAction_1.AsyncAction));
    exports.LoadImageAction = LoadImageAction;
});
define("Random", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * Gets a random number between 0 and max
    * @param max
    */
    function nextTo(max) {
        if (max === void 0) { max = 1; }
        return Math.random() * max;
    }
    exports.nextTo = nextTo;
    /**
    * Gets a random number between min and max
    * @param min
    * @param max
    */
    function next(min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        var range = max - min;
        return Math.random() * range + min;
    }
    exports.next = next;
    /**
    * Gets a random integer between min and max
    * @param min
    * @param max
    */
    function nextInt(min, max) {
        return next(min, max + 1) | 0;
    }
    exports.nextInt = nextInt;
    /**
    * Gets a random integer between 0 and max
    * @param max
    */
    function nextIntTo(max) {
        return nextTo(max + 1) | 0;
    }
    exports.nextIntTo = nextIntTo;
    /**
     * Gets a random boolean value
     */
    function nextBoolean() {
        return Math.random() < .5;
    }
    exports.nextBoolean = nextBoolean;
});
define("Rectangle", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rectangle = (function () {
        function Rectangle(x, y, w, h) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (w === void 0) { w = 0; }
            if (h === void 0) { h = 0; }
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        Object.defineProperty(Rectangle.prototype, "top", {
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            get: function () { return this.y + this.h; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "right", {
            get: function () { return this.x + this.w; },
            enumerable: true,
            configurable: true
        });
        /** Moves the rect to a new position */
        Rectangle.prototype.moveTo = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        /** Determines if this rect intersects with another */
        Rectangle.prototype.intersects = function (rect) {
            var result = this.x < rect.x + rect.w &&
                this.x + this.w > rect.x &&
                this.y < rect.y + rect.h &&
                this.y + this.h > rect.y;
            return result;
        };
        /** Determines if this rect contains a point */
        Rectangle.prototype.contains = function (x, y) {
            var result = this.x < x &&
                this.x + this.w > x &&
                this.y < y &&
                this.y + this.h > y;
            return result;
        };
        return Rectangle;
    }());
    exports.Rectangle = Rectangle;
});
define("audio/AudioClip", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Wrapper for HTML5 audio */
    var AudioClip = (function () {
        function AudioClip(audio) {
            this._fadeTimeout = 1000 / 33;
            this._fading = false;
            this.audioElement = audio;
        }
        Object.defineProperty(AudioClip.prototype, "audio", {
            /** Gets the audio element */
            get: function () {
                return this.audioElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AudioClip.prototype, "loop", {
            get: function () {
                return this.audioElement.loop;
            },
            set: function (on) {
                this.audioElement.loop = on;
            },
            enumerable: true,
            configurable: true
        });
        AudioClip.prototype.play = function () {
            this.audioElement.play();
            return this;
        };
        AudioClip.prototype.pause = function () {
            this.audioElement.pause();
            return this;
        };
        AudioClip.prototype.stop = function () {
            if (this._fading) {
                this.stopFadeOut();
            }
            this.pause().reset();
            return this;
        };
        AudioClip.prototype.reset = function () {
            this.audioElement.currentTime = 0;
            return this;
        };
        AudioClip.prototype.isPlaying = function () {
            return !(this.audioElement.ended || this.audioElement.currentTime === 0 || this.audioElement.currentTime === this.audioElement.duration);
        };
        AudioClip.prototype.getVolume = function () {
            return this.audioElement.volume;
        };
        AudioClip.prototype.setVolume = function (vol) {
            this.audioElement.volume = this.normalizeVolume(vol);
            return this;
        };
        /** Makes a copy of the audio clip backed by a new audio element. Note: there are limitations to the number of instances of an audio element. */
        AudioClip.prototype.clone = function () {
            var audioClip = new AudioClip(new Audio());
            audioClip.audio.id = this.audio.id;
            audioClip.audio.src = this.audio.src;
            return audioClip;
        };
        AudioClip.prototype.fadeOut = function (time) {
            this._fading = true;
            var delta = this.audioElement.volume / time * this._fadeTimeout;
            this.fadeLoop(delta);
            return this;
        };
        AudioClip.prototype.normalizeVolume = function (vol) {
            return Math.min(Math.max(vol, 0), 1);
        };
        AudioClip.prototype.fadeLoop = function (delta) {
            var _this = this;
            if (this._fading) {
                this.audioElement.volume = this.normalizeVolume(this.audioElement.volume - delta);
                if (this.audioElement.volume > 0) {
                    setTimeout(function () { return _this.fadeLoop(delta); }, this._fadeTimeout);
                }
                else {
                    this._fading = false;
                    this.audioElement.pause();
                }
            }
        };
        AudioClip.prototype.stopFadeOut = function () {
            this._fading = false;
        };
        return AudioClip;
    }());
    exports.AudioClip = AudioClip;
});
define("audio/AudioClipLoop", ["require", "exports", "audio/AudioClip"], function (require, exports, AudioClip_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Implements an audio clip that loops properly */
    var AudioClipLoop = (function (_super) {
        __extends(AudioClipLoop, _super);
        function AudioClipLoop(audio) {
            var _this = _super.call(this, audio) || this;
            _this.audios = [];
            _this.pointer = 0;
            _this.timeout = 0;
            _this.timerId = 0;
            _this.audios.push(audio);
            _this.audios.push(_this.clone().audio);
            _this.timeout = Math.floor(audio.duration * 1000);
            return _this;
        }
        AudioClipLoop.prototype.playNext = function () {
            var _this = this;
            if (this.timerId) {
                this.pointer = ++this.pointer % 2;
                this.audioElement = this.audios[this.pointer];
                this.audioElement.currentTime = 0;
                this.audioElement.play();
                this.timerId = setTimeout(function () { return _this.playNext(); }, this.timeout);
            }
        };
        AudioClipLoop.prototype.play = function () {
            var _this = this;
            if (!this.timerId) {
                _super.prototype.play.call(this);
                this.timerId = setTimeout(function () { return _this.playNext(); }, this.timeout);
            }
            return this;
        };
        AudioClipLoop.prototype.pause = function () {
            if (this.timerId) {
                _super.prototype.pause.call(this);
                clearTimeout(this.timerId);
                this.timerId = 0;
                this.pointer = 0;
            }
            return this;
        };
        AudioClipLoop.prototype.setVolume = function (vol) {
            _super.prototype.setVolume.call(this, vol);
            this.audios[0].volume = this.audios[1].volume = _super.prototype.getVolume.call(this);
            return this;
        };
        AudioClipLoop.prototype.fadeOut = function (time) {
            this.stop();
            return this;
        };
        return AudioClipLoop;
    }(AudioClip_1.AudioClip));
    exports.AudioClipLoop = AudioClipLoop;
});
/**
* The audio library provides support for working with audio files.
*/
define("audio/AudioLib", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Used to get or set debug mode */
    window["AudioLib"] = window["AudioLib"] || {
        debug: false
    };
    function debugEnabled(enable) {
        if (enable === void (0)) {
            return window["AudioLib"].debug;
        }
        window["AudioLib"].debug = enable;
    }
    exports.debugEnabled = debugEnabled;
    var _supportFileTypes;
    /**
    * Returns a list of all audio file extensions supported by the browser
    * Note: you may need to add some file extensions to your server's list of MIME types
    */
    function getSupportedFileTypes() {
        if (!_supportFileTypes) {
            _supportFileTypes = [];
            var audio = new Audio();
            if (audio.canPlayType("audio/ogg"))
                _supportFileTypes.push(".ogg");
            if (audio.canPlayType("audio/mp4"))
                _supportFileTypes.push(".m4a");
            if (audio.canPlayType("audio/mpeg"))
                _supportFileTypes.push(".mp3");
            if (audio.canPlayType("audio/wav"))
                _supportFileTypes.push(".wav");
        }
        return _supportFileTypes;
    }
    exports.getSupportedFileTypes = getSupportedFileTypes;
    function log(msg) {
        if (debugEnabled()) {
            if (typeof (msg) === "function")
                msg = msg();
            console.log(msg);
        }
    }
    exports.log = log;
});
define("collections/Map", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * Implements a typed map where the key is a string
    */
    var Map = (function () {
        function Map() {
            this._map = {};
        }
        Map.prototype.setItem = function (key, value) {
            this._map[key] = value;
        };
        Map.prototype.getItem = function (key) {
            return this._map[key];
        };
        Map.prototype.removeItem = function (key) {
            delete this._map[key];
        };
        Map.prototype.clear = function () {
            this._map = {};
        };
        Map.prototype.containsKey = function (key) {
            return (this._map[key] !== undefined);
        };
        Map.prototype.each = function (callback) {
            for (var name in this._map) {
                callback(this._map[name], name, this);
            }
        };
        Map.prototype.eachKey = function (callback) {
            for (var name in this._map) {
                callback(name);
            }
        };
        return Map;
    }());
    exports.Map = Map;
});
define("audio/AudioManager", ["require", "exports", "audio/AudioLib", "AsyncAction", "AsyncActionTracker", "collections/Map"], function (require, exports, AudioLib, AsyncAction_2, AsyncActionTracker_1, Map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An async action for loading audio files using an AsyncActionTracker
     */
    var LoadAudioAction = (function (_super) {
        __extends(LoadAudioAction, _super);
        function LoadAudioAction(audio, timeout) {
            var _this = _super.call(this, timeout) || this;
            _this.audio = audio;
            return _this;
        }
        LoadAudioAction.prototype.start = function () {
            var _this = this;
            var oncanplaythru = function () {
                AudioLib.log("Audio loaded: " + _this.audio.src);
                // In firefox we keep getting these events if it's not removed
                _this.audio.removeEventListener("canplaythrough", oncanplaythru);
                _this.complete();
            };
            this.audio.addEventListener("canplaythrough", oncanplaythru);
            this.audio.addEventListener("error", function (evt) {
                console.error("Error loading audio: " + _this.audio.src);
                _this.error("Error code: " + _this.audio.error.code);
            });
            return this;
        };
        return LoadAudioAction;
    }(AsyncAction_2.AsyncAction));
    exports.LoadAudioAction = LoadAudioAction;
    /**
    * Provides support for loading and caching audio elements.
    * This can be used along with an AsyncActionTracker to keep track of the loading process.
    */
    var AudioManager = (function () {
        /**
        * Creates an audio manager
        * @param audioPath The default path to look for audio files
        * @param timeout Set timeout in ms for loading audio, default no timeout
        * @param noCache Set to true to not cache audio, default false
        */
        function AudioManager(audioPath, timeout, noCache) {
            if (audioPath === void 0) { audioPath = ""; }
            if (timeout === void 0) { timeout = 0; }
            if (noCache === void 0) { noCache = false; }
            this.audioPath = audioPath;
            this.timeout = timeout;
            this.noCache = noCache;
            this.audios = new Map_1.Map();
        }
        /**
        * Gets an audio element. First checks the cache for it. If not found it will be loaded and cached.
        * @param name Name of the audio file, without a file extension
        * @param onLoaded A callback function to be called after the file has been loaded
        * @param onError A callback function to be called when there was an error loading the file
        */
        AudioManager.prototype.getAudio = function (name, onLoaded, onError) {
            // Try to get from cache
            var audio = this.audios.getItem(name);
            if (!audio) {
                // Not in cache, load it
                audio = this.createAudio(name);
                // Add event listeners
                if (onLoaded)
                    audio.onload = function () { return onLoaded(audio); };
                if (onError)
                    audio.onerror = function () { return onError(audio); };
            }
            else if (onLoaded) {
                onLoaded(audio);
            }
            return audio;
        };
        /**
        * Loads one or more audio clips
        * @param names One or more audio file names
        * @return A tracker object where you can define callbacks for loaded, done and error.
        */
        AudioManager.prototype.loadAudio = function () {
            var names = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                names[_i] = arguments[_i];
            }
            return this.loadAudios(names);
        };
        /**
        * Loads one or more audio clips from an array of audio file names
        * @param names An array of audio file names
        * @return A tracker object where you can define callbacks for loaded, done and error.
        */
        AudioManager.prototype.loadAudios = function (names) {
            var _this = this;
            var tracker = new AsyncActionTracker_1.AsyncActionTracker();
            names.forEach(function (name) {
                var audio = _this.createAudio(name);
                tracker.addAction(new LoadAudioAction(audio, _this.timeout));
            });
            return tracker;
        };
        /** Enumerates over each cached audio resource */
        AudioManager.prototype.forEach = function (callback) {
            this.audios.each(callback);
        };
        AudioManager.prototype.createAudio = function (name) {
            if (AudioLib.debugEnabled())
                AudioLib.log("Loading audio: " + name + AudioManager.audioExt);
            var audio = new Audio();
            audio.id = name;
            var src = encodeURI(this.audioPath) + "/" + encodeURIComponent(name) + AudioManager.audioExt;
            if (this.cacheParameter) {
                src += "?_v=" + this.cacheParameter;
            }
            audio.src = src;
            if (!this.noCache) {
                // Add to cache
                this.audios.setItem(name, audio);
            }
            return audio;
        };
        return AudioManager;
    }());
    AudioManager.audioExt = AudioLib.getSupportedFileTypes()[0];
    exports.AudioManager = AudioManager;
});
define("audio/MultiChannelAudioClip", ["require", "exports", "audio/AudioClip", "audio/AudioLib"], function (require, exports, AudioClip_2, AudioLib) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** The maximum number of audio channels allowed per audio element */
    exports.maxAudioChannels = 4;
    /** An audio clip with multiple channels so multiple instances can be played at the same time */
    var MultiChannelAudioClip = (function () {
        /**
            * @param audioElement The audio element used by this instance
            * @param fillChannels If set to true all channels will be prefilled. Use to increase runtime performance.
            */
        function MultiChannelAudioClip(audioElement, fillChannels) {
            if (fillChannels === void 0) { fillChannels = false; }
            this._channels = [];
            this._channels.push(new AudioClip_2.AudioClip(audioElement));
            if (fillChannels)
                this.fillChannels();
        }
        Object.defineProperty(MultiChannelAudioClip.prototype, "audioElement", {
            /** Gets the audio element */
            get: function () {
                return this._channels[0].audio;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MultiChannelAudioClip.prototype, "id", {
            get: function () {
                return this._channels[0].audio.id;
            },
            enumerable: true,
            configurable: true
        });
        /**
            * Finds a free channel and plays the audio clip.
            * If there are no channels available nothing is played.
            * @return The audio clip that was played, or null if none available
            */
        MultiChannelAudioClip.prototype.play = function () {
            var audioClip = this.getAvailableClip();
            if (audioClip) {
                audioClip.reset().play();
            }
            return audioClip;
        };
        /** Prefills all channels */
        MultiChannelAudioClip.prototype.fillChannels = function () {
            while (this.addChannel())
                ;
            return this;
        };
        /**
            * Gets the first audio clip that's available
            * @return An available audio clip, or null if none available
            */
        MultiChannelAudioClip.prototype.getAvailableClip = function () {
            var _this = this;
            // Find a free channel
            for (var i = 0; i < this._channels.length; i++) {
                var clip = this._channels[i];
                if (!clip.isPlaying()) {
                    AudioLib.log(function () { return _this.id + " using channel: " + i; });
                    return clip;
                }
            }
            // If we made it this far there are no open channels, try to add a new one
            AudioLib.log(function () { return "Adding channel " + _this._channels.length + " for: " + _this.id; });
            return this.addChannel();
        };
        /**
            * Adds a new channel if one is available
            * @return The audio clip added, or null if no more channels available
            */
        MultiChannelAudioClip.prototype.addChannel = function () {
            var _this = this;
            if (this._channels.length < exports.maxAudioChannels) {
                var audioClip = this._channels[0].clone();
                this._channels.push(audioClip);
                AudioLib.log(function () { return "Added channel for: " + _this._channels[0].audio.id; });
                return audioClip;
            }
            // No more channels left
            AudioLib.log(function () { return "No channels left for: " + _this._channels[0].audio.id; });
            return null;
        };
        return MultiChannelAudioClip;
    }());
    exports.MultiChannelAudioClip = MultiChannelAudioClip;
});
define("controllers/GameController", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ControllerButton;
    (function (ControllerButton) {
        ControllerButton[ControllerButton["NONE"] = 0] = "NONE";
        ControllerButton[ControllerButton["LEFT"] = 1] = "LEFT";
        ControllerButton[ControllerButton["RIGHT"] = 2] = "RIGHT";
        ControllerButton[ControllerButton["UP"] = 3] = "UP";
        ControllerButton[ControllerButton["DOWN"] = 4] = "DOWN";
        ControllerButton[ControllerButton["FIRE"] = 5] = "FIRE";
        ControllerButton[ControllerButton["PAUSE"] = 6] = "PAUSE";
        ControllerButton[ControllerButton["QUIT"] = 7] = "QUIT";
    })(ControllerButton = exports.ControllerButton || (exports.ControllerButton = {}));
    var GameController = (function () {
        function GameController(name) {
            if (name === void 0) { name = "na"; }
            this._connected = false;
            this._name = name;
        }
        /** Connects to the controller and starts receiving events from it
         * @return True if was able to connect
         */
        GameController.prototype.connect = function () { return this._connected = true; };
        /** Disconnects from the controller and stops receiving events from it
         * @return True if was able to disconnect
         */
        GameController.prototype.disconnect = function () {
            this._connected = false;
            return true;
        };
        Object.defineProperty(GameController.prototype, "connected", {
            get: function () {
                return this._connected;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameController.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        /** Sets the button down event handler */
        GameController.prototype.addButtonDownEventListener = function (callback) {
            this._onButtonDown = callback;
            return this;
        };
        /** Sets the button up event handler */
        GameController.prototype.addButtonUpEventListener = function (callback) {
            this._onButtonUp = callback;
            return this;
        };
        GameController.prototype.triggerButtonDownEvent = function (buttonId) {
            if (this._onButtonDown)
                this._onButtonDown({ buttonId: buttonId, controller: this });
        };
        GameController.prototype.triggerButtonUpEvent = function (buttonId) {
            if (this._onButtonUp)
                this._onButtonUp({ buttonId: buttonId, controller: this });
        };
        return GameController;
    }());
    exports.GameController = GameController;
});
define("controllers/KeyboardGameController", ["require", "exports", "KeyCodes", "controllers/GameController"], function (require, exports, KeyCodes_1, GameController_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Input controller that uses the keyboard */
    var KeyboardGameController = (function (_super) {
        __extends(KeyboardGameController, _super);
        function KeyboardGameController() {
            var _this = _super.call(this, "keyboard") || this;
            _this._xAxis = 0;
            return _this;
        }
        KeyboardGameController.prototype.connect = function () {
            var _this = this;
            if (!this.connected) {
                document.addEventListener("keydown", (this._keyDownHandler = function (evt) {
                    _this.keyDown(evt);
                }));
                document.addEventListener("keyup", (this._keyUpHandler = function (evt) {
                    _this.keyUp(evt);
                }));
                return _super.prototype.connect.call(this);
            }
            return true;
        };
        KeyboardGameController.prototype.disconnect = function () {
            if (this.connected) {
                document.removeEventListener("keydown", this._keyDownHandler);
                document.removeEventListener("keyup", this._keyUpHandler);
                return _super.prototype.disconnect.call(this);
            }
            return true;
        };
        KeyboardGameController.prototype.keyDown = function (evt) {
            var keyCode = evt.which;
            var button = this.getControllerButton(keyCode);
            if (button) {
                this.triggerButtonDownEvent(button);
                evt.preventDefault();
                return true;
            }
            return false;
        };
        KeyboardGameController.prototype.keyUp = function (evt) {
            var keyCode = evt.which;
            var button = this.getControllerButton(keyCode);
            if (button) {
                this.triggerButtonUpEvent(button);
                evt.preventDefault();
                return true;
            }
            return false;
        };
        KeyboardGameController.prototype.getControllerButton = function (keyCode) {
            switch (keyCode) {
                case KeyCodes_1.KeyCode.LEFT:
                case KeyCodes_1.KeyCode.A:
                    return GameController_1.ControllerButton.LEFT;
                case KeyCodes_1.KeyCode.RIGHT:
                case KeyCodes_1.KeyCode.D:
                    return GameController_1.ControllerButton.RIGHT;
                case KeyCodes_1.KeyCode.DOWN:
                case KeyCodes_1.KeyCode.X:
                    return GameController_1.ControllerButton.DOWN;
                case KeyCodes_1.KeyCode.UP:
                case KeyCodes_1.KeyCode.W:
                    return GameController_1.ControllerButton.UP;
                case KeyCodes_1.KeyCode.SPACE:
                    return GameController_1.ControllerButton.FIRE;
                case KeyCodes_1.KeyCode.P:
                case KeyCodes_1.KeyCode.ESCAPE:
                    return GameController_1.ControllerButton.PAUSE;
                case KeyCodes_1.KeyCode.Q:
                    return GameController_1.ControllerButton.QUIT;
            }
            return null;
        };
        return KeyboardGameController;
    }(GameController_1.GameController));
    exports.KeyboardGameController = KeyboardGameController;
});
define("ui/Element", ["require", "exports", "Convert", "System"], function (require, exports, Convert, System) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    "use strict";
    var ElementEvent = (function () {
        function ElementEvent(baseEvent, element) {
            this.baseEvent = baseEvent;
            this.element = element;
        }
        ElementEvent.prototype.stopPropagation = function () { this.baseEvent.stopPropagation(); return this; };
        ElementEvent.prototype.preventDefault = function () { this.baseEvent.preventDefault(); return this; };
        return ElementEvent;
    }());
    exports.ElementEvent = ElementEvent;
    var ElementKeyboardEvent = (function (_super) {
        __extends(ElementKeyboardEvent, _super);
        function ElementKeyboardEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ElementKeyboardEvent;
    }(ElementEvent));
    exports.ElementKeyboardEvent = ElementKeyboardEvent;
    var ElementPointerEvent = (function (_super) {
        __extends(ElementPointerEvent, _super);
        function ElementPointerEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ElementPointerEvent;
    }(ElementEvent));
    exports.ElementPointerEvent = ElementPointerEvent;
    var ElementMouseEvent = (function (_super) {
        __extends(ElementMouseEvent, _super);
        function ElementMouseEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ElementMouseEvent;
    }(ElementPointerEvent));
    exports.ElementMouseEvent = ElementMouseEvent;
    var ElementTouchEvent = (function (_super) {
        __extends(ElementTouchEvent, _super);
        function ElementTouchEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ElementTouchEvent;
    }(ElementPointerEvent));
    exports.ElementTouchEvent = ElementTouchEvent;
    /** Transforms a Event into a IElementEvent */
    function getElementEvent(evt, element) {
        var ee = new ElementEvent(evt, element);
        return ee;
    }
    /** Transforms a MouseEvent into a IElementMouseEvent */
    function getElementKeyboardEvent(evt, element) {
        var ke = getElementEvent(evt, element);
        ke.keyCode = evt.which;
        return ke;
    }
    /** Transforms a MouseEvent into a IElementMouseEvent */
    function getElementMouseEvent(evt, element) {
        var me = getElementEvent(evt, element);
        me.elementX = element.toElementX(evt.pageX);
        me.elementY = element.toElementY(evt.pageY);
        return me;
    }
    /** Transforms a MouseEvent into a IElementMouseEvent */
    function getElementTouchEvent(evt, element) {
        var te = getElementEvent(evt, element);
        if (evt["touches"] && evt["touches"].length > 0) {
            var t0 = evt["touches"][0];
            te.elementX = element.toElementX(t0.pageX);
            te.elementY = element.toElementY(t0.pageY);
        }
        return te;
    }
    /**
     * A class that wraps an HTML element and provides some normalization for manipulation and events.
     */
    var UIElement = (function () {
        function UIElement(_htmlElement) {
            this._htmlElement = _htmlElement;
        }
        Object.defineProperty(UIElement.prototype, "htmlElement", {
            /** Provides access to the underlying HTMLElement */
            get: function () {
                return this._htmlElement;
            },
            enumerable: true,
            configurable: true
        });
        /** Gets the id of this element */
        UIElement.prototype.getId = function () {
            return this._htmlElement.id;
        };
        /** Gets the parent element */
        UIElement.prototype.getParent = function () {
            return this._parent || (this._parent = new UIElement(this._htmlElement.parentElement));
        };
        /** Finds the first child element that matches the selector */
        UIElement.prototype.find = function (selector) {
            return this._htmlElement.querySelector(selector);
        };
        /** Finds all child elements that matches the selector */
        UIElement.prototype.findAll = function (selector) {
            return this._htmlElement.querySelectorAll(selector);
        };
        /** Finds the first child element that matches the selector, null if not found */
        UIElement.prototype.findElement = function (selector) {
            var e = this.find(selector);
            return e ? new UIElement(e) : null;
        };
        /** Finds all child elements that match the selector */
        UIElement.prototype.findAllElements = function (selector) {
            var elements = [];
            var list = this.findAll(selector);
            for (var i = 0; i < list.length; ++i) {
                elements.push(new UIElement(list[i]));
            }
            return elements;
        };
        UIElement.prototype.appendElement = function (element) {
            this._htmlElement.appendChild(element.htmlElement);
            return this;
        };
        UIElement.prototype.prependElement = function (element) {
            this._htmlElement.insertBefore(element.htmlElement, this._htmlElement.firstChild);
            return this;
        };
        /** Removes the specified child element */
        UIElement.prototype.removeElement = function (element) {
            this._htmlElement.removeChild(element.htmlElement);
            return this;
        };
        /** Removes all child elements */
        UIElement.prototype.removeChildren = function () {
            this._htmlElement.innerHTML = "";
            return this;
        };
        /** Clones the element */
        UIElement.prototype.clone = function (deep) {
            if (deep === void 0) { deep = true; }
            return new UIElement(this._htmlElement.cloneNode(deep));
        };
        /** Sets the inner HTML of the element from an HTML formatted string */
        UIElement.prototype.setHTML = function (html) {
            this._htmlElement.innerHTML = html;
            return this;
        };
        /** Gets the inner HTML of the element as a string */
        UIElement.prototype.getHTML = function () {
            return this._htmlElement.innerHTML;
        };
        /** Appends to the inner HTML of the element from an HTML formatted string */
        UIElement.prototype.appendHTML = function (html) {
            this._htmlElement.innerHTML += html;
            return this;
        };
        UIElement.prototype.text = function (txt) {
            if (txt === void (0)) {
                return this._htmlElement.textContent;
            }
            this._htmlElement.textContent = txt;
            return this;
        };
        UIElement.prototype.appendText = function (txt) {
            this._htmlElement.textContent += txt;
            return this;
        };
        UIElement.prototype.title = function (txt) {
            if (txt === void (0)) {
                return this._htmlElement.title;
            }
            this._htmlElement.title = txt;
            return this;
        };
        UIElement.prototype.visible = function (visible, displayStyle) {
            if (displayStyle === void 0) { displayStyle = "block"; }
            if (visible === void (0)) {
                // Determine if it's visible by walking up the DOM
                var elt = this._htmlElement;
                do {
                    var styles = window.getComputedStyle(elt);
                    if (styles.visibility === "hidden" || styles.display === "none")
                        return false;
                    elt = elt.parentElement;
                } while (elt.tagName.toUpperCase() != "BODY");
                return true;
            }
            else {
                // Set visibility
                if (visible) {
                    this._htmlElement.style.display = displayStyle;
                }
                else {
                    this._htmlElement.style.display = "none";
                }
                return this;
            }
        };
        UIElement.prototype.getComputedStyles = function () {
            return window.getComputedStyle(this._htmlElement);
        };
        /** Gets the value of a custom data attribute (data-*) */
        UIElement.prototype.getData = function (name) {
            if (this._htmlElement.dataset) {
                return this._htmlElement.dataset[Convert.toCamelCase(name)];
            }
            return this._htmlElement.getAttribute("data-" + name);
        };
        /** Sets the value of a custom data attribute */
        UIElement.prototype.setData = function (name, value) {
            if (this._htmlElement.dataset) {
                this._htmlElement.dataset[Convert.toCamelCase(name)] = value;
            }
            else
                this._htmlElement.setAttribute("data-" + name, value);
            return this;
        };
        UIElement.prototype.setAttribute = function (name, value) {
            this._htmlElement.setAttribute(name, value);
            return this;
        };
        UIElement.prototype.getAttribute = function (name) {
            return this._htmlElement.getAttribute(name);
        };
        UIElement.prototype.removeAttribute = function (name) {
            this._htmlElement.removeAttribute(name);
            return this;
        };
        UIElement.prototype.addClass = function (name) {
            if (this._htmlElement.classList) {
                this._htmlElement.classList.add(name);
            }
            else if (this._htmlElement.className) {
                // IE9
                this._htmlElement.className += (" " + name);
            }
            return this;
        };
        UIElement.prototype.removeClass = function (name) {
            if (this._htmlElement.classList) {
                this._htmlElement.classList.remove(name);
            }
            else if (this._htmlElement.className) {
                // IE9
                var className = "";
                this._htmlElement.className.split(" ").forEach(function (token) {
                    if (token !== name)
                        className += token + " ";
                });
                this._htmlElement.className = className;
            }
            return this;
        };
        UIElement.prototype.hasClass = function (className) {
            if (this._htmlElement.classList) {
                return this._htmlElement.classList.contains(className);
            }
            else if (this._htmlElement.className) {
                // IE9
                return this._htmlElement.className.split(" ").indexOf(className) >= 0;
            }
        };
        UIElement.prototype.setStyle = function (name, value, priority) {
            if (this._htmlElement.style["setAttribute"]) {
                // IE9
                this._htmlElement.style["setAttribute"](name, value);
            }
            else if (priority) {
                this._htmlElement.style.setProperty(name, value, priority);
            }
            else {
                this._htmlElement.style.setProperty(name, value);
            }
            return this;
        };
        UIElement.prototype.getStyle = function (name) {
            return this.getComputedStyles().getPropertyValue(name);
        };
        /** Gets the bounds of this element in page coordinates */
        UIElement.prototype.getBounds = function () {
            var rect = this._htmlElement.getBoundingClientRect();
            // Apply page offsets (need a new object b/c ClientRect is readonly)
            return {
                left: rect.left + window.pageXOffset,
                right: rect.right + window.pageXOffset,
                top: rect.top + window.pageYOffset,
                bottom: rect.bottom + window.pageYOffset,
                height: rect.height,
                width: rect.width
            };
        };
        UIElement.prototype.position = function (left, top) {
            if (left === void (0)) {
                var rect = this._htmlElement.getBoundingClientRect();
                // Apply page offsets
                return {
                    left: rect.left + window.pageXOffset,
                    top: rect.top + window.pageYOffset
                };
            }
            this._htmlElement.style.left = left.toString() + "px";
            this._htmlElement.style.top = top.toString() + "px";
            return this;
        };
        /** Changes the width and height of the element */
        UIElement.prototype.setDimensions = function (width, height) {
            this.setWidth(width);
            this.setHeight(height);
            return this;
        };
        /** Changes the height of the element */
        UIElement.prototype.setHeight = function (height) {
            return this.setStyle("height", height.toString() + "px");
        };
        /** Changes the width of the element */
        UIElement.prototype.setWidth = function (width) {
            return this.setStyle("width", width.toString() + "px");
        };
        /////////////////////////////////////////////////////////////////////////
        // Coordinate conversions ///////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        /** Converts page coordinates to element coordinates */
        UIElement.prototype.toElementPoint = function (pageX, pageY) {
            var pos = this.position();
            return {
                x: pageX - pos.left,
                y: pageY - pos.top
            };
        };
        /** Converts page x to element x position */
        UIElement.prototype.toElementX = function (pageX) {
            return pageX - this.position().left;
        };
        /** Converts page y to element y position */
        UIElement.prototype.toElementY = function (pageY) {
            return pageY - this.position().top;
        };
        /////////////////////////////////////////////////////////////////////////
        // Events ///////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        /** Adds a click event handler */
        UIElement.prototype.addClickListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("click", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a click event handler */
        UIElement.prototype.addDblClickListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("dblclick", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a pointer down event handler */
        UIElement.prototype.addPointerDownListener = function (callback, useCapture) {
            if (System.isTouchSupported())
                return this.addTouchStartListener(callback, useCapture);
            else
                return this.addMouseDownListener(callback, useCapture);
        };
        /** Adds a pointer up event handler */
        UIElement.prototype.addPointerUpListener = function (callback, useCapture) {
            if (System.isTouchSupported())
                return this.addTouchEndListener(callback, useCapture);
            else
                return this.addMouseUpListener(callback, useCapture);
        };
        /** Adds a pointer move event handler */
        UIElement.prototype.addPointerMoveListener = function (callback, useCapture) {
            if (System.isTouchSupported())
                return this.addTouchMoveListener(callback, useCapture);
            else
                return this.addMouseMoveListener(callback, useCapture);
        };
        /** Adds a pointer out event handler */
        UIElement.prototype.addPointerOutListener = function (callback, useCapture) {
            if (System.isTouchSupported())
                return this.addTouchCancelListener(callback, useCapture);
            else
                return this.addMouseOutListener(callback, useCapture);
        };
        /** Adds a mousedown event handler */
        UIElement.prototype.addMouseDownListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("mousedown", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a mouseup event handler */
        UIElement.prototype.addMouseUpListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("mouseup", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a mousemove event handler */
        UIElement.prototype.addMouseMoveListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("mousemove", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a mouseout event handler */
        UIElement.prototype.addMouseOutListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("mouseout", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a mouseover event handler */
        UIElement.prototype.addMouseOverListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("mouseover", function (evt) { return callback(getElementMouseEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a touchstart event handler */
        UIElement.prototype.addTouchStartListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("touchstart", function (evt) { return callback(getElementTouchEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a touchend event handler */
        UIElement.prototype.addTouchEndListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("touchend", function (evt) { return callback(getElementTouchEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a touchmove event handler */
        UIElement.prototype.addTouchMoveListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("touchmove", function (evt) { return callback(getElementTouchEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a touchcancel event handler */
        UIElement.prototype.addTouchCancelListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("touchcancel", function (evt) { return callback(getElementTouchEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a keypress event handler */
        UIElement.prototype.addKeyPressListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("keypress", function (evt) { return callback(getElementKeyboardEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a keydown event handler */
        UIElement.prototype.addKeyDownListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("keydown", function (evt) { return callback(getElementKeyboardEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a keyup event handler */
        UIElement.prototype.addKeyUpListener = function (callback, useCapture) {
            var _this = this;
            this._htmlElement.addEventListener("keyup", function (evt) { return callback(getElementKeyboardEvent(evt, _this)); }, useCapture);
            return this;
        };
        /** Adds a transitionend event handler */
        UIElement.prototype.addTransitionEndListener = function (callback, useCapture) {
            var _this = this;
            //var name = "ontransitionend" in window ? "transitionend" : "webkitTransitionEnd";
            //this._htmlElement.addEventListener(name, (evt) => callback(getElementEvent(evt, this)), useCapture);
            this._htmlElement.addEventListener("webkitTransitionEnd", function (evt) { return callback(getElementEvent(evt, _this)); }, useCapture);
            this._htmlElement.addEventListener("transitionend", function (evt) { return callback(getElementEvent(evt, _this)); }, useCapture);
            return this;
        };
        return UIElement;
    }());
    exports.UIElement = UIElement;
});
define("controllers/MouseGameController", ["require", "exports", "controllers/GameController", "ui/Element"], function (require, exports, GameController_2, Element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Game controller that uses the mouse.
     * Uses zones to determine when to trigger direction events.
     * When the mouse moves into a zone it triggers the event.
     * Any area not in one of the zones is the dead zone that causes no event.
     */
    var MouseGameController = (function (_super) {
        __extends(MouseGameController, _super);
        function MouseGameController(element, zoneSize) {
            if (zoneSize === void 0) { zoneSize = 0.45; }
            var _this = _super.call(this, "mouse") || this;
            _this.zones = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            };
            _this.element = new Element_1.UIElement(element);
            var rect = _this.element.getBounds();
            _this.zones.top = rect.height * zoneSize;
            _this.zones.bottom = rect.height - _this.zones.top;
            _this.zones.left = rect.width * zoneSize;
            _this.zones.right = rect.width - _this.zones.left;
            return _this;
        }
        MouseGameController.prototype.setZones = function (top, bottom, left, right) {
            this.zones.top = top;
            this.zones.bottom = bottom;
            this.zones.left = left;
            this.zones.right = right;
        };
        MouseGameController.prototype.connect = function () {
            var _this = this;
            if (!this.connected) {
                this.element.htmlElement.addEventListener("mousemove", (this._mouseMoveHandler = function (evt) { return _this.onMouseMove(evt); }));
                this.element.htmlElement.addEventListener("mousedown", (this._mouseDownHandler = function (evt) { return _this.onMouseDown(evt); }));
                this.element.htmlElement.addEventListener("mouseup", (this._mouseUpHandler = function (evt) { return _this.onMouseUp(evt); }));
                return _super.prototype.connect.call(this);
            }
            return true;
        };
        MouseGameController.prototype.disconnect = function () {
            if (this.connected) {
                this.element.htmlElement.removeEventListener("mousemove", this._mouseMoveHandler);
                this.element.htmlElement.removeEventListener("mousedown", this._mouseDownHandler);
                this.element.htmlElement.removeEventListener("mouseup", this._mouseUpHandler);
                return _super.prototype.disconnect.call(this);
            }
            return true;
        };
        MouseGameController.prototype.onMouseMove = function (evt) {
            var y = this.element.toElementY(evt.y);
            if (y < this.zones.top) {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.DOWN);
                this.triggerButtonDownEvent(GameController_2.ControllerButton.UP);
            }
            else if (y > this.zones.bottom) {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.UP);
                this.triggerButtonDownEvent(GameController_2.ControllerButton.DOWN);
            }
            else {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.UP);
                this.triggerButtonUpEvent(GameController_2.ControllerButton.DOWN);
            }
            var x = this.element.toElementY(evt.x);
            if (x < this.zones.left) {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.RIGHT);
                this.triggerButtonDownEvent(GameController_2.ControllerButton.LEFT);
            }
            else if (x > this.zones.right) {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.LEFT);
                this.triggerButtonDownEvent(GameController_2.ControllerButton.RIGHT);
            }
            else {
                this.triggerButtonUpEvent(GameController_2.ControllerButton.LEFT);
                this.triggerButtonUpEvent(GameController_2.ControllerButton.RIGHT);
            }
        };
        MouseGameController.prototype.onMouseDown = function (evt) {
            this.triggerButtonDownEvent(GameController_2.ControllerButton.FIRE);
        };
        MouseGameController.prototype.onMouseUp = function (evt) {
            this.triggerButtonUpEvent(GameController_2.ControllerButton.FIRE);
        };
        return MouseGameController;
    }(GameController_2.GameController));
    exports.MouseGameController = MouseGameController;
});
define("controllers/PointerGameController", ["require", "exports", "controllers/GameController", "ui/Element", "Rectangle"], function (require, exports, GameController_3, Element_2, Rectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Game controller that uses pointer events.
     * When a pointer event happens in a zone it triggers a direction or fire event.
     */
    var PointerGameController = (function (_super) {
        __extends(PointerGameController, _super);
        function PointerGameController(element, fireZone, directionZone) {
            if (fireZone === void 0) { fireZone = new Rectangle_1.Rectangle(); }
            var _this = _super.call(this, "pointer") || this;
            _this.touching = false;
            _this.fireId = 0;
            _this.directionId = 0;
            _this.element = new Element_2.UIElement(element);
            if (!(_this.fireArea = fireZone)) {
                _this.fireArea = new Rectangle_1.Rectangle();
            }
            if (!(_this.directionArea = directionZone)) {
                _this.directionArea = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bounds: new Rectangle_1.Rectangle()
                };
            }
            return _this;
        }
        PointerGameController.prototype.setDirectionArea = function (x, y, w, h) {
            this.directionArea.bounds.x = x;
            this.directionArea.bounds.y = y;
            this.directionArea.bounds.w = w;
            this.directionArea.bounds.h = h;
        };
        PointerGameController.prototype.setDirectionAreaZones = function (top, bottom, left, right) {
            this.directionArea.top = top;
            this.directionArea.bottom = bottom;
            this.directionArea.left = left;
            this.directionArea.right = right;
        };
        PointerGameController.prototype.setFireArea = function (x, y, w, h) {
            this.fireArea.x = x;
            this.fireArea.y = y;
            this.fireArea.w = w;
            this.fireArea.h = h;
        };
        PointerGameController.prototype.connect = function () {
            var _this = this;
            if (!this.connected) {
                this.element.htmlElement.addEventListener("pointerdown", (this._startHandler = function (evt) { return _this.onPointerDown(evt); }));
                this.element.htmlElement.addEventListener("pointerup", (this._endHandler = function (evt) { return _this.onPointerUp(evt); }));
                this.element.htmlElement.addEventListener("pointermove", (this._moveHandler = function (evt) { return _this.onPointerMove(evt); }));
                this.element.htmlElement.addEventListener("pointercancel", (this._cancelHandler = function (evt) { return _this.onPointerUp(evt); }));
                return _super.prototype.connect.call(this);
            }
            return true;
        };
        PointerGameController.prototype.disconnect = function () {
            if (this.connected) {
                this.element.htmlElement.removeEventListener("pointerdown", this._startHandler);
                this.element.htmlElement.removeEventListener("pointerup", this._endHandler);
                this.element.htmlElement.removeEventListener("pointermove", this._moveHandler);
                this.element.htmlElement.removeEventListener("pointercancel", this._cancelHandler);
                return _super.prototype.disconnect.call(this);
            }
            return true;
        };
        PointerGameController.prototype.onPointerMove = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var p = this.element.toElementPoint(evt.x, evt.y);
            this.handleTouch(evt.pointerId, p.x, p.y, false);
        };
        PointerGameController.prototype.onPointerDown = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.touching = true;
            var p = this.element.toElementPoint(evt.x, evt.y);
            this.handleTouch(evt.pointerId, p.x, p.y, true);
        };
        PointerGameController.prototype.onPointerUp = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (this.touching) {
                this.touching = false;
                if (evt.pointerId === this.fireId) {
                    this.fireId = 0;
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.FIRE);
                }
                else if (evt.pointerId === this.directionId) {
                    this.directionId = 0;
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.LEFT);
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.RIGHT);
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.DOWN);
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.UP);
                }
            }
        };
        PointerGameController.prototype.handleTouch = function (id, x, y, start) {
            if (this.fireArea.contains(x, y)) {
                if (start)
                    this.fireId = id;
                this.triggerButtonDownEvent(GameController_3.ControllerButton.FIRE);
            }
            else if (this.directionArea.bounds.contains(x, y)) {
                if (start)
                    this.directionId = id;
                if (y < this.directionArea.top) {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.DOWN);
                    this.triggerButtonDownEvent(GameController_3.ControllerButton.UP);
                }
                else if (y > this.directionArea.bottom) {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.UP);
                    this.triggerButtonDownEvent(GameController_3.ControllerButton.DOWN);
                }
                else {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.UP);
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.DOWN);
                }
                if (x < this.directionArea.left) {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.RIGHT);
                    this.triggerButtonDownEvent(GameController_3.ControllerButton.LEFT);
                }
                else if (x > this.directionArea.right) {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.LEFT);
                    this.triggerButtonDownEvent(GameController_3.ControllerButton.RIGHT);
                }
                else {
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.LEFT);
                    this.triggerButtonUpEvent(GameController_3.ControllerButton.RIGHT);
                }
            }
        };
        return PointerGameController;
    }(GameController_3.GameController));
    exports.PointerGameController = PointerGameController;
});
define("controllers/TouchGameController", ["require", "exports", "controllers/GameController", "ui/Element", "Rectangle"], function (require, exports, GameController_4, Element_3, Rectangle_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Game controller that uses touch gestures.
     * When a touch happens in a zone it triggers a direction or fire events.
     */
    var TouchGameController = (function (_super) {
        __extends(TouchGameController, _super);
        function TouchGameController(element, fireZone, directionZone) {
            if (fireZone === void 0) { fireZone = new Rectangle_2.Rectangle(); }
            var _this = _super.call(this, "touch") || this;
            _this.touching = false;
            _this.element = new Element_3.UIElement(element);
            if (!(_this.fireArea = fireZone)) {
                _this.fireArea = new Rectangle_2.Rectangle();
            }
            if (!(_this.directionArea = directionZone)) {
                _this.directionArea = {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bounds: new Rectangle_2.Rectangle()
                };
            }
            return _this;
        }
        TouchGameController.prototype.setDirectionArea = function (x, y, w, h) {
            this.directionArea.bounds.x = x;
            this.directionArea.bounds.y = y;
            this.directionArea.bounds.w = w;
            this.directionArea.bounds.h = h;
        };
        TouchGameController.prototype.setDirectionAreaZones = function (top, bottom, left, right) {
            this.directionArea.top = top;
            this.directionArea.bottom = bottom;
            this.directionArea.left = left;
            this.directionArea.right = right;
        };
        TouchGameController.prototype.setFireArea = function (x, y, w, h) {
            this.fireArea.x = x;
            this.fireArea.y = y;
            this.fireArea.w = w;
            this.fireArea.h = h;
        };
        TouchGameController.prototype.connect = function () {
            var _this = this;
            if (!this.connected) {
                this.element.htmlElement.addEventListener("touchstart", (this._startHandler = function (evt) { return _this.onTouchStart(evt); }));
                this.element.htmlElement.addEventListener("touchend", (this._endHandler = function (evt) { return _this.onTouchEnd(evt); }));
                this.element.htmlElement.addEventListener("touchmove", (this._moveHandler = function (evt) { return _this.onTouchMove(evt); }));
                this.element.htmlElement.addEventListener("touchcancel", (this._cancelHandler = function (evt) { return _this.onTouchEnd(evt); }));
                return _super.prototype.connect.call(this);
            }
            return true;
        };
        TouchGameController.prototype.disconnect = function () {
            if (this.connected) {
                this.element.htmlElement.removeEventListener("touchstart", this._startHandler);
                this.element.htmlElement.removeEventListener("touchend", this._endHandler);
                this.element.htmlElement.removeEventListener("touchmove", this._moveHandler);
                this.element.htmlElement.removeEventListener("touchcancel", this._cancelHandler);
                return _super.prototype.disconnect.call(this);
            }
            return true;
        };
        TouchGameController.prototype.onTouchMove = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            // handle multiple touches (left and right hand)
            for (var i = 0; i < evt.touches.length; i++) {
                var t = evt.touches[i];
                var p = this.element.toElementPoint(t.pageX, t.pageY);
                this.handleTouch(p.x, p.y);
            }
        };
        TouchGameController.prototype.onTouchStart = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.touching = true;
            // handle multiple touches (left and right hand)
            for (var i = 0; i < evt.touches.length; i++) {
                var t = evt.touches[i];
                var p = this.element.toElementPoint(t.pageX, t.pageY);
                this.handleTouch(p.x, p.y);
            }
        };
        TouchGameController.prototype.onTouchEnd = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (this.touching) {
                this.touching = false;
                for (var i = 0; i < evt.changedTouches.length; i++) {
                    var t = evt.changedTouches[i];
                    var p = this.element.toElementPoint(t.pageX, t.pageY);
                    if (this.fireArea.contains(p.x, p.y)) {
                        this.triggerButtonUpEvent(GameController_4.ControllerButton.FIRE);
                    }
                    else if (this.directionArea.bounds.contains(p.x, p.y)) {
                        this.triggerButtonUpEvent(GameController_4.ControllerButton.LEFT);
                        this.triggerButtonUpEvent(GameController_4.ControllerButton.RIGHT);
                        this.triggerButtonUpEvent(GameController_4.ControllerButton.DOWN);
                        this.triggerButtonUpEvent(GameController_4.ControllerButton.UP);
                    }
                }
            }
        };
        TouchGameController.prototype.handleTouch = function (x, y) {
            if (this.fireArea.contains(x, y)) {
                this.triggerButtonDownEvent(GameController_4.ControllerButton.FIRE);
            }
            else if (this.directionArea.bounds.contains(x, y)) {
                if (y < this.directionArea.top) {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.DOWN);
                    this.triggerButtonDownEvent(GameController_4.ControllerButton.UP);
                }
                else if (y > this.directionArea.bottom) {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.UP);
                    this.triggerButtonDownEvent(GameController_4.ControllerButton.DOWN);
                }
                else {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.UP);
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.DOWN);
                }
                if (x < this.directionArea.left) {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.RIGHT);
                    this.triggerButtonDownEvent(GameController_4.ControllerButton.LEFT);
                }
                else if (x > this.directionArea.right) {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.LEFT);
                    this.triggerButtonDownEvent(GameController_4.ControllerButton.RIGHT);
                }
                else {
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.LEFT);
                    this.triggerButtonUpEvent(GameController_4.ControllerButton.RIGHT);
                }
            }
        };
        return TouchGameController;
    }(GameController_4.GameController));
    exports.TouchGameController = TouchGameController;
});
define("io/JsonFile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    * Defines a wrapper for a Json file that includes info about the file as
    * well as the data to be saved stored in the data property.
    */
    var JsonFile = (function () {
        function JsonFile(fileType, data) {
            this.fileType = fileType;
            this.data = data;
            this.createdDate = new Date();
            this.updatedDate = new Date();
        }
        return JsonFile;
    }());
    exports.JsonFile = JsonFile;
});
define("storage/AppStorage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _isAvailable = Boolean(("localStorage" in window) && window["localStorage"]);
    /** Used to determine if local storage available */
    function isAvailable() {
        return _isAvailable;
    }
    exports.isAvailable = isAvailable;
    /**
    * Wrapper for localstorage that optionally prefixes all keys with the app name
    */
    var AppStorage = (function () {
        /** @param appName Name of the application(optional) */
        function AppStorage(appName) {
            this._prefix = "";
            this._prefix = (appName ? appName + "." : "");
        }
        Object.defineProperty(AppStorage, "isAvailable", {
            /** Used to determine if local storage available */
            get: function () {
                return isAvailable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppStorage.prototype, "prefix", {
            /** Gets the prefix that is prepended to each key */
            get: function () { return this._prefix; },
            enumerable: true,
            configurable: true
        });
        /**
            * Sets the value with the specified key into localStorage.
            * @param key Key
            * @param val Value
            * @param replacer Replacer function to use when stringifying the value
            */
        AppStorage.prototype.setValue = function (key, val, replacer) {
            if (AppStorage.isAvailable) {
                localStorage.setItem(this._prefix + key, JSON.stringify(val, replacer));
            }
            return this;
        };
        /**
            * Gets the value with the specified key from localStorage
            * @returns The value or null if not found
            */
        AppStorage.prototype.getValue = function (key, reviver) {
            if (AppStorage.isAvailable) {
                var item = this.getItem(key);
                return item != null ? JSON.parse(item, reviver) : null;
            }
            return null;
        };
        /**
            * Gets the raw value of an item from localStorage without parsing it
            * @returns The value or null if not found
            */
        AppStorage.prototype.getItem = function (key) {
            return (AppStorage.isAvailable ? localStorage.getItem(this._prefix + key) : null);
        };
        /** Removes the value with the specified key */
        AppStorage.prototype.remove = function (key) {
            if (AppStorage.isAvailable) {
                localStorage.removeItem(this._prefix + key);
            }
            return this;
        };
        /** Removes all items associated with the app */
        AppStorage.prototype.removeAll = function () {
            var keys = this.getKeys();
            for (var i in keys) {
                this.remove(keys[i]);
            }
            return this;
        };
        /**
            * Determines if the specified key has a value in localStorage
            * @returns True if the key has a value
            */
        AppStorage.prototype.contains = function (key) {
            return this.getItem(key) !== null;
        };
        /**
            * Gets the keys from localStorage for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @returns An array of keys
            */
        AppStorage.prototype.getKeys = function (filter) {
            var keys = [];
            if (AppStorage.isAvailable) {
                for (var key in localStorage) {
                    if (this.isAppKey(key)) {
                        // Remove the prefix from the key
                        if (this._prefix)
                            key = key.slice(this._prefix.length);
                        // Check the filter
                        if (!filter || filter(key)) {
                            keys.push(key);
                        }
                    }
                }
            }
            return keys;
        };
        AppStorage.prototype.isAppKey = function (key) {
            if (this._prefix) {
                return key.indexOf(this._prefix) === 0;
            }
            return true;
        };
        /** Adds a storage event handler */
        AppStorage.prototype.addStorageListener = function (callback, useCapture) {
            addEventListener("storage", callback, useCapture);
            return this;
        };
        return AppStorage;
    }());
    exports.AppStorage = AppStorage;
});
define("storage/IAppStorageAsync", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("storage/AppStorageAsync", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _isAvailable = Boolean(("localStorage" in window) && window["localStorage"]);
    /** Used to determine if local storage available */
    function isAvailable() {
        return _isAvailable;
    }
    exports.isAvailable = isAvailable;
    var AppStorageAsync = (function () {
        /** @param appName Name of the application(optional) */
        function AppStorageAsync(appName) {
            this._prefix = "";
            this._prefix = (appName ? appName + "." : "");
        }
        Object.defineProperty(AppStorageAsync, "isAvailable", {
            /** Used to determine if local storage available */
            get: function () {
                return isAvailable();
            },
            enumerable: true,
            configurable: true
        });
        /** Gets the prefix that is prepended to each key */
        AppStorageAsync.prototype.prefix = function () { return this._prefix; };
        /**
            * Sets the value with the specified key into localStorage.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        AppStorageAsync.prototype.setValue = function (key, val, callback, replacer) {
            if (AppStorageAsync.isAvailable) {
                localStorage.setItem(this._prefix + key, JSON.stringify(val, replacer));
            }
            if (callback)
                callback();
            return this;
        };
        /**
            * Gets the value with the specified key from localStorage
            * @key Key
            * @callback Fuction to call with the value. Value will be null if not found.
            * @reviver Optional reviver to use when parsing the JSON
            */
        AppStorageAsync.prototype.getValue = function (key, callback, reviver) {
            if (AppStorageAsync.isAvailable) {
                var item = this.getRawItem(key);
                callback(item != null ? JSON.parse(item, reviver) : null);
            }
            else {
                callback(null);
            }
            return this;
        };
        /**
            * Sets the value with the specified key into localStorage.
            * Note: For localstorage this is the same as calling setValue without a replacer.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        AppStorageAsync.prototype.setItem = function (key, val, callback) {
            return this.setValue(key, val, callback);
        };
        /**
            * Gets the raw value of an item from localStorage without parsing it.
            * Note: For localstorage this is the same as calling getValue without a reviver.
            * @callback Fuction to call with the item. Value will be null if not found.
            */
        AppStorageAsync.prototype.getItem = function (key, callback) {
            return this.getValue(key, callback);
        };
        /** Removes the value with the specified key */
        AppStorageAsync.prototype.remove = function (key, callback) {
            if (AppStorageAsync.isAvailable) {
                localStorage.removeItem(this._prefix + key);
            }
            if (callback)
                callback();
            return this;
        };
        /** Removes all items associated with the app */
        AppStorageAsync.prototype.removeAll = function (callback) {
            var _this = this;
            this.getKeys(function (keys) {
                for (var i in keys) {
                    _this.remove(keys[i]);
                }
                if (callback)
                    callback();
            });
            return this;
        };
        /**
            * Determines if the specified key has a value in localStorage
            * @callback Fuction to call with the result.
            */
        AppStorageAsync.prototype.contains = function (key, callback) {
            var item;
            if (AppStorageAsync.isAvailable) {
                item = this.getRawItem(key);
            }
            callback(item !== null);
            return this;
        };
        /**
            * Gets the keys from localStorage for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @callback Fuction to call with the list of keys. If none are found the list will be empty (not null).
            */
        AppStorageAsync.prototype.getKeys = function (callback, filter) {
            var keys = [];
            if (AppStorageAsync.isAvailable) {
                for (var key in localStorage) {
                    if (this.isAppKey(key)) {
                        // Remove the prefix from the key
                        if (this._prefix)
                            key = key.slice(this._prefix.length);
                        // Check the filter
                        if (!filter || filter(key)) {
                            keys.push(key);
                        }
                    }
                }
            }
            callback(keys);
            return this;
        };
        AppStorageAsync.prototype.getRawItem = function (key) {
            return localStorage.getItem(this._prefix + key);
        };
        AppStorageAsync.prototype.isAppKey = function (key) {
            if (this._prefix) {
                return key.indexOf(this._prefix) === 0;
            }
            return true;
        };
        /** Adds a storage event handler */
        AppStorageAsync.prototype.addStorageListener = function (callback) {
            addEventListener("storage", function (ev) {
                callback({
                    key: ev.key,
                    oldValue: ev.oldValue,
                    newValue: ev.newValue,
                    storageArea: "localstorage",
                });
            });
            return this;
        };
        return AppStorageAsync;
    }());
    exports.AppStorageAsync = AppStorageAsync;
});
define("storage/Chrome.AppStorageAsync", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AppStorageType;
    (function (AppStorageType) {
        AppStorageType[AppStorageType["sync"] = 0] = "sync";
        AppStorageType[AppStorageType["local"] = 1] = "local";
        AppStorageType[AppStorageType["managed"] = 2] = "managed";
    })(AppStorageType = exports.AppStorageType || (exports.AppStorageType = {}));
    /** The underlying chrome storage object (if available) */
    exports.chromeStorage = window["chrome"] ? window["chrome"]["storage"] : null;
    /** Used to determine if chrome storage available */
    function isAvailable() {
        return Boolean(exports.chromeStorage);
    }
    exports.isAvailable = isAvailable;
    /**
        * Wraps Chrome storage to comply with the System.IAppStorageAsync interface.
        * Note: Chrome storage saves objects so you don't need to convert objects to json first.
        */
    var AppStorageAsync = (function () {
        /** @param appName Name of the application(optional) */
        function AppStorageAsync(storageType, appName) {
            this._prefix = "";
            if (AppStorageAsync.isAvailable) {
                this._storageType = storageType;
                this._storageArea = exports.chromeStorage[AppStorageType[storageType]];
                this._prefix = (appName ? appName + "." : "");
            }
        }
        Object.defineProperty(AppStorageAsync, "isAvailable", {
            /** Used to determine if chrome storage available */
            get: function () {
                return isAvailable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppStorageAsync.prototype, "prefix", {
            /** Gets the prefix that is prepended to each key */
            get: function () { return this._prefix; },
            enumerable: true,
            configurable: true
        });
        /**
            * Sets the value with the specified key into this._storageArea as json.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        AppStorageAsync.prototype.setValue = function (key, val, callback, replacer) {
            return this.setItem(key, JSON.stringify(val, replacer), callback);
        };
        /**
            * Gets the value with the specified key from this._storageArea and parses its json using the reviver
            * @key Key
            * @callback Fuction to call with the value. Value will be null if not found.
            * @reviver Optional reviver to use when parsing the JSON
            */
        AppStorageAsync.prototype.getValue = function (key, callback, reviver) {
            if (AppStorageAsync.isAvailable) {
                return this.getItem(key, function (item) {
                    var v = item;
                    if (item != null && typeof item === "string") {
                        v = JSON.parse(item, reviver);
                    }
                    callback(v);
                });
            }
            else {
                callback(null);
            }
        };
        /**
            * Sets the value with the specified key into this._storageArea without converting to json first.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            */
        AppStorageAsync.prototype.setItem = function (key, val, callback) {
            if (AppStorageAsync.isAvailable) {
                key = this._prefix + key;
                var items = {};
                items[key] = val;
                this._storageArea.set(items, callback);
            }
            else {
                if (callback)
                    callback();
            }
            return this;
        };
        /**
            * Gets the raw value of an item from this._storageArea without parsing it
            * @callback Fuction to call with the value. Value will be null if not found.
            */
        AppStorageAsync.prototype.getItem = function (key, callback) {
            if (AppStorageAsync.isAvailable) {
                // Note: In chrome the value returned is wrapped in an object, so we need to unwrap it
                key = this._prefix + key;
                this._storageArea.get(key, function (data) {
                    var v = (data.hasOwnProperty(key) ? data[key] : null);
                    callback(v);
                });
            }
            else {
                if (callback)
                    callback(null);
            }
            return this;
        };
        /** Removes the value with the specified key */
        AppStorageAsync.prototype.remove = function (key, callback) {
            if (AppStorageAsync.isAvailable) {
                this._storageArea.remove(this._prefix + key, callback);
            }
            else {
                if (callback)
                    callback();
            }
            return this;
        };
        /** Removes all items associated with the app */
        AppStorageAsync.prototype.removeAll = function (callback) {
            var _this = this;
            this.getKeys(function (keys) {
                for (var i in keys) {
                    _this.remove(keys[i]);
                }
                if (callback)
                    callback();
            });
            return this;
        };
        /**
            * Determines if the specified key has a value in this._storageArea
            * @callback Fuction to call with the result.
            */
        AppStorageAsync.prototype.contains = function (key, callback) {
            this.getItem(key, function (item) { return callback(item !== null); });
            return this;
        };
        /**
            * Gets the keys from this._storageArea for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @param callback Function to call with the array of keys. If none are found the list will be empty (never null).
            */
        AppStorageAsync.prototype.getKeys = function (callback, filter) {
            var _this = this;
            var keys = [];
            if (AppStorageAsync.isAvailable) {
                this._storageArea.get(null, function (allKeys) {
                    for (var key in allKeys) {
                        if (_this.isAppKey(key)) {
                            // Remove the prefix from the key
                            if (_this._prefix)
                                key = key.slice(_this._prefix.length);
                            // Check the filter
                            if (!filter || filter(key)) {
                                keys.push(key);
                            }
                        }
                    }
                    callback(keys);
                });
            }
            else {
                callback(keys);
            }
            return this;
        };
        AppStorageAsync.prototype.isAppKey = function (key) {
            if (this._prefix) {
                return key.indexOf(this._prefix) === 0;
            }
            return true;
        };
        /** Adds a storage event handler */
        AppStorageAsync.prototype.addStorageListener = function (callback) {
            if (AppStorageAsync.isAvailable) {
                exports.chromeStorage.onChanged.addListener(function (changes, storageType) {
                    for (var key in changes) {
                        var change = changes[key];
                        callback({
                            key: key,
                            oldValue: change.oldValue,
                            newValue: change.newValue,
                            storageArea: storageType,
                        });
                    }
                });
            }
            return this;
        };
        return AppStorageAsync;
    }());
    exports.AppStorageAsync = AppStorageAsync;
});
define("ui/CanvasContext2D", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Used to test for undefined
    var undef = void (0);
    /**
     * Wrapper and high level drawing methods for HTMLCanvasElement 2D context
     */
    var CanvasContext2D = (function () {
        function CanvasContext2D(_canvas) {
            this._canvas = _canvas;
            this._context = _canvas.getContext("2d");
        }
        Object.defineProperty(CanvasContext2D.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasContext2D.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: true,
            configurable: true
        });
        ///////////////////////////////////////////////////////////////////////////////
        // Canvas methods
        ///////////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.toDataUrl = function () {
            return this._canvas.toDataURL();
        };
        CanvasContext2D.prototype.fillStyle = function (style) {
            if (style === undef) {
                return this.context.fillStyle;
            }
            this.context.fillStyle = style;
            return this;
        };
        CanvasContext2D.prototype.strokeStyle = function (style) {
            if (style === undef) {
                return this.context.strokeStyle;
            }
            this.context.strokeStyle = style;
            return this;
        };
        CanvasContext2D.prototype.lineWidth = function (width) {
            if (width === undef) {
                return this.context.lineWidth;
            }
            this.context.lineWidth = width;
            return this;
        };
        CanvasContext2D.prototype.lineCap = function (lineCap) {
            if (lineCap === undef) {
                return this.context.lineCap;
            }
            this.context.lineCap = lineCap;
            return this;
        };
        CanvasContext2D.prototype.lineJoin = function (join) {
            if (join === undef) {
                return this.context.lineJoin;
            }
            this.context.lineJoin = join;
            return this;
        };
        CanvasContext2D.prototype.miterLimit = function (limit) {
            if (limit === undef) {
                return this.context.miterLimit;
            }
            this.context.miterLimit = limit;
            return this;
        };
        CanvasContext2D.prototype.lineDash = function (sequence) {
            if ("setLineDash" in this.context) {
                if (sequence === undef) {
                    return this.context.getLineDash();
                }
                this.context["setLineDash"](sequence);
                return this;
            }
            else
                console.log(function () { return "setLineDash not supported by the browser"; });
            return null;
        };
        CanvasContext2D.prototype.shadowColor = function (color) {
            if (color === undef) {
                return this.context.shadowColor;
            }
            this.context.shadowColor = color;
            return this;
        };
        CanvasContext2D.prototype.shadowBlur = function (size) {
            if (size === undef) {
                return this.context.shadowBlur;
            }
            this.context.shadowBlur = size;
            return this;
        };
        CanvasContext2D.prototype.shadowOffsetX = function (offset) {
            if (offset === undef) {
                return this.context.shadowOffsetX;
            }
            this.context.shadowOffsetX = offset;
            return this;
        };
        CanvasContext2D.prototype.shadowOffsetY = function (offset) {
            if (offset === undef) {
                return this.context.shadowOffsetY;
            }
            this.context.shadowOffsetY = offset;
            return this;
        };
        CanvasContext2D.prototype.shadowOffset = function (offsetX, offsetY) {
            if (offsetX === undef) {
                return { offsetX: this.shadowOffsetX(), offsetY: this.shadowOffsetY() };
            }
            this.shadowOffsetX(offsetX);
            this.shadowOffsetY(offsetY === undef ? offsetX : offsetY);
            return this;
        };
        /** Sets all of the shadow styles in one call */
        CanvasContext2D.prototype.shadowStyle = function (color, offsetX, offsetY, blur) {
            this.context.shadowColor = color;
            this.context.shadowOffsetX = offsetX;
            this.context.shadowOffsetY = offsetY;
            this.context.shadowBlur = blur;
            return this;
        };
        CanvasContext2D.prototype.font = function (font) {
            if (font === undef) {
                return this.context.font;
            }
            this.context.font = font;
            return this;
        };
        CanvasContext2D.prototype.textAlign = function (alignment) {
            if (alignment === undef) {
                return this.context.textAlign;
            }
            this.context.textAlign = alignment;
            return this;
        };
        CanvasContext2D.prototype.textBaseline = function (baseline) {
            if (baseline === undef) {
                return this.context.textBaseline;
            }
            this.context.textBaseline = baseline;
            return this;
        };
        CanvasContext2D.prototype.globalAlpha = function (alpha) {
            if (alpha === undef) {
                return this.context.globalAlpha;
            }
            this.context.globalAlpha = alpha;
            return this;
        };
        CanvasContext2D.prototype.globalCompositeOperation = function (operation) {
            if (operation === undef) {
                return this.context.globalCompositeOperation;
            }
            this.context.globalCompositeOperation = operation;
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Clearing methods
        ///////////////////////////////////////////////////////////////////////////
        /** Clears the entire canvas */
        CanvasContext2D.prototype.clear = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return this;
        };
        /** Clears a portion of the canvas */
        CanvasContext2D.prototype.clearRect = function (x, y, w, h) {
            this.context.clearRect(x, y, w, h);
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Context state methods
        ///////////////////////////////////////////////////////////////////////////
        /** Pushes the current state of the context */
        CanvasContext2D.prototype.save = function () {
            this.context.save();
            return this;
        };
        /** Restores the state of the context from the last save */
        CanvasContext2D.prototype.restore = function () {
            this.context.restore();
            return this;
        };
        CanvasContext2D.prototype.scale = function (xs, ys) {
            this.context.scale(xs, ys || xs);
            return this;
        };
        /** moves the origin to the specified location */
        CanvasContext2D.prototype.translate = function (x, y) {
            this.context.translate(x, y);
            return this;
        };
        /** Rotates the canvas */
        CanvasContext2D.prototype.rotate = function (radians) {
            this.context.rotate(radians);
            return this;
        };
        /**
            * Sets the current transformation matrix
            * m11 Scales the drawing horizontally
            * m12 Skews the drawing horizontally
            * m21 Scales the drawing vertically
            * m22 Skews the drawing vertically
            * dx Moves the the drawing horizontally
            * dy Moves the the drawing vertically
        */
        CanvasContext2D.prototype.transform = function (m11, m12, m21, m22, dx, dy) {
            this.context.transform(m11, m12, m21, m22, dx, dy);
            return this;
        };
        /** Resets to the identity matrix then applies the new transformation matrix */
        CanvasContext2D.prototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
            this.context.setTransform(m11, m12, m21, m22, dx, dy);
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Image methods
        ///////////////////////////////////////////////////////////////////////////
        /**
            * Draws an image to the canvas and optionally scales it
            * @param image
            * @param x Destination x
            * @param y Destination y
            * @param w Width to scale image to (optional)
            * @param h Height to scale image to (optional)
            */
        CanvasContext2D.prototype.drawImage = function (image, x, y, w, h) {
            if (w === void 0) { w = image.width; }
            if (h === void 0) { h = image.height; }
            this.context.drawImage(image, x, y, w, h);
            return this;
        };
        /**
            * Draws a portion of an image to the canvas
            * @param image The source image
            * @param sx Clip area x
            * @param sy Clip area y
            * @param sw Clip area w
            * @param sh Clip area h
            * @param x  Destination x
            * @param y  Destination y
            * @param w  Destination w (optional, default is clip area w)
            * @param h  Destination h (optional, default is clip area h)
            */
        CanvasContext2D.prototype.drawClippedImage = function (image, sx, sy, sw, sh, x, y, w, h) {
            if (w === void 0) { w = sw; }
            if (h === void 0) { h = sh; }
            this.context.drawImage(image, sx, sy, sw, sh, x, y, w, h);
            return this;
        };
        /**
            * Draws an image rotating about its center and optionally scales it
            * @param image
            * @param x Destination x
            * @param y Destination y
            * @param angle Angle in radians (0 to 2PI)
            * @param w Width to scale image to (optional)
            * @param h Height to scale image to (optional)
            */
        CanvasContext2D.prototype.drawRotatedImage = function (image, x, y, angle, width, height) {
            if (width === void 0) { width = image.width; }
            if (height === void 0) { height = image.height; }
            this.context.save();
            // Move to where we want to draw the image
            this.context.translate(x, y);
            this.context.rotate(angle);
            // Draw image at its center
            var cx = ((width || image.width) / 2);
            var cy = ((height || image.height) / 2);
            this.context.drawImage(image, -cx, -cy, width, height);
            this.context.restore();
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Line methods
        ///////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.drawLine = function (x1, y1, x2, y2) {
            this.context.beginPath();
            this.context.moveTo(x1, y1);
            this.context.lineTo(x2, y2);
            this.context.stroke();
            return this;
        };
        /** Draws the lines defined by the set of coordinates
            * @param coords An array containing sets of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        CanvasContext2D.prototype.drawLines = function () {
            var coords = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                coords[_i] = arguments[_i];
            }
            if (this.definePolyline(coords)) {
                this.context.stroke();
            }
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Circle/Arc methods
        ///////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.drawCircle = function (x, y, radius) {
            this.beginPath()
                .arc(x, y, radius, 0, CanvasContext2D.TWO_PI, true)
                .closePath()
                .stroke();
            return this;
        };
        CanvasContext2D.prototype.fillCircle = function (x, y, radius) {
            this.beginPath()
                .arc(x, y, radius, 0, CanvasContext2D.TWO_PI, true)
                .closePath()
                .fill();
            return this;
        };
        CanvasContext2D.prototype.drawArc = function (x, y, radius, start, end, anticlockwise) {
            if (anticlockwise === void 0) { anticlockwise = false; }
            this.beginPath()
                .arc(x, y, radius, start, end, anticlockwise)
                .stroke();
            return this;
        };
        CanvasContext2D.prototype.fillArc = function (x, y, radius, start, end, anticlockwise) {
            if (anticlockwise === void 0) { anticlockwise = false; }
            this.beginPath()
                .arc(x, y, radius, start, end, anticlockwise)
                .fill();
            return this;
        };
        CanvasContext2D.prototype.drawEllipse = function (x, y, rx, ry) {
            if (rx === ry)
                return this.drawCircle(x, y, rx);
            this.defineEllipse(x, y, rx, ry)
                .stroke();
            return this;
        };
        CanvasContext2D.prototype.fillEllipse = function (x, y, rx, ry) {
            if (rx === ry)
                return this.fillCircle(x, y, rx);
            this.defineEllipse(x, y, rx, ry)
                .fill();
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Rectangle methods
        ///////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.drawRect = function (x, y, w, h) {
            this.context.strokeRect(x, y, w, h);
            return this;
        };
        CanvasContext2D.prototype.fillRect = function (x, y, w, h) {
            this.context.fillRect(x, y, w, h);
            return this;
        };
        CanvasContext2D.prototype.drawRoundedRect = function (x, y, w, h, r) {
            if (typeof r === "number") {
                r = [r, r, r, r];
            }
            this.defineRoundedRect(x, y, w, h, r);
            this.context.stroke();
            return this;
        };
        CanvasContext2D.prototype.fillRoundedRect = function (x, y, w, h, r) {
            if (typeof r === "number") {
                r = [r, r, r, r];
            }
            this.defineRoundedRect(x, y, w, h, r);
            this.context.fill();
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Shape methods
        ///////////////////////////////////////////////////////////////////////////
        /** Draws a shape defined by the set of coordinates
            * @param coords Array of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        CanvasContext2D.prototype.drawShape = function () {
            var coords = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                coords[_i] = arguments[_i];
            }
            if (this.definePolyline(coords)) {
                this.context.closePath();
                this.context.stroke();
            }
            return this;
        };
        /** Fills a shape defined by the set of coordinates
            * @param coords Array of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        CanvasContext2D.prototype.fillShape = function () {
            var coords = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                coords[_i] = arguments[_i];
            }
            if (this.definePolyline(coords)) {
                this.context.closePath();
                this.context.fill();
            }
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Text methods
        ///////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.drawText = function (text, x, y, maxWidth) {
            if (maxWidth === undef)
                this.context.strokeText(text, x, y);
            else
                this.context.strokeText(text, x, y, maxWidth);
            return this;
        };
        CanvasContext2D.prototype.fillText = function (text, x, y, maxWidth) {
            if (maxWidth === undef)
                this.context.fillText(text, x, y);
            else
                this.context.fillText(text, x, y, maxWidth);
            return this;
        };
        CanvasContext2D.prototype.measureText = function (text) {
            return this.context.measureText(text).width;
        };
        CanvasContext2D.prototype.createLinearGradient = function (x0, y0, x1, y1) {
            var colorsOrStops = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                colorsOrStops[_i - 4] = arguments[_i];
            }
            var gradient = this.context.createLinearGradient(x0, y0, x1, y1);
            return this.addGradientColorStops.apply(this, [gradient].concat(colorsOrStops));
        };
        CanvasContext2D.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
            var colorsOrStops = [];
            for (var _i = 6; _i < arguments.length; _i++) {
                colorsOrStops[_i - 6] = arguments[_i];
            }
            var gradient = this.context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            return this.addGradientColorStops.apply(this, [gradient].concat(colorsOrStops));
        };
        /**
            * Cerates a pattern from an image
            * @param image
            * @param repetition Type of repetition (Use CanvasContext2D.Repetition), default is repeat.
            */
        CanvasContext2D.prototype.createPattern = function (image, repetition) {
            if (repetition === void 0) { repetition = CanvasContext2D.Repetition.repeat; }
            return this.context.createPattern(image, repetition);
        };
        CanvasContext2D.prototype.drawLinearGradient = function (x, y, w, h, angle) {
            var colorsOrStops = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                colorsOrStops[_i - 5] = arguments[_i];
            }
            if (angle < 0 || angle > CanvasContext2D.PI_OVER_2) {
                throw new Error("CanvasContext2D.drawLinearGradient angle must be between 0 and PI/2");
            }
            var dx = Math.cos(angle);
            var dy = Math.sin(angle);
            var gradient = this.createLinearGradient.apply(this, [x, y, x + dx * w, y + dy * h].concat(colorsOrStops));
            this.save()
                .fillStyle(gradient)
                .fillRect(x, y, w, h)
                .restore();
            return this;
        };
        CanvasContext2D.prototype.drawRadialGradient = function (x, y, r) {
            var colorsOrStops = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                colorsOrStops[_i - 3] = arguments[_i];
            }
            var gradient = this.createRadialGradient.apply(this, [x, y, r, x, y, 0].concat(colorsOrStops));
            this.save()
                .fillStyle(gradient)
                .fillCircle(x, y, r)
                .restore();
            return this;
        };
        CanvasContext2D.prototype.drawPattern = function (x, y, w, h, imageOrPattern, repetition) {
            if (repetition === void 0) { repetition = CanvasContext2D.Repetition.repeat; }
            var pat = (imageOrPattern instanceof CanvasPattern ? imageOrPattern : this.createPattern(imageOrPattern, repetition));
            this.save()
                .fillStyle(pat)
                .translate(x, y)
                .fillRect(0, 0, w, h)
                .restore();
            return this;
        };
        CanvasContext2D.prototype.createImageData = function (imageDataOrW, h) {
            if (h === undef) {
                return this.context.createImageData(imageDataOrW);
            }
            else {
                return this.context.createImageData(imageDataOrW, h);
            }
        };
        CanvasContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
            return this.context.getImageData(sx || 0, sy || 0, sw || this.canvas.width, sh || this.canvas.height);
        };
        CanvasContext2D.prototype.putImageData = function (imageData, x, y, destX, destY, destW, destH) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            // Passing in undefined values doesn't work so check params
            if (destX === undef) {
                this.context.putImageData(imageData, x, y);
            }
            else if (destW === undef) {
                this.context.putImageData(imageData, x, y, destX, destY);
            }
            else {
                this.context.putImageData(imageData, x, y, destX, destY, destW, destH);
            }
            return this;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Primitive Path methods
        ///////////////////////////////////////////////////////////////////////////
        CanvasContext2D.prototype.rect = function (x, y, w, h) {
            this.context.rect(x, y, w, h);
            return this;
        };
        CanvasContext2D.prototype.fill = function () {
            this.context.fill();
            return this;
        };
        CanvasContext2D.prototype.stroke = function () {
            this.context.stroke();
            return this;
        };
        CanvasContext2D.prototype.beginPath = function () {
            this.context.beginPath();
            return this;
        };
        CanvasContext2D.prototype.closePath = function () {
            this.context.closePath();
            return this;
        };
        CanvasContext2D.prototype.moveTo = function (x, y) {
            this.context.moveTo(x, y);
            return this;
        };
        CanvasContext2D.prototype.lineTo = function (x, y) {
            this.context.lineTo(x, y);
            return this;
        };
        CanvasContext2D.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            this.context.quadraticCurveTo(cpx, cpy, x, y);
            return this;
        };
        CanvasContext2D.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            return this;
        };
        CanvasContext2D.prototype.arc = function (x, y, r, startRads, endRads, anticlockwise) {
            this.context.arc(x, y, r, startRads, endRads, anticlockwise);
            return this;
        };
        CanvasContext2D.prototype.arcTo = function (x1, y1, x2, y2, r) {
            this.context.arcTo(x1, y1, x2, y2, r);
            return this;
        };
        CanvasContext2D.prototype.setClipRect = function (x, y, w, h) {
            this.beginPath()
                .rect(x, y, w, h)
                .clip();
            return this;
        };
        CanvasContext2D.prototype.clip = function () {
            this.context.clip();
            return this;
        };
        CanvasContext2D.prototype.isPointInPath = function (x, y) {
            return this.context.isPointInPath(x, y);
        };
        ///////////////////////////////////////////////////////////////////////////
        // Private methods
        ///////////////////////////////////////////////////////////////////////////
        /**
            * Defines the path for a rounded rectangle
            * @param x The top left x coordinate
            * @param y The top left y coordinate
            * @param width The width of the rectangle
            * @param height The height of the rectangle
            * @param radii The radii of each corner (clockwise from upper-left)
            */
        CanvasContext2D.prototype.defineRoundedRect = function (x, y, w, h, radii) {
            this.context.beginPath();
            this.context.moveTo(x + radii[0], y);
            this.context.lineTo(x + w - radii[1], y);
            this.context.quadraticCurveTo(x + w, y, x + w, y + radii[1]);
            this.context.lineTo(x + w, y + h - radii[2]);
            this.context.quadraticCurveTo(x + w, y + h, x + w - radii[2], y + h);
            this.context.lineTo(x + radii[3], y + h);
            this.context.quadraticCurveTo(x, y + h, x, y + h - radii[3]);
            this.context.lineTo(x, y + radii[0]);
            this.context.quadraticCurveTo(x, y, x + radii[0], y);
            this.context.closePath();
            return this;
        };
        /** Defines the path for an ellipse */
        CanvasContext2D.prototype.defineEllipse = function (x, y, rx, ry) {
            var radius = Math.max(rx, ry);
            var scaleX = rx / radius;
            var scaleY = ry / radius;
            this.context.save();
            this.context.translate(x, y);
            this.context.scale(scaleX, scaleY);
            this.context.beginPath();
            this.context.arc(0, 0, radius, 0, CanvasContext2D.TWO_PI, true);
            this.context.closePath();
            this.context.restore();
            return this;
        };
        /** Defines the path for a set of coordinates
            * @param {number[]} coords Set of x and y coordinates
            */
        CanvasContext2D.prototype.definePolyline = function (coords) {
            /// Draws an set of lines without stroking or filling
            if (coords.length > 2) {
                this.context.beginPath();
                this.context.moveTo(coords[0], coords[1]);
                for (var i = 2; i < coords.length; i += 2) {
                    this.context.lineTo(coords[i], coords[i + 1]);
                }
                return true;
            }
            return false;
        };
        //private addGradientColorStops(gradient: CanvasGradient, color1: string, color2: string): CanvasGradient;
        //private addGradientColorStops(gradient: CanvasGradient, ...colorsOrStops: CanvasContext2D.IColorStop[]): CanvasGradient;
        CanvasContext2D.prototype.addGradientColorStops = function (gradient) {
            var colorsOrStops = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                colorsOrStops[_i - 1] = arguments[_i];
            }
            if (colorsOrStops && colorsOrStops.length > 0) {
                if (colorsOrStops.length === 2 && typeof colorsOrStops[0] === "string") {
                    gradient.addColorStop(0, colorsOrStops[0]);
                    gradient.addColorStop(1, colorsOrStops[1]);
                }
                else {
                    for (var i = 0; i < colorsOrStops.length; i++) {
                        var stop = colorsOrStops[i];
                        gradient.addColorStop(stop.offset, stop.color);
                    }
                }
            }
            return gradient;
        };
        ///////////////////////////////////////////////////////////////////////////
        // Static methods
        ///////////////////////////////////////////////////////////////////////////
        /**
            * Converts degrees to radians
            * @param degrees
            */
        CanvasContext2D.toRadians = function (degrees) {
            return CanvasContext2D.PI_OVER_180 * degrees;
        };
        return CanvasContext2D;
    }());
    ///////////////////////////////////////////////////////////////////////////////
    // Constants
    ///////////////////////////////////////////////////////////////////////////////
    CanvasContext2D.PI_OVER_180 = Math.PI / 180;
    CanvasContext2D.PI_OVER_2 = Math.PI / 2;
    CanvasContext2D.TWO_PI = 2 * Math.PI;
    CanvasContext2D.TAU = 2 * Math.PI;
    ///////////////////////////////////////////////////////////////////////////
    // Enums
    ///////////////////////////////////////////////////////////////////////////
    CanvasContext2D.TextBaseline = {
        top: "top",
        middle: "middle",
        bottom: "bottom",
        alphabetic: "alphabetic",
        hanging: "hanging"
    };
    CanvasContext2D.TextAlign = {
        left: "left",
        right: "right",
        center: "center",
        start: "start",
        end: "end"
    };
    CanvasContext2D.Repetition = {
        repeat: "repeat",
        repeatX: "repeat-x",
        repeatY: "repeat-y",
        noRepeat: "no-repeat"
    };
    CanvasContext2D.CompositeOperation = {
        sourceOver: "source-over",
        sourceAtop: "source-atop",
        sourceIn: "source-in",
        sourceOut: "source-out",
        destinationOver: "destination-over",
        destinationAtop: "destination-atop",
        destinationIn: "destination-in",
        destinationOut: "destination-out",
        lighter: "lighter",
        copy: "copy",
        xor: "xor"
    };
    CanvasContext2D.LineCap = {
        butt: "butt",
        round: "round",
        square: "square"
    };
    CanvasContext2D.LineJoin = {
        bevel: "bevel",
        round: "round",
        miter: "miter"
    };
    exports.CanvasContext2D = CanvasContext2D;
});
define("ui/ElementMouseEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Wraps a mouse event to provide element based positions
     */
    var ElementMouseEvent = (function () {
        /**
         * @param element The element the event ocurred on
         * @param event The mouse event
         */
        function ElementMouseEvent(element, event) {
            this.element = element;
            this.event = event;
            var rect = element.getBoundingClientRect();
            var left = rect.left + window.pageXOffset;
            var top = rect.top + window.pageYOffset;
            this.elementX = event.pageX - left;
            this.elementY = event.pageY - top;
        }
        return ElementMouseEvent;
    }());
    exports.ElementMouseEvent = ElementMouseEvent;
});
//# sourceMappingURL=taffy-modules.js.map