interface IPosition
{
    left: number;
    top: number;
}

/**
 * Wraps a mouse event to provide element based positions
 */
export class ElementMouseEvent
{
    /** X-Position of the mouse inside the element */
    public elementX: number;
    /** Y-Position of the mouse inside the element */
    public elementY: number;

    /**
     * @param element The element the event ocurred on
     * @param event The mouse event
     */
    constructor(public element: HTMLElement, public event: MouseEvent)
    {
        let rect = element.getBoundingClientRect();
        let left = rect.left + window.pageXOffset;
        let top = rect.top + window.pageYOffset;

        this.elementX = event.pageX - left;
        this.elementY = event.pageY - top;
    }
}