import {AsyncAction} from "./AsyncAction";

export class LoadImageAction extends AsyncAction
{
    constructor(public img: HTMLImageElement, timeout?: number)
    {
        super(timeout);
    }

    public start(): LoadImageAction
    {
        this.img.onload = () =>
        {
            this.complete();
        };
        this.img.onerror = (ev) =>
        {
            this.error("Error loading image: " + this.img.src);
        };
        return this;
    }
}