import { Application } from 'pixi.js';

import { CONTAINER_ID } from '../common/constants.js';
import { MainGame } from '../game/MainGame.js';
import { initResizeManager, subscribeToResize, } from '../utils/resizeManager.js';
import { ScaleManager } from '../utils/ScaleManager.js';
import { getAdaptiveSize, setAppInstance } from '../utils/utils.js';

export class AppGame {
	constructor() {
		this.app = null;
		this.container = document.getElementById(CONTAINER_ID);
		this.game = new MainGame(this.app);
		this.scaleManager = null;
	}

	async initGame() {
		const { width, height } = getAdaptiveSize();
		
		this.app = new Application();
		await this.app.init({
			width: 1920,
			height: 1080,
			backgroundAlpha: 0,
			antialias: true,
			autoDensity: true,
		});

		globalThis.__PIXI_APP__ = this.app;

		this.container.appendChild(this.app.canvas);

		this.game = new MainGame(this.app);
		setAppInstance(this.app);
    
    const gameContainer = await this.game.initializeGameElements();
    
    this.scaleManager = new ScaleManager(gameContainer, this.app, 1920, 1080);
		
		// subscribeToResize(this.app);
		// this.app.onResize = () => {
		// 	const { width, height } = getAdaptiveSize();
		// 	this.app.renderer.resize(width, height);
		// };
		// initResizeManager();
	}
}
