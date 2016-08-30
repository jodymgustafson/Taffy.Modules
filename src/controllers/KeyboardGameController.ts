import {KeyCode} from "../KeyCodes";
import {GameController, ControllerButton} from "./GameController";


/** Input controller that uses the keyboard */
export class KeyboardGameController extends GameController
{
    private _keyDownHandler;
    private _keyUpHandler;
    private _xAxis = 0;

    constructor()
    {
        super("keyboard");
    }

    public connect(): boolean
    {
        if (!this.connected)
        {
            document.addEventListener("keydown", (this._keyDownHandler = (evt: KeyboardEvent) =>
            {
                this.keyDown(evt);
            }));
            document.addEventListener("keyup", (this._keyUpHandler = (evt: KeyboardEvent) =>
            {
                this.keyUp(evt);
            }));
            return super.connect();
        }
        return true;
    }

    public disconnect(): boolean
    {
        if (this.connected)
        {
            document.removeEventListener("keydown", this._keyDownHandler);
            document.removeEventListener("keyup", this._keyUpHandler);
            return super.disconnect();
        }
        return true;
    }

    protected keyDown(evt: KeyboardEvent): boolean
    {
        let keyCode = evt.which;
        var button = this.getControllerButton(keyCode);
        if (button)
        {
            this.triggerButtonDownEvent(button);
            return true;
        }

        return false;
    }

    protected keyUp(evt: KeyboardEvent): boolean
    {
        let keyCode = evt.which;
        var button = this.getControllerButton(keyCode);
        if (button)
        {
            this.triggerButtonUpEvent(button);
            return true;
        }

        return false;
    }

    private getControllerButton(keyCode: number): ControllerButton
    {
        switch (keyCode)
        {
            case KeyCode.LEFT:
            case KeyCode.A:
                return ControllerButton.LEFT;
            case KeyCode.RIGHT:
            case KeyCode.D:
                return ControllerButton.RIGHT;
            case KeyCode.DOWN:
            case KeyCode.X:
                return ControllerButton.DOWN;
            case KeyCode.UP:
            case KeyCode.W:
                return ControllerButton.UP;
            case KeyCode.SPACE:
                return ControllerButton.FIRE;
            case KeyCode.P:
            case KeyCode.ESCAPE:
                return ControllerButton.PAUSE;
            case KeyCode.Q:
                return ControllerButton.QUIT;
        }

        return null;
    }
}