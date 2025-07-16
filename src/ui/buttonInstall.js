import { gsap } from 'gsap';

import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createButtonInstall(app) {
	const buttonInstall = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.installButton,
		label: labels.installButton,
		interactive: true,
		clickable: true,
		cursor: 'pointer',
		anchor: [0.5],
	}, onResizeHandler, true);
	const elementButtonInstall = buttonInstall.getElement();
	
	elementButtonInstall.position.set(
		elementButtonInstall.width / 2 + 10,
		app.renderer.height - elementButtonInstall.height / 2,
	);
	
	gsap.to(elementButtonInstall.scale, {
		duration: 0.6,
		x: 1.05,
		y: 1.05,
		ease: 'power1.inOut',
		yoyo: true,
		repeat: -1
	});
	
	function onResizeHandler() {
		elementButtonInstall.position.set(
			elementButtonInstall.width / 2 + 10,
			app.renderer.height - elementButtonInstall.height / 2,
		);
	}
	
	return elementButtonInstall;
}
