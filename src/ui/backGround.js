import { Graphics, Container } from "pixi.js";
import { BASE_WIDTH, BASE_HEIGHT } from '../common/constants.js';
import { PixiElement } from "../utils/PixiElement.js";
import { allTextureKeys } from "../common/assets.js";
import { elementType, labels } from "../common/enums.js";

export default function createBg() {
  const bg = new PixiElement({
    type: elementType.SPRITE,
    texture: allTextureKeys.back,
    label: labels.bg,
    interactive: false,
    anchor: [0.5, 0.5], // центр
  });
  
  const container = new Container();
  const elementBg = bg.getElement();
  
  const texW = elementBg.texture.width;
  const texH = elementBg.texture.height;
  
  const scaleX = BASE_WIDTH / texW;
  const scaleY = BASE_HEIGHT / texH;
  const scale = Math.max(scaleX, scaleY); // чтобы покрыть сцену
  
  elementBg.scale.set(scale);
  elementBg.position.set(BASE_WIDTH / 2, BASE_HEIGHT / 2);
  
  // Маска, если нужна точная граница сцены
  const mask = new Graphics();
  mask.fill(0xffffff);
  mask.rect(0, 0, BASE_WIDTH, BASE_HEIGHT);
  mask.fill();
  
  container.addChild(elementBg);
  container.addChild(mask);
  elementBg.mask = mask;
  
  return container;
}
