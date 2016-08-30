/**
* Gets a random number between 0 and max
* @param max
*/
export function nextTo(max: number = 1): number
{
    return Math.random() * max;
}

/**
* Gets a random number between min and max
* @param min
* @param max
*/
export function next(min: number = 0, max: number = 1): number
{
    var range = max - min;
    return Math.random() * range + min;
}

/**
* Gets a random integer between min and max
* @param min
* @param max
*/
export function nextInt(min: number, max: number): number
{
    return next(min, max + 1) | 0;
}

/**
* Gets a random integer between 0 and max
* @param max
*/
export function nextIntTo(max: number): number
{
    return nextTo(max + 1) | 0;
}

/**
 * Gets a random boolean value
 */
export function nextBoolean(): boolean
{
    return Math.random() < .5;
}