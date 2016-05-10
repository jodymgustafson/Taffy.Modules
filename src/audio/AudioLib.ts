/**
* The audio library provides support for working with audio files.
*/
"use strict";

/** Set to true to log debugging messages */
export var debug = false;

let _supportFileTypes: string[];

/**
* Returns a list of all audio file extensions supported by the browser
* Note: you may need to add some file extensions to your server's list of MIME types
*/
export function getSupportedFileTypes(): string[]
{
    if (!_supportFileTypes)
    {
        _supportFileTypes = [];
        var audio = new Audio();
        if (audio.canPlayType("audio/ogg")) _supportFileTypes.push(".ogg");
        if (audio.canPlayType("audio/mpeg")) _supportFileTypes.push(".mp3");
        if (audio.canPlayType("audio/wav")) _supportFileTypes.push(".wav");
    }
    return _supportFileTypes;
}

export function log(getMsg: () => string): void;
export function log(msg: string): void;
export function log(msg: any): void
{
    if (debug)
    {
        if (typeof (msg) === "function") msg = msg();
        console.log(msg);
    }
}
