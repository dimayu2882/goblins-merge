import { PixiElement } from "../utils/PixiElement.js";
import { allTextureKeys } from "../common/assets.js";
import { elementType, labels } from "../common/enums.js";

export default function createBg(app) {
  const bg = new PixiElement({
    type: elementType.SPRITE,
    texture: allTextureKeys.back,
    label: labels.bg,
    interactive: false,
    anchor: [0.5]
  }, onResizeHandler, true);
  const elementBg = bg.getElement();
  
  setPosition();
  function setPosition() {
    const texW = elementBg.texture.width;
    const texH = elementBg.texture.height;
    
    const scaleX = app.renderer.width / texW;
    const scaleY = app.renderer.height / texH;
    const scale = Math.max(scaleX, scaleY);
    
    elementBg.scale.set(scale);
    elementBg.position.set(app.renderer.width / 2, app.renderer.height / 2);
  }
  
  function onResizeHandler() {
    setPosition();
  }
  
  return elementBg;
}
