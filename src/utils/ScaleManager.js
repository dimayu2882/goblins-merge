import { Rectangle } from "pixi.js";
import { BASE_WIDTH, BASE_HEIGHT } from "../common/constants.js";

export class ScaleManager {
  constructor(gameContainer, app) {
    this.gameContainer = gameContainer;
    this.app = app;
    
    this.updateScale = this.updateScale.bind(this);
    window.addEventListener("resize", this.updateScale);
    this.updateScale();
  }
  
  updateScale() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    
    const isPortrait = wh > ww;
    const logicalWidth = isPortrait ? BASE_HEIGHT : BASE_WIDTH;
    const logicalHeight = isPortrait ? BASE_WIDTH : BASE_HEIGHT;
    
    const scale = Math.min(ww / logicalWidth, wh / logicalHeight);
    
    // Масштабируем контейнер
    this.gameContainer.scale.set(scale);
    this.gameContainer.x = (ww - logicalWidth * scale) / 2;
    this.gameContainer.y = (wh - logicalHeight * scale) / 2;
    
    // Меняем физический размер canvas
    this.app.renderer.resize(ww, wh);
    
    const canvas = this.app.canvas;
    canvas.style.width = `${ww}px`;
    canvas.style.height = `${wh}px`;
    
    // hitArea сцены
    // this.gameContainer.hitArea = new Rectangle(0, 0, logicalWidth, logicalHeight);
  }
  
  destroy() {
    window.removeEventListener("resize", this.updateScale);
  }
}
