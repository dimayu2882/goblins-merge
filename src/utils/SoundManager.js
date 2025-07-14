import { Howl, Howler } from 'howler';
import { audioAssets } from '../common/assets.js';

class SoundManager {
	constructor() {
		this.sounds = {
			tap: new Howl({
				src: [audioAssets.tap],
				volume: 0.2,
			}),
			win: new Howl({
				src: [audioAssets.win],
				volume: 0.2,
			}),
			wrong: new Howl({
				src: [audioAssets.wrong],
				volume: 0.2,
			}),
			bg: new Howl({
				src: [audioAssets.bg],
				loop: true,
				volume: 0.2,
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
