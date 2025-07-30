import { Graphics, Container } from "pixi.js";
import { PixiElement } from "../utils/PixiElement.js";
import { allTextureKeys } from "../common/assets.js";
import { elementType, labels } from "../common/enums.js";

export default function createBg(app) {
  const bg = new PixiElement({
    type: elementType.SPRITE,
    texture: allTextureKeys.back,
    label: labels.bg,
    interactive: false,
    anchor: [0.5, 0],
  });

  const container = new Container();
  const elementBg = bg.getElement();

  const targetWidth = 1920;
  const targetHeight = 1080;

  const texW = elementBg.texture.width;
  const texH = elementBg.texture.height;

  const scaleX = targetWidth / texW;
  const scaleY = targetHeight / texH;

  const scale = Math.max(scaleX, scaleY);

  elementBg.scale.set(scale);

  elementBg.position.set(targetWidth / 2, 0);

  const mask = new Graphics();
  mask.fill(0xffffff);
  mask.rect(0, 0, targetWidth, targetHeight);
  mask.fill();

  container.addChild(elementBg);
  container.addChild(mask);
  elementBg.mask = mask;

  return container;
}
