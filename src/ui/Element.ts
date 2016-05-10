import * as Convert from "../Convert";
import * as System from "../System";

"use strict";

export interface IPoint
{
    x: number;
    y: number;
}
export interface IPosition
{
    left: number;
    top: number;
}

export class ElementEvent
{
    constructor(public baseEvent: Event, public element: UIElement) { }
    public stopPropagation(): ElementEvent { this.baseEvent.stopPropagation(); return this; }
    public preventDefault(): ElementEvent { this.baseEvent.preventDefault(); return this; }
}
export class ElementKeyboardEvent extends ElementEvent
{
    public keyCode: number;
    //public event: KeyboardEvent
}
export class ElementPointerEvent extends ElementEvent
{
    public elementX: number;
    public elementY: number;
}
export class ElementMouseEvent extends ElementPointerEvent
{
    //public event: MouseEvent;
}
export interface ITouchEvent extends Event
{
    touches: { pageX: number; pageY: number; }[];
}
export class ElementTouchEvent extends ElementPointerEvent
{
    //public event: ITouchEvent;
}

/** Transforms a Event into a IElementEvent */
function getElementEvent<T extends ElementEvent>(evt: Event, element: UIElement): T
{
    var ee: T = <T>new ElementEvent(evt, element);
    return ee;
}
/** Transforms a MouseEvent into a IElementMouseEvent */
function getElementKeyboardEvent(evt: KeyboardEvent, element: UIElement): ElementKeyboardEvent
{
    var ke = getElementEvent<ElementKeyboardEvent>(evt, element);
    ke.keyCode = evt.which;
    return ke;
}
/** Transforms a MouseEvent into a IElementMouseEvent */
function getElementMouseEvent(evt: MouseEvent, element: UIElement): ElementMouseEvent
{
    var me = getElementEvent<ElementMouseEvent>(evt, element);
    me.elementX = element.toElementX(evt.pageX);
    me.elementY = element.toElementY(evt.pageY);
    return me;
}
/** Transforms a MouseEvent into a IElementMouseEvent */
function getElementTouchEvent(evt: Event, element: UIElement): ElementTouchEvent
{
    var te = getElementEvent<ElementTouchEvent>(evt, element);
    if (evt["touches"] && evt["touches"].length > 0)
    {
        var t0 = evt["touches"][0];
        te.elementX = element.toElementX(t0.pageX);
        te.elementY = element.toElementY(t0.pageY);
    }
    return te;
}

/**
 * A class that wraps an HTML element and provides some normalization for manipulation and events.
 */
export class UIElement
{
    constructor(private _htmlElement: HTMLElement)
    {
    }

    /** Provides access to the underlying HTMLElement */
    public get htmlElement(): HTMLElement
    {
        return this._htmlElement;
    }
        
    /** Gets the id of this element */
    public getId(): string
    {
        return this._htmlElement.id;
    }

    private _parent: UIElement;
    /** Gets the parent element */
    public getParent(): UIElement
    {
        return this._parent || (this._parent = new UIElement(this._htmlElement.parentElement));
    }

    /** Finds the first child element that matches the selector */
    public find<T extends HTMLElement>(selector: string): T
    {
        return <T>this._htmlElement.querySelector(selector);
    }
    /** Finds all child elements that matches the selector */
    public findAll(selector: string): NodeList
    {
        return this._htmlElement.querySelectorAll(selector);
    }
    /** Finds the first child element that matches the selector, null if not found */
    public findElement(selector: string): UIElement
    {
        var e = this.find(selector);
        return e ? new UIElement(e) : null;
    }
    /** Finds all child elements that match the selector */
    public findAllElements(selector: string): UIElement[]
    {
        var elements = [];
        var list = this.findAll(selector);
        for (var i = 0; i < list.length; ++i)
        {
            elements.push(new UIElement(<HTMLElement>list[i]));
        }

        return elements;
    }

    public appendElement(element: UIElement): UIElement
    {
        this._htmlElement.appendChild(element.htmlElement);
        return this;
    }
    public prependElement(element: UIElement): UIElement
    {
        this._htmlElement.insertBefore(element.htmlElement, this._htmlElement.firstChild);
        return this;
    }
    /** Removes the specified child element */
    public removeElement(element: UIElement): UIElement
    {
        this._htmlElement.removeChild(element.htmlElement);
        return this;
    }
    /** Removes all child elements */
    public removeChildren(): UIElement
    {
        this._htmlElement.innerHTML = "";
        return this;
    }
    /** Clones the element */
    public clone(deep = true): UIElement
    {
        return new UIElement(<HTMLElement>this._htmlElement.cloneNode(deep));
    }
    /** Sets the inner HTML of the element from an HTML formatted string */
    public setHTML(html: string): UIElement
    {
        this._htmlElement.innerHTML = html;
        return this;
    }
    /** Gets the inner HTML of the element as a string */
    public getHTML(): string
    {
        return this._htmlElement.innerHTML;
    }
    /** Appends to the inner HTML of the element from an HTML formatted string */
    public appendHTML(html: string): UIElement
    {
        this._htmlElement.innerHTML += html;
        return this;
    }

