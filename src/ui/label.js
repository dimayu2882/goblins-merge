import { isMobile } from 'pixi.js';

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
	}, onResizeHandler, true);
	const elementLabel = label.getElement();
	
	function setPosition() {
		elementLabel.position.set(app.renderer.width, app.renderer.height);
		
		if (app.renderer.width < 630 || isMobile.phone ) {
			elementLabel.scale.set(0.5);
		} else {
			elementLabel.scale.set(1);
		}
	}
	setPosition();
	
	function onResizeHandler() {
		setPosition();
	}
	
	return elementLabel;
}
