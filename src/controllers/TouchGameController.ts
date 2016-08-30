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
 * Game controller that uses touch gestures.
 * When a touch happens in a zone it triggers a direction or fire events.
 */
export class TouchGameController extends GameController
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
        super("touch");
        this.element = new UIElement(element);

        if (!directionZone)
        {
            directionZone = {
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
            this.element.htmlElement.addEventListener("touchstart", (this._startHandler = evt => this.onTouchStart(evt)));
            this.element.htmlElement.addEventListener("touchend", (this._endHandler = evt => this.onTouchEnd(evt)));
            this.element.htmlElement.addEventListener("touchmove", (this._moveHandler = evt => this.onTouchMove(evt)));
            this.element.htmlElement.addEventListener("touchcancel", (this._cancelHandler = evt => this.onTouchEnd(evt)));
            return super.connect();
        }
        return true;
    }

    public disconnect(): boolean
    {
        if (this.connected)
        {
            this.element.htmlElement.removeEventListener("touchstart", this._startHandler);
            this.element.htmlElement.removeEventListener("touchend", this._endHandler);
            this.element.htmlElement.removeEventListener("touchmove", this._moveHandler);
            this.element.htmlElement.removeEventListener("touchcancel", this._cancelHandler);
            return super.disconnect();
        }
        return true;
    }

    protected onTouchMove(evt: TouchEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        let p = this.element.toElementPoint(evt.touches[0].pageX, evt.touches[0].pageY);
        this.handleTouch(p.x, p.y);
    }

    protected onTouchStart(evt: TouchEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        this.touching = true;
        let p = this.element.toElementPoint(evt.touches[0].pageX, evt.touches[0].pageY);
        this.handleTouch(p.x, p.y);
    }

    protected onTouchEnd(evt: TouchEvent): void
    {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.touching)
        {
            this.touching = false;
            this.triggerButtonUpEvent(ControllerButton.FIRE);
            this.triggerButtonUpEvent(ControllerButton.LEFT);
            this.triggerButtonUpEvent(ControllerButton.RIGHT);
            this.triggerButtonUpEvent(ControllerButton.DOWN);
            this.triggerButtonUpEvent(ControllerButton.UP);
        }
    }

    protected handleTouch(x: number, y: number): void
    {
        if (this.fireArea.contains(x, y))
        {
            this.triggerButtonDownEvent(ControllerButton.FIRE);
        }
        else if (this.directionArea.bounds.contains(x, y))
        {

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