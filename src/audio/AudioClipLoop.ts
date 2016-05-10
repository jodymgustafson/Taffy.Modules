import {AudioClip} from "./AudioClip";

"use strict";
/** Implements an audio clip that loops properly */
export class AudioClipLoop extends AudioClip
{
    private audios: HTMLAudioElement[] = [];
    private pointer = 0;
    private timeout = 0;
    private timerId = 0;

    constructor(audio: HTMLAudioElement)
    {
        super(audio);
        this.audios.push(audio);
        this.audios.push(this.clone().audio);

        this.timeout = Math.floor(audio.duration * 1000);
    }

    private playNext()
    {
        if (this.timerId)
        {
            this.pointer = ++this.pointer % 2;
            this.audioElement = this.audios[this.pointer];
            this.audioElement.currentTime = 0;
            this.audioElement.play();
            this.timerId = setTimeout(() => this.playNext(), this.timeout);
        }
    }

    public play(): AudioClipLoop
    {
        if (!this.timerId)
        {
            super.play();
            this.timerId = setTimeout(() => this.playNext(), this.timeout);
        }
        return this;
    }

    public pause(): AudioClipLoop
    {
        if (this.timerId)
        {
            super.pause();
            clearTimeout(this.timerId);
            this.timerId = 0;
            this.pointer = 0;
        }
        return this;
    }

    public setVolume(vol: number): AudioClipLoop
    {
        super.setVolume(vol);
        this.audios[0].volume = this.audios[1].volume = super.getVolume();
        return this;
    }

    public fadeOut(time: number): AudioClipLoop
    {
        this.stop();
        return this;
    }
}
