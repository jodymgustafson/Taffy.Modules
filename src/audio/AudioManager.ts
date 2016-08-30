import * as AudioLib from "./AudioLib";
import {AudioClip} from "./AudioClip";
import {AsyncAction} from "../AsyncAction";
import {AsyncActionTracker} from "../AsyncActionTracker";
import {Map} from "../collections/Map";

"use strict";
/**
 * An async action for loading audio files using an AsyncActionTracker
 */
export class LoadAudioAction extends AsyncAction
{
    constructor(public audio: HTMLAudioElement, timeout?: number)
    {
        super(timeout);
    }

    public start(): LoadAudioAction
    {
        var oncanplaythru = () =>
        {
            AudioLib.log("Audio loaded: " + this.audio.src);
            // In firefox we keep getting these events if it's not removed
            this.audio.removeEventListener("canplaythrough", oncanplaythru);
            this.complete();
        };
        this.audio.addEventListener("canplaythrough", oncanplaythru);

        this.audio.addEventListener("error", (evt) =>
        {
            console.error("Error loading audio: " + this.audio.src);
            this.error("Error code: " + this.audio.error.code);
        });

        return this;
    }
}

/**
* Provides support for loading and caching audio elements.
* This can be used along with an AsyncActionTracker to keep track of the loading process.
*/
export class AudioManager
{
    private audios = new Map<HTMLAudioElement>();
    private static audioExt = AudioLib.getSupportedFileTypes()[0];
    /** Set to true to bust browser caching of audio files */
    public bustBrowserCache = false;

    /**
    * Creates an audio manager
    * @param audioPath The default path to look for audio files
    * @param timeout Set timeout in ms for loading audio, default no timeout
    * @param noCache Set to true to not cache audio, default false
    */
    constructor(private audioPath = "", private timeout = 0, private noCache = false)
    {
    }

    /**
    * Gets an audio element. First checks the cache for it. If not found it will be loaded and cached.
    * @param name Name of the audio file, without a file extension
    * @param onLoaded A callback function to be called after the file has been loaded
    * @param onError A callback function to be called when there was an error loading the file
    */
    public getAudio(name: string, onLoaded?: (audio: HTMLAudioElement) => any, onError?: (audio: HTMLAudioElement) => any): HTMLAudioElement
    {
        // Try to get from cache
        var audio = this.audios.getItem(name);
        if (!audio)
        {
            // Not in cache, load it
            audio = this.createAudio(name);
            // Add event listeners
            if (onLoaded) audio.onload = () => onLoaded(audio);
            if (onError) audio.onerror = () => onError(audio);
        }
        else if (onLoaded)
        {
            onLoaded(audio);
        }
        return audio;
    }

    /**
    * Loads one or more audio clips
    * @param names One or more audio file names
    * @return A tracker object where you can define callbacks for loaded, done and error.
    */
    public loadAudio(...names: string[]): AsyncActionTracker<LoadAudioAction>
    {
        return this.loadAudios(names);
    }

    /**
    * Loads one or more audio clips from an array of audio file names
    * @param names An array of audio file names
    * @return A tracker object where you can define callbacks for loaded, done and error.
    */
    public loadAudios(names: string[]): AsyncActionTracker<LoadAudioAction>
    {
        var tracker = new AsyncActionTracker();

        names.forEach(name =>
        {
            var audio = this.createAudio(name);
            tracker.addAction(new LoadAudioAction(audio, this.timeout));
        });

        return tracker;
    }

    /** Enumerates over each cached audio resource */
    public forEach(callback: (audio: HTMLAudioElement, name: string) => any): void
    {
        this.audios.each(callback);
    }

    private createAudio(name: string): HTMLAudioElement
    {
        if (AudioLib.debug) AudioLib.log("Loading audio: " + name + AudioManager.audioExt);
        var audio = new Audio();
        audio.id = name;
        let src = encodeURI(this.audioPath) + "/" + encodeURIComponent(name) + AudioManager.audioExt;
        if (this.bustBrowserCache)
        {
            src += "?_t=" + new Date().getTime();
        }
        audio.src = src;

        if (!this.noCache)
        {
            // Add to cache
            this.audios.setItem(name, audio);
        }

        return audio;
    }
}
