declare module "AsyncAction" {
    export interface IAsyncAction {
        /** Adds a function to be called when the action is completed */
        onCompleted: (callback: (action: IAsyncAction) => any) => IAsyncAction;
        /** Adds a function to be called when the action errors out */
        onError: (callback: (action: IAsyncAction, message: string) => any) => IAsyncAction;
        /** Called when the action should be started */
        start: () => IAsyncAction;
    }
    /**
    * Abstract base class for building an async action with optional timeout.
    * The start() method must be implemented.
    * When the action is done it should call either complete() or error().
    */
    export abstract class AsyncAction implements IAsyncAction {
        private timeoutId;
        private callbacks;
        /** @param timeout (optional) Sets the number of ms before the action times out */
        constructor(timeout?: number);
        /**
         *  Method to be called when the action should be started
         */
        abstract start(): AsyncAction;
        onCompleted(callback: (action: AsyncAction) => any): AsyncAction;
        onError(callback: (action: AsyncAction, message: string) => any): AsyncAction;
        /** Method to be called when the action is complete */
        protected complete(): void;
        /** Method to be called when the action errors out */
        protected error(message: string): void;
    }
}
declare module "AsyncActionTracker" {
    import { IAsyncAction } from "AsyncAction";
    /**
    * Used to track the progress of any number of async actions, usually loading external resources.
    * Usage: import {AsyncActionTracker} from "../../src/AsyncActionTracker";
    */
    export class AsyncActionTracker<T extends IAsyncAction> {
        constructor();
        private internal;
        private callbacks;
        /** Percentage of actions that have been completed (including errors), between 0 and 1 */
        readonly percentComplete: number;
        /** Total number of actions being tracked */
        readonly totalCount: number;
        /** Total number of actions that have been successfully completed */
        readonly completedCount: number;
        /** Total number of actions that have errored out */
        readonly errorCount: number;
        /** Used to determine if all actions have been completed */
        readonly isDone: boolean;
        /** Adds any number of actions to the tracker and starts them */
        addActions(...items: T[]): AsyncActionTracker<T>;
        /** Adds one action to the tracker and starts it */
        addAction(item: T): AsyncActionTracker<T>;
        /** Sets the function to be called when an action is successfully completed */
        actionComplete(callback: (item: T, tracker: AsyncActionTracker<T>) => any): AsyncActionTracker<T>;
        /** Sets the function to call when an action errors out */
        actionError(callback: (item: T, errmsg: string, tracker: AsyncActionTracker<T>) => any): AsyncActionTracker<T>;
        /** Sets the function to call when all actions have completed or errored out */
        done(callback: (tracker: AsyncActionTracker<T>, hasErrors: boolean) => any): AsyncActionTracker<T>;
    }
}
declare module "Byte" {
    /**
     * A class for storing and manipulating an unsigned byte value (0 to 255)
     * Usage: import {Byte} from "./Byte";
     */
    export class Byte {
        /**
         * Create a new instance from a number.
         * If the number is too big or small to fit into a byte it will be truncated and the overflow flag set.
         * @param n
         */
        constructor(n: number);
        private _overflow;
        /** Used to determine if the number was modified to fit into a byte value */
        readonly overflow: boolean;
        private _value;
        /** Gets the value of the byte as a number **/
        readonly value: number;
        static MIN_VALUE: number;
        static MAX_VALUE: number;
        /** Makes a number fit into a byte by truncating it */
        static truncate(b: number): number;
        /** Makes a number fit into a byte using modulus */
        static mod(b: number): number;
        /**
         * Checks is a number is in the range of a byte value
         */
        static isByte(b: number): boolean;
    }
}
declare module "System" {
    export var Console: Console;
    /** Puts URL query parameters into a map (an object). The values are url decoded. */
    export function getQueryParameters(): any;
    /** Clones a data object */
    export function clone<T>(obj: T): T;
    /** Opens a new browser window */
    export function openWindow(url?: string, target?: string, features?: string, replace?: boolean): Window;
    /** Determines if a value is null or undefined, as opposed to falsy */
    export function isNullOrUndefined(val: any): boolean;
    /** Determines if a value is undefined, as opposed to falsy */
    export function isUndefined(val: any): boolean;
    /** Determines if a value is a number */
    export function isNumber(val: any): boolean;
    /** Determines if a value is a string */
    export function isString(val: any): boolean;
    /** Determines if a number is finite.  If the argument is NaN, positive infinity, or negative infinity, this method returns false. */
    export function isFiniteNumber(val: number): boolean;
    /** Determines if a number is NaN */
    export function isNotANumber(val: number): boolean;
    /** Coerces a number to a 32-bit integer (may increase performance of math operations) */
    export function toInt32(n: number): number;
    /** Puts a function in the event queue to be run.
        *  This will let other events in the queue (such as UI updates) be handled before the function runs.
        */
    export function queueFn(callback: Function): void;
    /** Returns true of the browser supports touch events */
    export function isTouchSupported(): boolean;
    /** Returns true of the browser supports pointer events */
    export function isPointerSupported(): boolean;
    /** Returns true of the browser supports mouse events */
    export function isMouseSupported(): boolean;
    /** Converts a value to a json string */
    export function toJson(value: any): string;
    /** Parses a json string to an object of the specified type */
    export function parseJson<T>(text: string): T;
    /** Shows a confirm dialog and returns the result */
    export function confirm(message?: string): boolean;
    /** Shows an alert dialog */
    export function alert(message?: string): void;
    /** Requests an animation frame and returns the handle */
    export function requestAnimationFrame(callback: FrameRequestCallback): number;
    export function cancelAnimationFrame(handle: number): void;
    export function setInterval(callback: Function, timeout?: any, ...args: any[]): number;
    export function clearInterval(handle: number): void;
    export function setTimeout(callback: Function, timeout?: any, ...args: any[]): number;
    export function clearTimeout(handle: number): void;
    /** Adds a function to be called when the DOM is ready */
    export function ready(callback: () => any): void;
}
declare module "Convert" {
    /** Parses a string into a decimal number (i.e. not an integer) */
    export function toFloat(str: string): number;
    /** Parses a string into an integer number */
    export function toInt(str: string, radix?: number): number;
    /** Converts a value to a string or empty string if undefined or null */
    export function toString(val: any): string;
    /** Converts a css-type dasherized string to camel case. (e.g. background-color => backgroundColor) */
    export function toCamelCase(name: string): string;
}
declare module "Color" {
    /**
     * An immutable color object
     * Usage: import {Color} from "./Color";
     */
    export class Color {
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
        red(): number;
        green(): number;
        blue(): number;
        alpha(): number;
        protected _rgb: string;
        protected _rgba: string;
        protected _hex: string;
        /**
        * Gets the rgb(x,x,x) value of the color
        * @return String rgb color
        */
        toRGB(): string;
        /**
         * Gets the rgba(x,x,x,x) value of the color
        * @param alpha Optional overide for the alpha
        * @return String rgba color
        */
        toRGBA(alpha?: string): string;
        /** Gets the hex value of the color
        * @param shorthandAcceptable If true will return #333 instead of #333333, default is false
        * @return String hex color
        */
        toHex(shorthandAcceptable?: boolean): string;
        /**
        * Get a color that is lighter than this color
        * @param amount Amount to lighten where 0 is 0% and 1 is 100%
        */
        lighter(amount?: number): Color;
        /**
        * Get a color that is darker than this color
        * @param amount Amount to darken where 0 is 0% and 1 is 100%
        */
        darker(amount?: number): Color;
        /**
         * Get a color that is more transparent than this color
         * @param amount Amount to fade where 0 is 0% and 1 is 100%
         */
        fade(amount?: number): Color;
        protected validateByte(n: number): number;
        private toColorPart(n);
        private reHex;
        private reRgb;
        private reRgba;
        /**
        * Parse color strings into Color objects.
        * @param str hexadecimal, shorthand hex, rgb() or rgba()
        * @return Color {r: XXX, g: XXX, b: XXX, a: x} or undefined if invalid
        */
        private parse(str);
    }
    /**
     * A set of static color objects by name
     */
    export var colors: {
        red: Color;
        yellow: Color;
        green: Color;
        cyan: Color;
        blue: Color;
        purple: Color;
    };
    /**
     * A mutable color object
     */
    export class MutableColor extends Color {
        red(): number;
        red(r: number): MutableColor;
        green(): number;
        green(g: number): MutableColor;
        blue(): number;
        blue(b: number): MutableColor;
        alpha(): number;
        alpha(a: number): MutableColor;
        /**
        * Makes the color lighter
        * @param amount Amount to lighten where 0 is 0% and 1 is 100%
        */
        lighter(amount?: number): MutableColor;
        /**
        * Makes the color darker
        * @param amount Amount to darken where 0 is 0% and 1 is 100%
        */
        darker(amount?: number): Color;
        /**
         * Makes the color more transparent
         * @param amount Amount to fade where 0 is 0% and 1 is 100%
         */
        fade(amount?: number): Color;
        private reset();
    }
}
declare module "KeyCodes" {
    /** Key codes for handling keyboard events */
    export enum KeyCode {
        NUL = 0,
        TAB = 9,
        ENTER = 13,
        SHIFT = 16,
        CONTROL = 17,
        ALT = 18,
        ESCAPE = 27,
        SPACE = 32,
        HOME = 36,
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40,
        DELETE = 46,
        NUM0 = 48,
        NUM1 = 49,
        NUM2 = 50,
        NUM3 = 51,
        NUM4 = 52,
        NUM5 = 53,
        NUM6 = 54,
        NUM7 = 55,
        NUM8 = 56,
        NUM9 = 57,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        PLUS = 107,
        MINUS = 109,
        COMMA = 188,
        PERIOD = 190,
    }
}
declare module "LoadImageAction" {
    import { AsyncAction } from "AsyncAction";
    export class LoadImageAction extends AsyncAction {
        img: HTMLImageElement;
        constructor(img: HTMLImageElement, timeout?: number);
        start(): LoadImageAction;
    }
}
declare module "Random" {
    /**
    * Gets a random number between 0 and max
    * @param max
    */
    export function nextTo(max?: number): number;
    /**
    * Gets a random number between min and max
    * @param min
    * @param max
    */
    export function next(min?: number, max?: number): number;
    /**
    * Gets a random integer between min and max
    * @param min
    * @param max
    */
    export function nextInt(min: number, max: number): number;
    /**
    * Gets a random integer between 0 and max
    * @param max
    */
    export function nextIntTo(max: number): number;
    /**
     * Gets a random boolean value
     */
    export function nextBoolean(): boolean;
}
declare module "Rectangle" {
    export class Rectangle {
        x: number;
        y: number;
        w: number;
        h: number;
        constructor(x?: number, y?: number, w?: number, h?: number);
        readonly top: number;
        readonly bottom: number;
        readonly left: number;
        readonly right: number;
        /** Moves the rect to a new position */
        moveTo(x: number, y: number): Rectangle;
        /** Determines if this rect intersects with another */
        intersects(rect: Rectangle): boolean;
        /** Determines if this rect contains a point */
        contains(x: number, y: number): boolean;
    }
}
declare module "audio/AudioClip" {
    /** Wrapper for HTML5 audio */
    export class AudioClip {
        protected audioElement: HTMLAudioElement;
        private _fadeTimeout;
        private _fading;
        constructor(audio: HTMLAudioElement);
        /** Gets the audio element */
        readonly audio: HTMLAudioElement;
        loop: boolean;
        play(): AudioClip;
        pause(): AudioClip;
        stop(): AudioClip;
        reset(): AudioClip;
        isPlaying(): boolean;
        getVolume(): number;
        setVolume(vol: number): AudioClip;
        /** Makes a copy of the audio clip backed by a new audio element. Note: there are limitations to the number of instances of an audio element. */
        clone(): AudioClip;
        fadeOut(time: number): AudioClip;
        private normalizeVolume(vol);
        private fadeLoop(delta);
        private stopFadeOut();
    }
}
declare module "audio/AudioClipLoop" {
    import { AudioClip } from "audio/AudioClip";
    /** Implements an audio clip that loops properly */
    export class AudioClipLoop extends AudioClip {
        private audios;
        private pointer;
        private timeout;
        private timerId;
        constructor(audio: HTMLAudioElement);
        private playNext();
        play(): AudioClipLoop;
        pause(): AudioClipLoop;
        setVolume(vol: number): AudioClipLoop;
        fadeOut(time: number): AudioClipLoop;
    }
}
declare module "audio/AudioLib" {
    export function debugEnabled(enable: boolean): void;
    export function debugEnabled(): boolean;
    /**
    * Returns a list of all audio file extensions supported by the browser
    * Note: you may need to add some file extensions to your server's list of MIME types
    */
    export function getSupportedFileTypes(): string[];
    export function log(getMsg: () => string): void;
    export function log(msg: string): void;
}
declare module "collections/Map" {
    /**
    * Implements a typed map where the key is a string
    */
    export class Map<V> {
        private _map;
        setItem(key: string, value: V): void;
        getItem(key: string): V;
        removeItem(key: string): void;
        clear(): void;
        containsKey(key: string): boolean;
        each(callback: (item: V, key: string, map: Map<V>) => any): void;
        eachKey(callback: (key: string) => any): void;
    }
}
declare module "audio/AudioManager" {
    import { AsyncAction } from "AsyncAction";
    import { AsyncActionTracker } from "AsyncActionTracker";
    /**
     * An async action for loading audio files using an AsyncActionTracker
     */
    export class LoadAudioAction extends AsyncAction {
        audio: HTMLAudioElement;
        constructor(audio: HTMLAudioElement, timeout?: number);
        start(): LoadAudioAction;
    }
    /**
    * Provides support for loading and caching audio elements.
    * This can be used along with an AsyncActionTracker to keep track of the loading process.
    */
    export class AudioManager {
        private audioPath;
        private timeout;
        private noCache;
        private audios;
        private static audioExt;
        /**
        * If defined a parameter will be added to all urls for audio files and it's value will be set to this value.
        * Use this as a version number to bust browser cache and make sure new versions of the files are loaded.
        */
        cacheParameter: string;
        /**
        * Creates an audio manager
        * @param audioPath The default path to look for audio files
        * @param timeout Set timeout in ms for loading audio, default no timeout
        * @param noCache Set to true to not cache audio, default false
        */
        constructor(audioPath?: string, timeout?: number, noCache?: boolean);
        /**
        * Gets an audio element. First checks the cache for it. If not found it will be loaded and cached.
        * @param name Name of the audio file, without a file extension
        * @param onLoaded A callback function to be called after the file has been loaded
        * @param onError A callback function to be called when there was an error loading the file
        */
        getAudio(name: string, onLoaded?: (audio: HTMLAudioElement) => any, onError?: (audio: HTMLAudioElement) => any): HTMLAudioElement;
        /**
        * Loads one or more audio clips
        * @param names One or more audio file names
        * @return A tracker object where you can define callbacks for loaded, done and error.
        */
        loadAudio(...names: string[]): AsyncActionTracker<LoadAudioAction>;
        /**
        * Loads one or more audio clips from an array of audio file names
        * @param names An array of audio file names
        * @return A tracker object where you can define callbacks for loaded, done and error.
        */
        loadAudios(names: string[]): AsyncActionTracker<LoadAudioAction>;
        /** Enumerates over each cached audio resource */
        forEach(callback: (audio: HTMLAudioElement, name: string) => any): void;
        private createAudio(name);
    }
}
declare module "audio/MultiChannelAudioClip" {
    import { AudioClip } from "audio/AudioClip";
    /** The maximum number of audio channels allowed per audio element */
    export var maxAudioChannels: number;
    /** An audio clip with multiple channels so multiple instances can be played at the same time */
    export class MultiChannelAudioClip {
        private _channels;
        /**
            * @param audioElement The audio element used by this instance
            * @param fillChannels If set to true all channels will be prefilled. Use to increase runtime performance.
            */
        constructor(audioElement: HTMLAudioElement, fillChannels?: boolean);
        /** Gets the audio element */
        readonly audioElement: HTMLAudioElement;
        readonly id: string;
        /**
            * Finds a free channel and plays the audio clip.
            * If there are no channels available nothing is played.
            * @return The audio clip that was played, or null if none available
            */
        play(): AudioClip;
        /** Prefills all channels */
        fillChannels(): MultiChannelAudioClip;
        /**
            * Gets the first audio clip that's available
            * @return An available audio clip, or null if none available
            */
        private getAvailableClip();
        /**
            * Adds a new channel if one is available
            * @return The audio clip added, or null if no more channels available
            */
        private addChannel();
    }
}
declare module "controllers/GameController" {
    export enum ControllerButton {
        NONE = 0,
        LEFT = 1,
        RIGHT = 2,
        UP = 3,
        DOWN = 4,
        FIRE = 5,
        PAUSE = 6,
        QUIT = 7,
    }
    export interface IButtonEvent {
        buttonId: number;
        controller: GameController;
    }
    export abstract class GameController {
        private _onButtonDown;
        private _onButtonUp;
        private _name;
        private _connected;
        constructor(name?: string);
        /** Connects to the controller and starts receiving events from it
         * @return True if was able to connect
         */
        connect(): boolean;
        /** Disconnects from the controller and stops receiving events from it
         * @return True if was able to disconnect
         */
        disconnect(): boolean;
        readonly connected: boolean;
        readonly name: string;
        /** Sets the button down event handler */
        addButtonDownEventListener(callback: (event: IButtonEvent) => any): GameController;
        /** Sets the button up event handler */
        addButtonUpEventListener(callback: (event: IButtonEvent) => any): GameController;
        protected triggerButtonDownEvent(buttonId: number): void;
        protected triggerButtonUpEvent(buttonId: number): void;
    }
}
declare module "controllers/KeyboardGameController" {
    import { GameController } from "controllers/GameController";
    /** Input controller that uses the keyboard */
    export class KeyboardGameController extends GameController {
        private _keyDownHandler;
        private _keyUpHandler;
        private _xAxis;
        constructor();
        connect(): boolean;
        disconnect(): boolean;
        protected keyDown(evt: KeyboardEvent): boolean;
        protected keyUp(evt: KeyboardEvent): boolean;
        private getControllerButton(keyCode);
    }
}
declare module "ui/Element" {
    export interface IPoint {
        x: number;
        y: number;
    }
    export interface IPosition {
        left: number;
        top: number;
    }
    export class ElementEvent {
        baseEvent: Event;
        element: UIElement;
        constructor(baseEvent: Event, element: UIElement);
        stopPropagation(): ElementEvent;
        preventDefault(): ElementEvent;
    }
    export class ElementKeyboardEvent extends ElementEvent {
        keyCode: number;
    }
    export class ElementPointerEvent extends ElementEvent {
        elementX: number;
        elementY: number;
    }
    export class ElementMouseEvent extends ElementPointerEvent {
    }
    export interface ITouchEvent extends Event {
        touches: {
            pageX: number;
            pageY: number;
        }[];
    }
    export class ElementTouchEvent extends ElementPointerEvent {
    }
    /**
     * A class that wraps an HTML element and provides some normalization for manipulation and events.
     */
    export class UIElement {
        private _htmlElement;
        constructor(_htmlElement: HTMLElement);
        /** Provides access to the underlying HTMLElement */
        readonly htmlElement: HTMLElement;
        /** Gets the id of this element */
        getId(): string;
        private _parent;
        /** Gets the parent element */
        getParent(): UIElement;
        /** Finds the first child element that matches the selector */
        find<T extends HTMLElement>(selector: string): T;
        /** Finds all child elements that matches the selector */
        findAll(selector: string): NodeList;
        /** Finds the first child element that matches the selector, null if not found */
        findElement(selector: string): UIElement;
        /** Finds all child elements that match the selector */
        findAllElements(selector: string): UIElement[];
        appendElement(element: UIElement): UIElement;
        prependElement(element: UIElement): UIElement;
        /** Removes the specified child element */
        removeElement(element: UIElement): UIElement;
        /** Removes all child elements */
        removeChildren(): UIElement;
        /** Clones the element */
        clone(deep?: boolean): UIElement;
        /** Sets the inner HTML of the element from an HTML formatted string */
        setHTML(html: string): UIElement;
        /** Gets the inner HTML of the element as a string */
        getHTML(): string;
        /** Appends to the inner HTML of the element from an HTML formatted string */
        appendHTML(html: string): UIElement;
        /** Gets or sets an element's text */
        text(txt: string): UIElement;
        text(): string;
        appendText(txt: string): UIElement;
        /** Gets or sets an element's title (tooltip) */
        title(txt?: string): UIElement;
        title(): string;
        /** Gets or sets the visibility of the element */
        visible(visible: boolean, displayStyle: string): UIElement;
        visible(visible: boolean): UIElement;
        visible(): boolean;
        getComputedStyles(): CSSStyleDeclaration;
        /** Gets the value of a custom data attribute (data-*) */
        getData(name: string): string;
        /** Sets the value of a custom data attribute */
        setData(name: string, value: string): UIElement;
        setAttribute(name: string, value: string): UIElement;
        getAttribute(name: string): string;
        removeAttribute(name: string): UIElement;
        addClass(name: string): UIElement;
        removeClass(name: string): UIElement;
        hasClass(className: string): boolean;
        setStyle(name: string, value: string, priority?: string): UIElement;
        getStyle(name: string): string;
        /** Gets the bounds of this element in page coordinates */
        getBounds(): ClientRect;
        /** Gets or sets the position of this element */
        position(left: number, top: number): UIElement;
        position(): IPosition;
        /** Changes the width and height of the element */
        setDimensions(width: number, height: number): UIElement;
        /** Changes the height of the element */
        setHeight(height: number): UIElement;
        /** Changes the width of the element */
        setWidth(width: number): UIElement;
        /** Converts page coordinates to element coordinates */
        toElementPoint(pageX: number, pageY: number): IPoint;
        /** Converts page x to element x position */
        toElementX(pageX: number): number;
        /** Converts page y to element y position */
        toElementY(pageY: number): number;
        /** Adds a click event handler */
        addClickListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a click event handler */
        addDblClickListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a pointer down event handler */
        addPointerDownListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a pointer up event handler */
        addPointerUpListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a pointer move event handler */
        addPointerMoveListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a pointer out event handler */
        addPointerOutListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a mousedown event handler */
        addMouseDownListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a mouseup event handler */
        addMouseUpListener(callback: (e: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a mousemove event handler */
        addMouseMoveListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a mouseout event handler */
        addMouseOutListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a mouseover event handler */
        addMouseOverListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a touchstart event handler */
        addTouchStartListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a touchend event handler */
        addTouchEndListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a touchmove event handler */
        addTouchMoveListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a touchcancel event handler */
        addTouchCancelListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a keypress event handler */
        addKeyPressListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a keydown event handler */
        addKeyDownListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a keyup event handler */
        addKeyUpListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement;
        /** Adds a transitionend event handler */
        addTransitionEndListener(callback: (evt: ElementEvent) => any, useCapture?: boolean): UIElement;
    }
}
declare module "controllers/MouseGameController" {
    import { GameController } from "controllers/GameController";
    /**
     * Game controller that uses the mouse.
     * Uses zones to determine when to trigger direction events.
     * When the mouse moves into a zone it triggers the event.
     * Any area not in one of the zones is the dead zone that causes no event.
     */
    export class MouseGameController extends GameController {
        protected zones: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
        private element;
        private _mouseMoveHandler;
        private _mouseDownHandler;
        private _mouseUpHandler;
        constructor(element: HTMLElement, zoneSize?: number);
        setZones(top: number, bottom: number, left: number, right: number): void;
        connect(): boolean;
        disconnect(): boolean;
        protected onMouseMove(evt: MouseEvent): void;
        protected onMouseDown(evt: MouseEvent): void;
        protected onMouseUp(evt: MouseEvent): void;
    }
}
declare module "controllers/PointerGameController" {
    import { GameController } from "controllers/GameController";
    import { UIElement } from "ui/Element";
    import { Rectangle } from "Rectangle";
    export interface IDirectionZone {
        top: number;
        bottom: number;
        left: number;
        right: number;
        bounds: Rectangle;
    }
    /**
     * Game controller that uses pointer events.
     * When a pointer event happens in a zone it triggers a direction or fire event.
     */
    export class PointerGameController extends GameController {
        protected directionArea: IDirectionZone;
        protected fireArea: Rectangle;
        protected element: UIElement;
        private touching;
        private _startHandler;
        private _endHandler;
        private _moveHandler;
        private _cancelHandler;
        constructor(element: HTMLElement, fireZone?: Rectangle, directionZone?: IDirectionZone);
        setDirectionArea(x: number, y: number, w: number, h: number): void;
        setDirectionAreaZones(top: number, bottom: number, left: number, right: number): void;
        setFireArea(x: number, y: number, w: number, h: number): void;
        connect(): boolean;
        disconnect(): boolean;
        private fireId;
        private directionId;
        protected onPointerMove(evt: PointerEvent): void;
        protected onPointerDown(evt: PointerEvent): void;
        protected onPointerUp(evt: PointerEvent): void;
        protected handleTouch(id: number, x: number, y: number, start: boolean): void;
    }
}
declare module "controllers/TouchGameController" {
    import { GameController } from "controllers/GameController";
    import { UIElement } from "ui/Element";
    import { Rectangle } from "Rectangle";
    export interface IDirectionZone {
        top: number;
        bottom: number;
        left: number;
        right: number;
        bounds: Rectangle;
    }
    /**
     * Game controller that uses touch gestures.
     * When a touch happens in a zone it triggers a direction or fire events.
     */
    export class TouchGameController extends GameController {
        protected directionArea: IDirectionZone;
        protected fireArea: Rectangle;
        protected element: UIElement;
        private touching;
        private _startHandler;
        private _endHandler;
        private _moveHandler;
        private _cancelHandler;
        constructor(element: HTMLElement, fireZone?: Rectangle, directionZone?: IDirectionZone);
        setDirectionArea(x: number, y: number, w: number, h: number): void;
        setDirectionAreaZones(top: number, bottom: number, left: number, right: number): void;
        setFireArea(x: number, y: number, w: number, h: number): void;
        connect(): boolean;
        disconnect(): boolean;
        protected onTouchMove(evt: TouchEvent): void;
        protected onTouchStart(evt: TouchEvent): void;
        protected onTouchEnd(evt: TouchEvent): void;
        protected handleTouch(x: number, y: number): void;
    }
}
declare module "io/JsonFile" {
    /**
    * Defines a wrapper for a Json file that includes info about the file as
    * well as the data to be saved stored in the data property.
    */
    export class JsonFile<T> {
        fileType: string;
        createdDate: Date;
        updatedDate: Date;
        data: T;
        constructor(fileType: string, data?: T);
    }
}
declare module "storage/AppStorage" {
    /** Used to determine if local storage available */
    export function isAvailable(): boolean;
    /**
    * Wrapper for localstorage that optionally prefixes all keys with the app name
    */
    export class AppStorage {
        private _prefix;
        /** Used to determine if local storage available */
        static readonly isAvailable: boolean;
        /** @param appName Name of the application(optional) */
        constructor(appName?: string);
        /** Gets the prefix that is prepended to each key */
        readonly prefix: string;
        /**
            * Sets the value with the specified key into localStorage.
            * @param key Key
            * @param val Value
            * @param replacer Replacer function to use when stringifying the value
            */
        setValue(key: string, val: any, replacer?: (key: string, value: any) => any): AppStorage;
        /**
            * Gets the value with the specified key from localStorage
            * @returns The value or null if not found
            */
        getValue<T>(key: string, reviver?: (key: any, value: any) => any): T;
        /**
            * Gets the raw value of an item from localStorage without parsing it
            * @returns The value or null if not found
            */
        getItem(key: string): string;
        /** Removes the value with the specified key */
        remove(key: string): AppStorage;
        /** Removes all items associated with the app */
        removeAll(): AppStorage;
        /**
            * Determines if the specified key has a value in localStorage
            * @returns True if the key has a value
            */
        contains(key: string): boolean;
        /**
            * Gets the keys from localStorage for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @returns An array of keys
            */
        getKeys(filter?: (key: string) => boolean): string[];
        private isAppKey(key);
        /** Adds a storage event handler */
        addStorageListener(callback: (evt: StorageEvent) => any, useCapture?: boolean): AppStorage;
    }
}
declare module "storage/IAppStorageAsync" {
    /**
        * Defines the interface for async storage.
        * If storage is not supported by the browser these calls should fail silently.
        */
    export interface IAppStorageAsync {
        /**
            * Sets the raw value of an item (without converting it to json first).
            * Note: this only works on storage frameworks that support storing objects.
            * For other frameworks it will be the same as calling setValue without a replacer.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            */
        setItem(key: string, val: any, callback?: () => any): IAppStorageAsync;
        /**
            * Gets the raw value of an item (without parsing it from json).
            * Note: this only works on storage frameworks that support storing objects.
            * For other frameworks it will be the same as calling getValue without a reviver.
            * @param key Key
            * @param callback Fuction to call with the item. Value will be null if not found.
            */
        getItem<T>(key: string, callback: (data: T) => any): IAppStorageAsync;
        /**
            * Sets the value with the specified key converting it to json first (using the replacer)
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): IAppStorageAsync;
        /**
            * Gets the value with the specified key parsing it from json (using the reviver)
            * @param key Key
            * @param callback Fuction to call with the value. Value will be null if not found.
            * @param reviver Optional reviver to use when parsing the JSON
            */
        getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): IAppStorageAsync;
        /**
            * Removes the value with the specified key
            * @param key Key
            * @param callback Optional function to call when removed
            */
        remove(key: string, callback?: () => any): IAppStorageAsync;
        /**
            * Removes all values
            * @param callback Optional function to call when removed
            */
        removeAll(callback?: () => any): IAppStorageAsync;
        /**
            * Determines if the specified key has a value
            * @param key Key
            * @param callback Fuction to call with the result of the check.
            */
        contains(key: string, callback: (result: boolean) => any): IAppStorageAsync;
        /**
            * Gets all the keys, or optionally those that match a filter
            * @param filter Optional function that returns true if the key should be included in the result
            * @param callback Function to call with the array of keys. If none are found the list will be empty (never null).
            */
        getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): IAppStorageAsync;
        addStorageListener(callback: (evt: IStorageEventAsync) => any): IAppStorageAsync;
    }
    export interface IStorageEventAsync {
        key: string;
        oldValue: any;
        newValue: any;
        storageArea: string;
    }
}
declare module "storage/AppStorageAsync" {
    import { IAppStorageAsync, IStorageEventAsync } from "storage/IAppStorageAsync";
    /** Used to determine if local storage available */
    export function isAvailable(): boolean;
    export class AppStorageAsync implements IAppStorageAsync {
        private _prefix;
        /** Used to determine if local storage available */
        static readonly isAvailable: boolean;
        /** @param appName Name of the application(optional) */
        constructor(appName?: string);
        /** Gets the prefix that is prepended to each key */
        prefix(): string;
        /**
            * Sets the value with the specified key into localStorage.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): AppStorageAsync;
        /**
            * Gets the value with the specified key from localStorage
            * @key Key
            * @callback Fuction to call with the value. Value will be null if not found.
            * @reviver Optional reviver to use when parsing the JSON
            */
        getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): AppStorageAsync;
        /**
            * Sets the value with the specified key into localStorage.
            * Note: For localstorage this is the same as calling setValue without a replacer.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        setItem(key: string, val: any, callback?: () => any): AppStorageAsync;
        /**
            * Gets the raw value of an item from localStorage without parsing it.
            * Note: For localstorage this is the same as calling getValue without a reviver.
            * @callback Fuction to call with the item. Value will be null if not found.
            */
        getItem<T>(key: string, callback: (data: T) => any): AppStorageAsync;
        /** Removes the value with the specified key */
        remove(key: string, callback?: () => any): AppStorageAsync;
        /** Removes all items associated with the app */
        removeAll(callback?: () => any): AppStorageAsync;
        /**
            * Determines if the specified key has a value in localStorage
            * @callback Fuction to call with the result.
            */
        contains(key: string, callback: (result: boolean) => any): AppStorageAsync;
        /**
            * Gets the keys from localStorage for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @callback Fuction to call with the list of keys. If none are found the list will be empty (not null).
            */
        getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): AppStorageAsync;
        private getRawItem(key);
        private isAppKey(key);
        /** Adds a storage event handler */
        addStorageListener(callback: (evt: IStorageEventAsync) => any): AppStorageAsync;
    }
}
declare module "storage/Chrome.AppStorageAsync" {
    import { IAppStorageAsync, IStorageEventAsync } from "storage/IAppStorageAsync";
    export enum AppStorageType {
        sync = 0,
        local = 1,
        managed = 2,
    }
    /** The underlying chrome storage object (if available) */
    export var chromeStorage: any;
    /** Used to determine if chrome storage available */
    export function isAvailable(): boolean;
    /**
        * Wraps Chrome storage to comply with the System.IAppStorageAsync interface.
        * Note: Chrome storage saves objects so you don't need to convert objects to json first.
        */
    export class AppStorageAsync implements IAppStorageAsync {
        private _storageType;
        private _storageArea;
        private _prefix;
        /** Used to determine if chrome storage available */
        static readonly isAvailable: boolean;
        /** @param appName Name of the application(optional) */
        constructor(storageType: AppStorageType, appName?: string);
        /** Gets the prefix that is prepended to each key */
        readonly prefix: string;
        /**
            * Sets the value with the specified key into this._storageArea as json.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            * @param replacer Optional replacer function to use when stringifying the value
            */
        setValue(key: string, val: any, callback?: () => any, replacer?: (key: string, value: any) => any): AppStorageAsync;
        /**
            * Gets the value with the specified key from this._storageArea and parses its json using the reviver
            * @key Key
            * @callback Fuction to call with the value. Value will be null if not found.
            * @reviver Optional reviver to use when parsing the JSON
            */
        getValue<T>(key: string, callback: (data: T) => any, reviver?: (key: any, value: any) => any): AppStorageAsync;
        /**
            * Sets the value with the specified key into this._storageArea without converting to json first.
            * @param key Key
            * @param val Value
            * @param callback Optional function to call when saved
            */
        setItem(key: string, val: any, callback?: () => any): AppStorageAsync;
        /**
            * Gets the raw value of an item from this._storageArea without parsing it
            * @callback Fuction to call with the value. Value will be null if not found.
            */
        getItem<T>(key: string, callback: (val: T) => any): AppStorageAsync;
        /** Removes the value with the specified key */
        remove(key: string, callback?: () => any): AppStorageAsync;
        /** Removes all items associated with the app */
        removeAll(callback?: () => any): AppStorageAsync;
        /**
            * Determines if the specified key has a value in this._storageArea
            * @callback Fuction to call with the result.
            */
        contains(key: string, callback: (result: boolean) => any): AppStorageAsync;
        /**
            * Gets the keys from this._storageArea for the application that optionally match a filter
            * @param filter: (Optional) A function that returns true if the key should be included in the result
            * @param callback Function to call with the array of keys. If none are found the list will be empty (never null).
            */
        getKeys(callback: (keys: string[]) => any, filter?: (key: string) => boolean): AppStorageAsync;
        private isAppKey(key);
        /** Adds a storage event handler */
        addStorageListener(callback: (evt: IStorageEventAsync) => any): AppStorageAsync;
    }
}
declare module "ui/CanvasContext2D" {
    /** Defines a color stop for creating gradients */
    export interface IColorStop {
        color: string;
        /** A number between 0 and 1.0 */
        offset: number;
    }
    /**
     * Wrapper and high level drawing methods for HTMLCanvasElement 2D context
     */
    export class CanvasContext2D {
        private _canvas;
        private _context;
        constructor(_canvas: HTMLCanvasElement);
        readonly context: CanvasRenderingContext2D;
        readonly canvas: HTMLCanvasElement;
        static PI_OVER_180: number;
        static PI_OVER_2: number;
        static TWO_PI: number;
        static TAU: number;
        toDataUrl(): string;
        fillStyle(gradient: CanvasGradient): CanvasContext2D;
        fillStyle(pattern: CanvasPattern): CanvasContext2D;
        fillStyle(color: string): CanvasContext2D;
        fillStyle(): any;
        strokeStyle(gradient: CanvasGradient): CanvasContext2D;
        strokeStyle(pattern: CanvasPattern): CanvasContext2D;
        strokeStyle(color: string): CanvasContext2D;
        strokeStyle(): any;
        lineWidth(): number;
        lineWidth(width: number): CanvasContext2D;
        /** Sets the line cap (Use CanvasContext2D.LineCap) */
        lineCap(lineCap: string): CanvasContext2D;
        lineCap(): string;
        /** Sets the line join (Use CanvasContext2D.LineJoin) */
        lineJoin(join: string): CanvasContext2D;
        lineJoin(): string;
        miterLimit(limit: number): CanvasContext2D;
        miterLimit(): number;
        lineDash(sequence: number[]): CanvasContext2D;
        lineDash(): number[];
        shadowColor(color: string): CanvasContext2D;
        shadowColor(): string;
        shadowBlur(size: number): CanvasContext2D;
        shadowBlur(): number;
        shadowOffsetX(offset: number): CanvasContext2D;
        shadowOffsetX(): number;
        shadowOffsetY(offset: number): CanvasContext2D;
        shadowOffsetY(): any;
        shadowOffset(offsetX: number, offsetY: number): CanvasContext2D;
        shadowOffset(offset: number): CanvasContext2D;
        shadowOffset(): {
            offsetX: number;
            offsetY: number;
        };
        /** Sets all of the shadow styles in one call */
        shadowStyle(color: string, offsetX: number, offsetY: number, blur: number): CanvasContext2D;
        font(font: string): CanvasContext2D;
        font(): string;
        /** Sets text align (use CanvasContext2D.TextAlign) */
        textAlign(alignment: string): CanvasContext2D;
        textAlign(): string;
        /** Sets text baseline (use CanvasContext2D.TextBaseline) */
        textBaseline(baseline: string): CanvasContext2D;
        textBaseline(): string;
        /** Sets global alpha */
        globalAlpha(alpha: number): CanvasContext2D;
        globalAlpha(): number;
        /** Sets global compositing operation (use CanvasContext2D.CompositeOperation) */
        globalCompositeOperation(operation: string): CanvasContext2D;
        globalCompositeOperation(): string;
        /** Clears the entire canvas */
        clear(): CanvasContext2D;
        /** Clears a portion of the canvas */
        clearRect(x: number, y: number, w: number, h: number): CanvasContext2D;
        /** Pushes the current state of the context */
        save(): CanvasContext2D;
        /** Restores the state of the context from the last save */
        restore(): CanvasContext2D;
        /** Sets the scale transform of the canvas */
        scale(scale: number): CanvasContext2D;
        /** Sets the x and y scale transform of the canvas */
        scale(xs: number, ys: number): CanvasContext2D;
        /** moves the origin to the specified location */
        translate(x: number, y: number): CanvasContext2D;
        /** Rotates the canvas */
        rotate(radians: number): CanvasContext2D;
        /**
            * Sets the current transformation matrix
            * m11 Scales the drawing horizontally
            * m12 Skews the drawing horizontally
            * m21 Scales the drawing vertically
            * m22 Skews the drawing vertically
            * dx Moves the the drawing horizontally
            * dy Moves the the drawing vertically
        */
        transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): CanvasContext2D;
        /** Resets to the identity matrix then applies the new transformation matrix */
        setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): CanvasContext2D;
        /**
            * Draws an image to the canvas and optionally scales it
            * @param image
            * @param x Destination x
            * @param y Destination y
            * @param w Width to scale image to (optional)
            * @param h Height to scale image to (optional)
            */
        drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, x: number, y: number, w?: number, h?: number): CanvasContext2D;
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
        drawClippedImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w?: number, h?: number): CanvasContext2D;
        /**
            * Draws an image rotating about its center and optionally scales it
            * @param image
            * @param x Destination x
            * @param y Destination y
            * @param angle Angle in radians (0 to 2PI)
            * @param w Width to scale image to (optional)
            * @param h Height to scale image to (optional)
            */
        drawRotatedImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, x: number, y: number, angle: number, width?: number, height?: number): CanvasContext2D;
        drawLine(x1: number, y1: number, x2: number, y2: number): CanvasContext2D;
        /** Draws the lines defined by the set of coordinates
            * @param coords An array containing sets of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        drawLines(...coords: number[]): CanvasContext2D;
        drawCircle(x: number, y: number, radius: number): CanvasContext2D;
        fillCircle(x: number, y: number, radius: number): CanvasContext2D;
        drawArc(x: number, y: number, radius: number, start: number, end: number, anticlockwise?: boolean): CanvasContext2D;
        fillArc(x: number, y: number, radius: number, start: number, end: number, anticlockwise?: boolean): CanvasContext2D;
        drawEllipse(x: number, y: number, rx: number, ry: number): CanvasContext2D;
        fillEllipse(x: number, y: number, rx: number, ry: number): CanvasContext2D;
        drawRect(x: number, y: number, w: number, h: number): CanvasContext2D;
        fillRect(x: number, y: number, w: number, h: number): CanvasContext2D;
        /**
        * Draws a rounded rectangle
        * @param r radius of the corners
        */
        drawRoundedRect(x: number, y: number, w: number, h: number, r: number): CanvasContext2D;
        /** Draws a rounded rectangle
            * @param radii The radii of each corner (clockwise from upper-left)
        */
        drawRoundedRect(x: number, y: number, w: number, h: number, radii: number[]): CanvasContext2D;
        fillRoundedRect(x: number, y: number, w: number, h: number, r: number): CanvasContext2D;
        fillRoundedRect(x: number, y: number, w: number, h: number, r: number[]): CanvasContext2D;
        /** Draws a shape defined by the set of coordinates
            * @param coords Array of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        drawShape(...coords: number[]): CanvasContext2D;
        /** Fills a shape defined by the set of coordinates
            * @param coords Array of x and y coordinates (ex: [x1, y1, x2, y2, ...])
            */
        fillShape(...coords: number[]): CanvasContext2D;
        drawText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D;
        fillText(text: string, x: number, y: number, maxWidth?: number): CanvasContext2D;
        measureText(text: string): number;
        /** Creates a gradient with no color stops */
        createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
        /** Creates a gradient from one color to another */
        createLinearGradient(x0: number, y0: number, x1: number, y1: number, color1: string, color2: string): CanvasGradient;
        /** Creates a gradient with multiple color stops */
        createLinearGradient(x0: number, y0: number, x1: number, y1: number, ...colorStops: IColorStop[]): CanvasGradient;
        /** Creates a gradient with no color stops */
        createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
        /** Creates a gradient from one color to another */
        createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, color1: string, color2: string): CanvasGradient;
        /** Creates a gradient with multiple color stops */
        createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, ...colorsOrStops: IColorStop[]): CanvasGradient;
        /**
            * Cerates a pattern from an image
            * @param image
            * @param repetition Type of repetition (Use CanvasContext2D.Repetition), default is repeat.
            */
        createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition?: string): CanvasPattern;
        /**
            * Draws a gradient rectangle from one color to another
            * @param x
            * @param y
            * @param w
            * @param h
            * @param angle Angle of the gradient in radians [0, pi/2], where 0 is completely horizontal, pi/2 is vertical.
            * @param color1 The start color
            * @param color2 The end color
            */
        drawLinearGradient(x: number, y: number, w: number, h: number, angle: number, color1: string, color2: string): CanvasContext2D;
        /**
            * Draws a gradient rectangle with multiple color stops
            * @param x
            * @param y
            * @param w
            * @param h
            * @param angle Angle of the gradient in radians [0, pi/2], where 0 is completely horizontal, pi/2 is vertical.
            * @param colorStops
            */
        drawLinearGradient(x: number, y: number, w: number, h: number, angle: number, ...colorStops: IColorStop[]): CanvasContext2D;
        /** Draws a radial gradient from one color to another */
        drawRadialGradient(x: number, y: number, r: number, outerColor: string, innerColor: string): CanvasContext2D;
        /** Draws a radial gradient with multiple color stops */
        drawRadialGradient(x: number, y: number, r: number, ...colorsOrStops: IColorStop[]): CanvasContext2D;
        /** Draws a rectangle with the pattern correctly applied at the origin of the rectangle (not the canvas) */
        drawPattern(x: number, y: number, w: number, h: number, pattern: CanvasPattern): CanvasContext2D;
        /** Draws a rectangle with the pattern correctly applied at the origin of the rectangle (not the canvas) */
        drawPattern(x: number, y: number, w: number, h: number, image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition?: string): CanvasContext2D;
        /** Creates ImageData from an existing ImageData */
        createImageData(imageData: ImageData): ImageData;
        /** Creates ImageData of the specified size */
        createImageData(w: number, h: number): ImageData;
        /** Gets image data for the entire canvas */
        getImageData(): ImageData;
        /** Gets image data for a region of the canvas */
        getImageData(x: number, y: number, w: number, h: number): ImageData;
        /** Puts image data into the canvas at the top-left */
        putImageData(imageData: ImageData): CanvasContext2D;
        /** Puts image data into the canvas at the specified point */
        putImageData(imageData: ImageData, x: number, y: number): CanvasContext2D;
        /** Puts image data into the canvas at the specified point and offset */
        putImageData(imageData: ImageData, x: number, y: number, destX: number, destY: number): CanvasContext2D;
        /** Puts image data into the canvas at the specified point and offset and scales it */
        putImageData(imageData: ImageData, x: number, y: number, destX: number, destY: number, destW: number, destH: number): CanvasContext2D;
        rect(x: number, y: number, w: number, h: number): CanvasContext2D;
        fill(): CanvasContext2D;
        stroke(): CanvasContext2D;
        beginPath(): CanvasContext2D;
        closePath(): CanvasContext2D;
        moveTo(x: number, y: number): CanvasContext2D;
        lineTo(x: number, y: number): CanvasContext2D;
        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): CanvasContext2D;
        bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): CanvasContext2D;
        arc(x: number, y: number, r: number, startRads: number, endRads: number, anticlockwise?: boolean): CanvasContext2D;
        arcTo(x1: number, y1: number, x2: number, y2: number, r: number): CanvasContext2D;
        setClipRect(x: number, y: number, w: number, h: number): CanvasContext2D;
        clip(): CanvasContext2D;
        isPointInPath(x: number, y: number): boolean;
        /**
            * Defines the path for a rounded rectangle
            * @param x The top left x coordinate
            * @param y The top left y coordinate
            * @param width The width of the rectangle
            * @param height The height of the rectangle
            * @param radii The radii of each corner (clockwise from upper-left)
            */
        private defineRoundedRect(x, y, w, h, radii);
        /** Defines the path for an ellipse */
        private defineEllipse(x, y, rx, ry);
        /** Defines the path for a set of coordinates
            * @param {number[]} coords Set of x and y coordinates
            */
        private definePolyline(coords);
        private addGradientColorStops(gradient, ...colorsOrStops);
        /**
            * Converts degrees to radians
            * @param degrees
            */
        static toRadians(degrees: any): number;
        static TextBaseline: {
            top: string;
            middle: string;
            bottom: string;
            alphabetic: string;
            hanging: string;
        };
        static TextAlign: {
            left: string;
            right: string;
            center: string;
            start: string;
            end: string;
        };
        static Repetition: {
            repeat: string;
            repeatX: string;
            repeatY: string;
            noRepeat: string;
        };
        static CompositeOperation: {
            sourceOver: string;
            sourceAtop: string;
            sourceIn: string;
            sourceOut: string;
            destinationOver: string;
            destinationAtop: string;
            destinationIn: string;
            destinationOut: string;
            lighter: string;
            copy: string;
            xor: string;
        };
        static LineCap: {
            butt: string;
            round: string;
            square: string;
        };
        static LineJoin: {
            bevel: string;
            round: string;
            miter: string;
        };
    }
}
declare module "ui/ElementMouseEvent" {
    /**
     * Wraps a mouse event to provide element based positions
     */
    export class ElementMouseEvent {
        element: HTMLElement;
        event: MouseEvent;
        /** X-Position of the mouse inside the element */
        elementX: number;
        /** Y-Position of the mouse inside the element */
        elementY: number;
        /**
         * @param element The element the event ocurred on
         * @param event The mouse event
         */
        constructor(element: HTMLElement, event: MouseEvent);
    }
}
