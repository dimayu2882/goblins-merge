import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createLabel(app) {
	const label = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.free,
		label: labels.label,
		interactive: false,
		anchor: [1],
		position: [app.renderer.width, app.renderer.height],
		scale: [2]
	}, onResizeHandler, true);
	const elementLabel = label.getElement();
	
	function onResizeHandler() {
		elementLabel.position.set(app.renderer.width, app.renderer.height);
	}
	
	return elementLabel;
}
