import {AudioClip} from "./AudioClip";
import * as AudioLib from "./AudioLib";

/** The maximum number of audio channels allowed per audio element */
export var maxAudioChannels = 4;

/** An audio clip with multiple channels so multiple instances can be played at the same time */
export class MultiChannelAudioClip
{
    private _channels: AudioClip[] = [];

    /**
        * @param audioElement The audio element used by this instance
        * @param fillChannels If set to true all channels will be prefilled. Use to increase runtime performance.
        */
    constructor(audioElement: HTMLAudioElement, fillChannels = false)
    {
        this._channels.push(new AudioClip(audioElement));
        if (fillChannels) this.fillChannels();
    }

    /** Gets the audio element */
    public get audioElement(): HTMLAudioElement
    {
        return this._channels[0].audio;
    }

    public get id(): string
    {
        return this._channels[0].audio.id;
    }

    /**
        * Finds a free channel and plays the audio clip.
        * If there are no channels available nothing is played.
        * @return The audio clip that was played, or null if none available
        */
    public play(): AudioClip
    {
        var audioClip = this.getAvailableClip();
        if (audioClip)
        {
            audioClip.reset().play();
        }
        return audioClip;
    }

    /** Prefills all channels */
    public fillChannels(): MultiChannelAudioClip
    {
        while (this.addChannel()) /* nothing */;
        return this;
    }

    /**
        * Gets the first audio clip that's available
        * @return An available audio clip, or null if none available
        */
    private getAvailableClip(): AudioClip
    {
        // Find a free channel
        for (var i = 0; i < this._channels.length; i++)
        {
            var clip = this._channels[i];
            if (!clip.isPlaying())
            {
                AudioLib.log(() => this.id + " using channel: " + i);
                return clip;
            }
        }

        // If we made it this far there are no open channels, try to add a new one
        AudioLib.log(() => "Adding channel " + this._channels.length + " for: " + this.id);
        return this.addChannel();
    }

    /**
        * Adds a new channel if one is available
        * @return The audio clip added, or null if no more channels available
        */
    private addChannel(): AudioClip
    {
        if (this._channels.length < maxAudioChannels)
        {
            var audioClip = this._channels[0].clone();
            this._channels.push(audioClip);
            AudioLib.log(() => "Added channel for: " + this._channels[0].audio.id);
            return audioClip;
        }

        // No more channels left
        AudioLib.log(() => "No channels left for: " + this._channels[0].audio.id);
        return null;
    }
}
