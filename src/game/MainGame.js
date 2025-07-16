import { Assets, Container } from 'pixi.js';

import { appTextures } from '../common/assets.js';
import { LOADER_FILL, PRELOADER_ID } from '../common/constants.js';
import { labels } from '../common/enums.js';
import {
	createBg, createButtonInstall,
	createFinger, createLabel, createResourceBars
} from '../ui/index.js';
import { eventBus } from '../utils/EventBus.js';
import { GameManager } from './GameManager.js';

export class MainGame {
	constructor(app) {
		this.app = app;
		this.preloader = document.getElementById(PRELOADER_ID);
		this.loaderFill = document.getElementById(LOADER_FILL);
		this.gameContainer = new Container();
		this.gameContainer.label = labels.game;
	}

	async loadAppAssets() {
		if (!appTextures || typeof appTextures !== 'object') {
			throw new Error('appTextures не определен или имеет неверный формат');
		}

		const assetBundles = Object.entries(appTextures).map(([key, url]) => ({
			alias: key,
			src: url,
		}));

		await Assets.load(assetBundles, progress => {
			if (this.loaderFill) {
				const percent = Math.round(progress * 100);
				this.loaderFill.style.width = `${percent}%`;
			}
		});

		this.preloader.style.display = 'none';
	}

	initializeGameElements = async () => {
		const { app } = this;
		await this.loadAppAssets();

		app.stage.addChild(this.gameContainer);
		this.gameContainer.addChild(
			createBg(app),
			createResourceBars(app),
			createFinger(app),
			createLabel(app),
			createButtonInstall(app),
		);
		
		this.gameManager = new GameManager(app);
		eventBus.emit('startGame');

		return this.gameContainer;
	};
}
