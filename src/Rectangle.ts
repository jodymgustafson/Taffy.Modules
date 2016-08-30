export class Rectangle
{
    constructor(public x = 0, public y = 0, public w = 0, public h = 0)
    {
    }

    public get top(): number { return this.y; }
    public get bottom(): number { return this.y + this.h; }
    public get left(): number { return this.x; }
    public get right(): number { return this.x + this.w; }

    /** Moves the rect to a new position */
    public moveTo(x: number, y: number): Rectangle
    {
        this.x = x;
        this.y = y;
        return this;
    }

    /** Determines if this rect intersects with another */
    public intersects(rect: Rectangle): boolean
    {
        var result =
            this.x < rect.x + rect.w &&
            this.x + this.w > rect.x &&
            this.y < rect.y + rect.h &&
            this.y + this.h > rect.y;
        return result;
    }

    /** Determines if this rect contains a point */
    public contains(x: number, y: number): boolean
    {
        var result =
            this.x < x &&
            this.x + this.w > x &&
            this.y < y &&
            this.y + this.h > y;
        return result;
    }
}