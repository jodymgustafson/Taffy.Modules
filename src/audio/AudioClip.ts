/** Wrapper for HTML5 audio */
export class AudioClip
{
    protected audioElement: HTMLAudioElement;
    private _fadeTimeout = 1000 / 33;
    private _fading = false;

    constructor(audio: HTMLAudioElement)
    {
        this.audioElement = audio;
    }

    /** Gets the audio element */
    public get audio(): HTMLAudioElement
    {
        return this.audioElement;
    }

    public get loop(): boolean
    {
        return this.audioElement.loop;
    }
    public set loop(on: boolean)
    {
        this.audioElement.loop = on;
    }

    public play(): AudioClip
    {
        this.audioElement.play();
        return this;
    }
    public pause(): AudioClip
    {
        this.audioElement.pause();
        return this;
    }
    public stop(): AudioClip
    {
        if (this._fading)
        {
            this.stopFadeOut();
        }
        this.pause().reset();
        return this;
    }
    public reset(): AudioClip
    {
        this.audioElement.currentTime = 0;
        return this;
    }
    public isPlaying(): boolean
    {
        return !(this.audioElement.ended || this.audioElement.currentTime === 0 || this.audioElement.currentTime === this.audioElement.duration);
    }
    public getVolume(): number
    {
        return this.audioElement.volume;
    }
    public setVolume(vol: number): AudioClip
    {
        this.audioElement.volume = this.normalizeVolume(vol);
        return this;
    }

    /** Makes a copy of the audio clip backed by a new audio element. Note: there are limitations to the number of instances of an audio element. */
    public clone(): AudioClip
    {
        var audioClip = new AudioClip(new Audio());
        audioClip.audio.id = this.audio.id;
        audioClip.audio.src = this.audio.src;
        return audioClip;
    }

    public fadeOut(time: number): AudioClip
    {
        this._fading = true;
        var delta = this.audioElement.volume / time * this._fadeTimeout;
        this.fadeLoop(delta);
        return this;
    }

    private normalizeVolume(vol: number): number
    {
        return Math.min(Math.max(vol, 0), 1);
    }

    private fadeLoop(delta: number)
    {
        if (this._fading)
        {
            this.audioElement.volume = this.normalizeVolume(this.audioElement.volume - delta);
            if (this.audioElement.volume > 0)
            {
                setTimeout(() => this.fadeLoop(delta), this._fadeTimeout);
            }
            else
            {
                this._fading = false;
                this.audioElement.pause();
            }
        }
    }
    private stopFadeOut()
    {
        this._fading = false;
    }
}
