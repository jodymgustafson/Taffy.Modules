export enum ControllerButton
{
    NONE = 0,
    LEFT, RIGHT, UP, DOWN,
    FIRE,
    PAUSE,
    QUIT
}

export interface IButtonEvent
{
    buttonId: number;
    controller: GameController;
}

export abstract class GameController
{
    private _onButtonDown: (event: IButtonEvent) => any;
    private _onButtonUp: (event: IButtonEvent) => any;
    private _name: string;
    private _connected = false;

    constructor(name = "na")
    {
        this._name = name;
    }

    /** Connects to the controller and starts receiving events from it
     * @return True if was able to connect
     */
    public connect(): boolean { return this._connected = true; }

    /** Disconnects from the controller and stops receiving events from it
     * @return True if was able to disconnect
     */
    public disconnect(): boolean
    {
        this._connected = false;
        return true;
    }

    public get connected(): boolean
    {
        return this._connected;
    }

    public get name() { return this._name; }

    /** Sets the button down event handler */
    public addButtonDownEventListener(callback: (event: IButtonEvent) => any): GameController
    {
        this._onButtonDown = callback;
        return this;
    }
    /** Sets the button up event handler */
    public addButtonUpEventListener(callback: (event: IButtonEvent) => any): GameController
    {
        this._onButtonUp = callback;
        return this;
    }

    protected triggerButtonDownEvent(buttonId: number)
    {
        if (this._onButtonDown)
            this._onButtonDown({ buttonId: buttonId, controller: this });
    }

    protected triggerButtonUpEvent(buttonId: number)
    {
        if (this._onButtonUp)
            this._onButtonUp({ buttonId: buttonId, controller: this });
    }
}