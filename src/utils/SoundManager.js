import { Howl, Howler } from 'howler';
import { audioAssets } from '../common/assets.js';

class SoundManager {
	constructor() {
		this.sounds = {
			build: new Howl({
				src: [audioAssets.buildTwo],
				volume: 0.2,
			}),
			swoosh: new Howl({
				src: [audioAssets.swoosh],
				volume: 0.2,
			}),
			bg: new Howl({
				src: [audioAssets.music],
				loop: true,
				volume: 0.1,
			}),
		};

		this.isMuted = false;
	}

	play(soundName) {
		if (this.sounds[soundName]) {
			this.sounds[soundName].play();
		}
	}

	toggleMute() {
		this.isMuted = !this.isMuted;
		Howler.mute(this.isMuted);
		return this.isMuted;
	}
}

export const soundManager = new SoundManager();
