export class ScaleManager {
  constructor(gameContainer, app, baseWidth = 1920, baseHeight = 1080) {
    this.gameContainer = gameContainer;
    this.app = app;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;

    this.updateScale = this.updateScale.bind(this);
    window.addEventListener("resize", this.updateScale);
    this.updateScale();
  }

  updateScale() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;

    const scaleX = ww / this.baseWidth;
    const scaleY = wh / this.baseHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = this.baseWidth * scale;
    const scaledHeight = this.baseHeight * scale;
    const posX = (ww - scaledWidth) / 2;
    const posY = (wh - scaledHeight) / 2;

    this.gameContainer.scale.set(scale);
    this.gameContainer.position.set(posX, posY);

    this.app.renderer.resize(ww, wh);

    const canvas = this.app.canvas;
    canvas.style.width = `${ww}px`;
    canvas.style.height = `${wh}px`;
  }

  destroy() {
    window.removeEventListener("resize", this.updateScale);
  }
}
