import { gsap } from 'gsap';

import { labels } from '../common/enums.js';
import { getUIElement } from '../helpers/index.js';
import { eventBus } from '../utils/EventBus.js';
import { soundManager } from '../utils/SoundManager.js';

export class GameManager {
	constructor(app) {
		this.app = app;
		
		// Инициализация UI элементов
		this.gameContainer = getUIElement(this.app.stage, labels.game);
		this.soundButton = getUIElement(this.gameContainer, labels.sound);
		this.slash = getUIElement(this.soundButton, labels.muteSlash);
		this.finishScene = getUIElement(this.gameContainer, labels.sceneFinish);
		
		// Подписка на события EventBus
		eventBus.on('toggleSound', this.toggleSound);
		
		// Добавление обработчиков
		this.soundButton.on('pointerdown', () => eventBus.emit('toggleSound'));
		
		soundManager.play('bg');
	};
	
	toggleSound = () => {
		const isMuted = soundManager.toggleMute();
		
		gsap.to(this.slash, {
			visible: isMuted,
			duration: 0.25,
			ease: 'power2.out'
		});
	};
}
