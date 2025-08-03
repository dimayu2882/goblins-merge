import { gsap } from 'gsap';
import { isMobile } from 'pixi.js';

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
	
	function setPosition() {
		if (app.renderer.width < 630 || isMobile.phone ) {
			elementButtonInstall.scale.set(0.5);
			elementButtonInstall.position.set(elementButtonInstall.width / 2 + 10, app.renderer.height - elementButtonInstall.height / 2);
			gsap.to(elementButtonInstall.scale, {
				duration: 0.6,
				x: 0.6,
				y: 0.6,
				ease: 'power1.inOut',
				yoyo: true,
				repeat: -1
			});
		} else {
			elementButtonInstall.scale.set(1);
			elementButtonInstall.position.set(elementButtonInstall.width / 2 + 10, app.renderer.height - elementButtonInstall.height / 2);
			gsap.to(elementButtonInstall.scale, {
				duration: 0.6,
				x: 1.1,
				y: 1.1,
				ease: 'power1.inOut',
				yoyo: true,
				repeat: -1
			});
		}
	}
	setPosition();
	
	function onResizeHandler() {
		setPosition();
	}
	
	return elementButtonInstall;
}
