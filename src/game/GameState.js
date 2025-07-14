import { getUIElement } from '../helpers/index.js';

class GameState {
	constructor() {
		this.gameState = [];
		this.isGameOver = false;
		this.isMuted = false;
	}
}

export const gameState = new GameState();
