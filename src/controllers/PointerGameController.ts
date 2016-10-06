import {GameController, ControllerButton} from "./GameController";
import {UIElement, IPoint} from "../ui/Element";
import {Rectangle} from "../Rectangle";

export interface IDirectionZone
{
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
export class PointerGameController extends GameController
{
    protected directionArea: IDirectionZone;
    protected fireArea: Rectangle;

    protected element: UIElement;
    private touching = false;

    private _startHandler;
    private _endHandler;
    private _moveHandler;
    private _cancelHandler;

    constructor(element: HTMLElement, fireZone = new Rectangle(), directionZone?: IDirectionZone)
    {
        super("pointer");
        this.element = new UIElement(element);

        if (!(this.fireArea = fireZone))
        {
            this.fireArea = new Rectangle();
        }

        if (!(this.directionArea = directionZone))
        {
            this.directionArea = {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                bounds: new Rectangle()
            };
        }
    }

    public setDirectionArea(x: number, y: number, w: number, h: number): void
    {
        this.directionArea.bounds.x = x;
        this.directionArea.bounds.y = y;
        this.directionArea.bounds.w = w;
        this.directionArea.bounds.h = h;
    }
    public setDirectionAreaZones(top: number, bottom: number, left: number, right: number): void
    {
        this.directionArea.top = top;
        this.directionArea.bottom = bottom;
        this.directionArea.left = left;
        this.directionArea.right = right;
    }

    public setFireArea(x: number, y: number, w: number, h: number): void
    {
        this.fireArea.x = x;
        this.fireArea.y = y;
        this.fireArea.w = w;
        this.fireArea.h = h;
    }

    public connect(): boolean
    {
        if (!this.connected)
        {
            this.element.htmlElement.addEventListener("pointerdown", (this._startHandler = evt => this.onPointerDown(evt)));
            this.element.htmlElement.addEventListener("pointerup", (this._endHandler = evt => this.onPointerUp(evt)));
            this.element.htmlElement.addEventListener("pointermove", (this._moveHandler = evt => this.onPointerMove(evt)));
            this.element.htmlElement.addEventListener("pointercancel", (this._cancelHandler = evt => this.onPointerUp(evt)));
            return super.connect();
        }
        return true;
    }

    public disconnect(): boolean
    {
        if (this.connected)
        {
            this.element.htmlElement.removeEventListener("pointerdown", this._startHandler);
            this.element.htmlElement.removeEventListener("pointerup", this._endHandler);
            this.element.htmlElement.removeEventListener("pointermove", this._moveHandler);
            this.element.htmlElement.removeEventListener("pointercancel", this._cancelHandler);
            return super.disconnect();
        }
        return true;
    }

    private fireId = 0;
    private directionId = 0;

    protected onPointerMove(evt: PointerEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        let p = this.element.toElementPoint(evt.x, evt.y);
        this.handleTouch(evt.pointerId, p.x, p.y, false);
    }

    protected onPointerDown(evt: PointerEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        this.touching = true;
        let p = this.element.toElementPoint(evt.x, evt.y);
        this.handleTouch(evt.pointerId, p.x, p.y, true);
    }

    protected onPointerUp(evt: PointerEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.touching)
        {
            this.touching = false;
            if (evt.pointerId === this.fireId)
            {
                this.fireId = 0;
                this.triggerButtonUpEvent(ControllerButton.FIRE);
            }
            else if (evt.pointerId === this.directionId)
            {
                this.directionId = 0;
                this.triggerButtonUpEvent(ControllerButton.LEFT);
                this.triggerButtonUpEvent(ControllerButton.RIGHT);
                this.triggerButtonUpEvent(ControllerButton.DOWN);
                this.triggerButtonUpEvent(ControllerButton.UP);
            }
        }
    }

    protected handleTouch(id: number, x: number, y: number, start: boolean): void
    {
        if (this.fireArea.contains(x, y))
        {
            if (start) this.fireId = id;
            this.triggerButtonDownEvent(ControllerButton.FIRE);
        }
        else if (this.directionArea.bounds.contains(x, y))
        {
            if (start) this.directionId = id;

            if (y < this.directionArea.top) // up
            {
                this.triggerButtonUpEvent(ControllerButton.DOWN);
                this.triggerButtonDownEvent(ControllerButton.UP);
            }
            else if (y > this.directionArea.bottom) // down
            {
                this.triggerButtonUpEvent(ControllerButton.UP);
                this.triggerButtonDownEvent(ControllerButton.DOWN);
            }
            else // dead
            {
                this.triggerButtonUpEvent(ControllerButton.UP);
                this.triggerButtonUpEvent(ControllerButton.DOWN);
            }

            if (x < this.directionArea.left) // left
            {
                this.triggerButtonUpEvent(ControllerButton.RIGHT);
                this.triggerButtonDownEvent(ControllerButton.LEFT);
            }
            else if (x > this.directionArea.right) // right
            {
                this.triggerButtonUpEvent(ControllerButton.LEFT);
                this.triggerButtonDownEvent(ControllerButton.RIGHT);
            }
            else // dead
            {
                this.triggerButtonUpEvent(ControllerButton.LEFT);
                this.triggerButtonUpEvent(ControllerButton.RIGHT);
            }
        }
    }
}