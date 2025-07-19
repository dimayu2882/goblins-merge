import { gsap } from 'gsap';

import { allTextureKeys } from '../common/assets.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';

export default function createGoblin(app, label, goblinSprite, oreSprite, left, coinPosition) {
	const container = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.goblinContainer,
	});
	const elementContainer = container.getElement();
	
	const goblin = new PixiElement({
		type: elementType.ANIMATED_SPRITE,
		label: label,
		texture: goblinSprite,
		animationSpeed: 0.5,
		anchor: [0.5],
		interactive: true,
		evenMode: 'dynamic',
		cursor: 'grab'
	});
	const elementGoblin = goblin.getElement();
	elementGoblin.gotoAndPlay(Math.floor(Math.random() * 30));
	
	const core = new PixiElement({
		type: elementType.SPRITE,
		texture: oreSprite,
		label: labels.ore,
	});
	const elementCore = core.getElement();
	
	const coin = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.coin,
		label: labels.coin,
		visible: false,
		anchor: [0.5],
	});
	const elementCoin = coin.getElement();
	
	if (left) elementContainer.scale.set(-1, 1);
	elementCore.position.set(elementGoblin.width / 7, -10);
	container.addChildren([elementCore, elementGoblin, elementCoin]);
	
	
	elementGoblin.onFrameChange = (currentFrame) => {
		if (currentFrame === 5) launchCoinToTarget(elementCoin, app);
	};
	
	function launchCoinToTarget(coin, app) {
		const globalStart = coin.getGlobalPosition();
		const end = coinPosition;
		
		const parent = coin.parent;
		
		// Переместим в stage на время полёта
		app.stage.addChild(coin);
		coin.position.set(globalStart.x, globalStart.y);
		coin.visible = true;
		
		gsap.to(coin, {
			x: end.x,
			y: end.y,
			duration: 0.7,
			ease: 'power2.inOut',
			onComplete: () => {
				parent.addChild(coin);
				coin.visible = false;
				coin.position.set(elementGoblin.width / 7, -10);
			}
		});
	}
	
	return elementContainer;
}
