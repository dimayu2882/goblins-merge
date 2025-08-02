import { gsap } from 'gsap';
import { BlurFilter, Graphics, isMobile } from 'pixi.js';

import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createSceneFinish(app) {
	const scene = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.sceneFinish,
		visible: false,
	}, onResizeHandler, true);
	const elementScene = scene.getElement();
	
	const logo = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.logo,
		anchor: [0.5]
	});
	const elementLogo = logo.getElement();
	
	const button = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.getProfit,
		anchor: [0.5],
		interactive: true,
		evenMode: 'static',
		cursor: 'pointer'
	});
	const elementButton = button.getElement();
	
	const elementBg = new Graphics();

	elementBg.fill({ color: 0xcecece, alpha: 0.7 });
	elementBg.rect(0, 0, app.renderer.width, app.renderer.height);
	elementBg.fill();
	elementBg.eventMode = 'static';

	const blurFilter = new BlurFilter();
	blurFilter.strength = 4;

	elementBg.filters = [blurFilter];
	
	scene.addChildren([ elementBg, elementLogo, elementButton]);
	
	function setPosition() {
		const centerX = app.renderer.width / 2;
		const spacing = 20;
		
		const totalHeight = elementLogo.height + spacing + elementButton.height;
		const startY = (app.renderer.height - totalHeight) / 2;
		
		elementLogo.position.set(centerX, startY + elementLogo.height / 2);
		elementButton.position.set(centerX, elementLogo.position.y + elementLogo.height / 2 + spacing + elementButton.height / 2);
		
		elementBg.clear();
		elementBg.fill({ color: 0xCCCCCC, alpha: 0.5 });
		elementBg.rect(0, 0, app.renderer.width, app.renderer.height);
		elementBg.fill();
		elementBg.eventMode = 'static';
		
		if (app.renderer.width < 630 || isMobile.phone ) {
			elementLogo.scale.set(0.5);
			elementButton.scale.set(0.5);
			
			gsap.to(elementButton.scale, {
				x: 0.6,
				y: 0.6,
				duration: 0.5,
				yoyo: true,
				repeat: -1,
				ease: 'sine.inOut',
			});
		} else {
			elementLogo.scale.set(1);
			elementButton.scale.set(1);
			
			gsap.to(elementButton.scale, {
				x: 1.1,
				y: 1.1,
				duration: 0.5,
				yoyo: true,
				repeat: -1,
				ease: 'sine.inOut',
			});
		}
	}
	
	function onResizeHandler() {
		setPosition();
	}
	
	setPosition();
	
	
	return elementScene;
}
