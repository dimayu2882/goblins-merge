import { Assets, Container } from 'pixi.js';

import { appTextures } from '../common/assets.js';
import { LOADER_FILL, PRELOADER_ID } from '../common/constants.js';
import { labels } from '../common/enums.js';
import createChests from '../ui/chests.js';
import {
	createBg, createButtonInstall,
	createFinger, createGoblins, createLabel,
	createResourceBars, createSceneFinish, createTextMerge
} from '../ui/index.js';
import createMine from '../ui/mine.js';
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
		
		const resourceBar = createResourceBars(app);
		
		app.stage.addChild(this.gameContainer);
		this.gameContainer.addChild(
			createBg(app),
			resourceBar,
			createTextMerge(app),
			createMine(app),
			createFinger(app),
			createGoblins(app, resourceBar),
			createChests(app, resourceBar),
			createButtonInstall(app),
			createLabel(app),
			createSceneFinish(app)
		);
		
		this.gameManager = new GameManager(app);
		eventBus.emit('startGame');

		return this.gameContainer;
	};
}
