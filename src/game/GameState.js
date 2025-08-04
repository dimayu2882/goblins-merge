import { labels } from '../common/enums.js';

class GameState {
	constructor() {
		this.gameState = labels.gameSceneStart;
	}
	
	getGameState = () => this.gameState;
	
	setGameState = (gameState) => this.gameState = gameState;
}

export const gameState = new GameState();
