import { isMobile } from 'pixi.js';

import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createFinger(app) {
	const container = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.fingerContainer,
		visible: false,
	}, onResizeHandler, true);
	const elementContainer = container.getElement();
	
	const finger = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.hand,
		label: labels.finger,
		interactive: false,
	});
	const elementFinger = finger.getElement();
	
	const fingerActive = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.handTap,
		label: labels.fingerActive,
		interactive: false,
		alpha: 0,
	});
	const elementFingerActive = fingerActive.getElement();
	
	container.addChildren([elementFinger, elementFingerActive]);
	
	function setPosition() {
		if (app.renderer.width < 630 || isMobile.phone ) {
			elementContainer.scale.set(0.5);
		} else {
			elementContainer.scale.set(1);
		}
		elementContainer.position.set(app.renderer.width / 2, app.renderer.height / 2);
	}
	setPosition();
	
	function onResizeHandler() {
		setPosition();
	}
	
	return elementContainer;
}
