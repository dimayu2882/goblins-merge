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
		
		// Подписка на события EventBus
		eventBus.on('toggleSound', this.toggleSound);
		
		// Добавление обработчиков
		
	};
	
	toggleSound = () => {
		const isMuted = soundManager.toggleMute();
	};
}
