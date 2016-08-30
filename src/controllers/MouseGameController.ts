import {GameController, ControllerButton} from "./GameController";
import {UIElement} from "../ui/Element";

/**
 * Game controller that uses the mouse.
 * Uses zones to determine when to trigger direction events.
 * When the mouse moves into a zone it triggers the event.
 * Any area not in one of the zones is the dead zone that causes no event.
 */
export class MouseGameController extends GameController
{
    protected zones = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };

    private element: UIElement;
    private _mouseMoveHandler;
    private _mouseDownHandler;
    private _mouseUpHandler;

    constructor(element: HTMLElement, zoneSize = 0.45)
    {
        super("mouse");
        this.element = new UIElement(element);

        let rect = this.element.getBounds();
        this.zones.top = rect.height * zoneSize;
        this.zones.bottom = rect.height - this.zones.top;
        this.zones.left = rect.width * zoneSize;
        this.zones.right = rect.width - this.zones.left;
    }

    public setZones(top: number, bottom: number, left: number, right: number): void
    {
        this.zones.top = top;
        this.zones.bottom = bottom;
        this.zones.left = left;
        this.zones.right = right;
    }

    public connect(): boolean
    {
        if (!this.connected)
        {
            this.element.htmlElement.addEventListener("mousemove", (this._mouseMoveHandler = evt => this.onMouseMove(evt)));
            this.element.htmlElement.addEventListener("mousedown", (this._mouseDownHandler = evt => this.onMouseDown(evt)));
            this.element.htmlElement.addEventListener("mouseup", (this._mouseUpHandler = evt => this.onMouseUp(evt)));
            return super.connect();
        }
        return true;
    }

    public disconnect(): boolean
    {
        if (this.connected)
        {
            this.element.htmlElement.removeEventListener("mousemove", this._mouseMoveHandler);
            this.element.htmlElement.removeEventListener("mousedown", this._mouseDownHandler);
            this.element.htmlElement.removeEventListener("mouseup", this._mouseUpHandler);
            return super.disconnect();
        }
        return true;
    }

    protected onMouseMove(evt: MouseEvent): void
    {
        let y = this.element.toElementY(evt.y);
        if (y < this.zones.top)
        {
            this.triggerButtonUpEvent(ControllerButton.DOWN);
            this.triggerButtonDownEvent(ControllerButton.UP);
        }
        else if (y > this.zones.bottom)
        {
            this.triggerButtonUpEvent(ControllerButton.UP);
            this.triggerButtonDownEvent(ControllerButton.DOWN);
        }
        else
        {
            this.triggerButtonUpEvent(ControllerButton.UP);
            this.triggerButtonUpEvent(ControllerButton.DOWN);
        }

        let x = this.element.toElementY(evt.x);
        if (x < this.zones.left)
        {
            this.triggerButtonUpEvent(ControllerButton.RIGHT);
            this.triggerButtonDownEvent(ControllerButton.LEFT);
        }
        else if (x > this.zones.right)
        {
            this.triggerButtonUpEvent(ControllerButton.LEFT);
            this.triggerButtonDownEvent(ControllerButton.RIGHT);
        }
        else
        {
            this.triggerButtonUpEvent(ControllerButton.LEFT);
            this.triggerButtonUpEvent(ControllerButton.RIGHT);
        }
    }

    protected onMouseDown(evt: MouseEvent): void
    {
        this.triggerButtonDownEvent(ControllerButton.FIRE);
    }

    protected onMouseUp(evt: MouseEvent): void
    {
        this.triggerButtonUpEvent(ControllerButton.FIRE);
    }
}