    /////////////////////////////////////////////////////////////////////////
    // Properties ///////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /** Gets or sets an element's text */
    public text(txt: string): UIElement;
    public text(): string;
    public text(txt?: string): any
    {
        if (txt === void (0))
        {
            return this._htmlElement.textContent;
        }
        this._htmlElement.textContent = txt;
        return this;
    }

    public appendText(txt: string): UIElement
    {
        this._htmlElement.textContent += txt;
        return this;
    }

    /** Gets or sets an element's title (tooltip) */
    public title(txt?: string): UIElement;
    public title(): string;
    public title(txt?: string): any
    {
        if (txt === void (0))
        {
            return this._htmlElement.title;
        }
        this._htmlElement.title = txt;
        return this;
    }

    /** Gets or sets the visibility of the element */
    public visible(visible: boolean, displayStyle: string): UIElement;
    public visible(visible: boolean): UIElement;
    public visible(): boolean;
    public visible(visible?: boolean, displayStyle = "block"): any
    {
        if (visible === void (0))
        {
            // Determine if it's visible by walking up the DOM
            var elt = this._htmlElement;
            do
            {
                var styles = window.getComputedStyle(elt);
                if (styles.visibility === "hidden" || styles.display === "none") return false;
                elt = elt.parentElement;
            }
            while (elt.tagName.toUpperCase() != "BODY");
            return true;
        }
        else
        {
            // Set visibility
            if (visible)
            {
                this._htmlElement.style.display = displayStyle;
            }
            else
            {
                this._htmlElement.style.display = "none";
            }

            return this;
        }
    }

    public getComputedStyles(): CSSStyleDeclaration
    {
        return window.getComputedStyle(this._htmlElement);
    }

    /** Gets the value of a custom data attribute (data-*) */
    public getData(name: string): string
    {
        if (this._htmlElement.dataset)
        {
            return this._htmlElement.dataset[Convert.toCamelCase(name)];
        }
        return this._htmlElement.getAttribute("data-" + name);
    }
    /** Sets the value of a custom data attribute */
    public setData(name: string, value: string): UIElement
    {
        if (this._htmlElement.dataset)
        {
            this._htmlElement.dataset[Convert.toCamelCase(name)] = value;
        }
        else this._htmlElement.setAttribute("data-" + name, value);

        return this;
    }

    public setAttribute(name: string, value: string): UIElement
    {
        this._htmlElement.setAttribute(name, value);
        return this;
    }
    public getAttribute(name: string): string
    {
        return this._htmlElement.getAttribute(name);
    }
    public removeAttribute(name: string): UIElement
    {
        this._htmlElement.removeAttribute(name);
        return this;
    }

    public addClass(name: string): UIElement
    {
        if (this._htmlElement.classList)
        {
            this._htmlElement.classList.add(name);
        }
        else if (this._htmlElement.className)
        {
            // IE9
            this._htmlElement.className += (" " + name);
        }
        return this;
    }
    public removeClass(name: string): UIElement
    {
        if (this._htmlElement.classList)
        {
            this._htmlElement.classList.remove(name);
        }
        else if (this._htmlElement.className)
        {
            // IE9
            var className = "";
            this._htmlElement.className.split(" ").forEach((token) =>
            {
                if (token !== name) className += token + " ";
            });
            this._htmlElement.className = className;
        }
        return this;
    }
    public hasClass(className: string): boolean
    {
        if (this._htmlElement.classList)
        {
            this._htmlElement.classList.contains(className);
        }
        else if (this._htmlElement.className)
        {
            // IE9
            return this._htmlElement.className.split(" ").indexOf(className) >= 0;
        }
    }

    public setStyle(name: string, value: string, priority?: string): UIElement
    {
        if (this._htmlElement.style["setAttribute"])
        {
            // IE9
            this._htmlElement.style["setAttribute"](name, value);
        }
        else if (priority)
        {
            this._htmlElement.style.setProperty(name, value, priority);
        }
        else
        {
            this._htmlElement.style.setProperty(name, value);
        }
        return this;
    }
    public getStyle(name: string): string
    {
        return this.getComputedStyles().getPropertyValue(name);
    }

    /** Gets the bounds of this element in page coordinates */
    public getBounds(): ClientRect
    {
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
    }

