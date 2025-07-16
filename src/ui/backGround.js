import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createBg(app) {
	const bg = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.back,
		label: labels.bg,
		interactive: false,
		anchor: [0.5, 0],
		position: [app.renderer.width / 2, 0],
	}, onResizeHandler, true);
	const elementBg = bg.getElement();
	
	const scaleX = app.renderer.width / elementBg.texture.width;
	const scaleY = app.renderer.height / elementBg.texture.height;
	
	elementBg.scale.set(Math.max(scaleX, scaleY));
	
	function onResizeHandler() {
		const scaleX = app.renderer.width / elementBg.texture.width;
		const scaleY = app.renderer.height / elementBg.texture.height;
		
		elementBg.scale.set(Math.max(scaleX, scaleY));
		elementBg.position.set(app.renderer.width / 2, 0);
	}
	
	return elementBg;
}
