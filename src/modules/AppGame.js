import { Application } from "pixi.js";

import { CONTAINER_ID, BASE_HEIGHT, BASE_WIDTH } from "../common/constants.js";
import { MainGame } from "../game/MainGame.js";
import { ScaleManager } from "../utils/ScaleManager.js";
import { setAppInstance } from "../utils/utils.js";

export class AppGame {
  constructor() {
    this.app = null;
    this.container = document.getElementById(CONTAINER_ID);
    this.game = new MainGame(this.app);
    this.scaleManager = null;
  }
  
  async initGame() {
    this.app = new Application();
    
    
    const isPortrait = window.innerHeight > window.innerWidth;
    const width = isPortrait ? BASE_HEIGHT : BASE_WIDTH;
    const height = isPortrait ? BASE_WIDTH : BASE_HEIGHT;
    
    await this.app.init({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
    });
    
    globalThis.__PIXI_APP__ = this.app;
    
    this.container.appendChild(this.app.canvas);
    
    this.game = new MainGame(this.app);
    setAppInstance(this.app);
    
    const gameContainer = await this.game.initializeGameElements();
    
    this.scaleManager = new ScaleManager(gameContainer, this.app);
    
    // subscribeToResize(this.app);
    // this.app.onResize = () => {
    // 	const { width, height } = getAdaptiveSize();
    // 	this.app.renderer.resize(width, height);
    // };
    // initResizeManager();
  }
}