    /** Gets or sets the position of this element */
    public position(left: number, top: number): UIElement;
    public position(): IPosition;
    public position(left?: number, top?: number): any
    {
        if (left === void (0))
        {
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
    }

    /** Changes the width and height of the element */
    public setDimensions(width: number, height: number): UIElement
    {
        this.setWidth(width);
        this.setHeight(height);
        return this;
    }
    /** Changes the height of the element */
    public setHeight(height: number): UIElement
    {
        return this.setStyle("height", height.toString() + "px");
    }
    /** Changes the width of the element */
    public setWidth(width: number): UIElement
    {
        return this.setStyle("width", width.toString() + "px");
    }

    /////////////////////////////////////////////////////////////////////////
    // Coordinate conversions ///////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /** Converts page coordinates to element coordinates */
    public toElementPoint(pageX: number, pageY: number): IPoint
    {
        var pos = this.position();
        return {
            x: pageX - pos.left,
            y: pageY - pos.top
        };
    }
    /** Converts page x to element x position */
    public toElementX(pageX: number): number
    {
        return pageX - this.position().left;
    }
    /** Converts page y to element y position */
    public toElementY(pageY: number): number
    {
        return pageY - this.position().top;
    }


    /////////////////////////////////////////////////////////////////////////
    // Events ///////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    /** Adds a click event handler */
    public addClickListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("click",(evt) => callback(getElementMouseEvent(evt, this)), useCapture);
        return this;
    }
    /** Adds a click event handler */
    public addDblClickListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("dblclick",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a pointer down event handler */
    public addPointerDownListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement
    {
        if (System.isTouchSupported()) return this.addTouchStartListener(callback, useCapture);
        else return this.addMouseDownListener(callback, useCapture);
    }
    /** Adds a pointer up event handler */
    public addPointerUpListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement
    {
        if (System.isTouchSupported()) return this.addTouchEndListener(callback, useCapture);
        else return this.addMouseUpListener(callback, useCapture);
    }
    /** Adds a pointer move event handler */
    public addPointerMoveListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement
    {
        if (System.isTouchSupported()) return this.addTouchMoveListener(callback, useCapture);
        else return this.addMouseMoveListener(callback, useCapture);
    }
    /** Adds a pointer out event handler */
    public addPointerOutListener(callback: (evt: ElementPointerEvent) => any, useCapture?: boolean): UIElement
    {
        if (System.isTouchSupported()) return this.addTouchCancelListener(callback, useCapture);
        else return this.addMouseOutListener(callback, useCapture);
    }
    /** Adds a mousedown event handler */
    public addMouseDownListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("mousedown",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a mouseup event handler */
    public addMouseUpListener(callback: (e: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("mouseup",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a mousemove event handler */
    public addMouseMoveListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("mousemove",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a mouseout event handler */
    public addMouseOutListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("mouseout",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a mouseover event handler */
    public addMouseOverListener(callback: (evt: ElementMouseEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("mouseover",
            (evt) => callback(getElementMouseEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a touchstart event handler */
    public addTouchStartListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("touchstart",
            (evt) => callback(getElementTouchEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a touchend event handler */
    public addTouchEndListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("touchend",
            (evt) => callback(getElementTouchEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a touchmove event handler */
    public addTouchMoveListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("touchmove",
            (evt) => callback(getElementTouchEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a touchcancel event handler */
    public addTouchCancelListener(callback: (evt: ElementTouchEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("touchcancel",
            (evt) => callback(getElementTouchEvent(evt, this)),
            useCapture);
        return this;
    }
    /** Adds a keypress event handler */
    public addKeyPressListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("keypress",(evt) => callback(getElementKeyboardEvent(evt, this)), useCapture);
        return this;
    }
    /** Adds a keydown event handler */
    public addKeyDownListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("keydown",(evt) => callback(getElementKeyboardEvent(evt, this)), useCapture);
        return this;
    }
    /** Adds a keyup event handler */
    public addKeyUpListener(callback: (evt: ElementKeyboardEvent) => any, useCapture?: boolean): UIElement
    {
        this._htmlElement.addEventListener("keyup",(evt) => callback(getElementKeyboardEvent(evt, this)), useCapture);
        return this;
    }
    /** Adds a transitionend event handler */
    public addTransitionEndListener(callback: (evt: ElementEvent) => any, useCapture?: boolean): UIElement
    {
        //var name = "ontransitionend" in window ? "transitionend" : "webkitTransitionEnd";
        //this._htmlElement.addEventListener(name, (evt) => callback(getElementEvent(evt, this)), useCapture);
        this._htmlElement.addEventListener("webkitTransitionEnd",(evt) => callback(getElementEvent(evt, this)), useCapture);
        this._htmlElement.addEventListener("transitionend",(evt) => callback(getElementEvent(evt, this)), useCapture);
        return this;
    }
}
