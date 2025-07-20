import { allTextureKeys } from '../common/assets.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';
import { launchElementToTarget } from '../utils/utils.js';

export default function createGoblin(app, label, goblinSprite, oreSprite, left, typeGoblin, coinPosition, coinCount) {
	const container = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.goblinContainer,
	});
	const elementContainer = container.getElement();
	
	const goblin = new PixiElement({
		type: elementType.ANIMATED_SPRITE,
		label: labels.goblin,
		texture: goblinSprite,
		animationSpeed: 0.5,
		anchor: [0.5],
		interactive: true,
		evenMode: 'static',
		cursor: 'grab',
	});
	const elementGoblin = goblin.getElement();
	elementGoblin.typeGoblin = typeGoblin;
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
	
	const shadow = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.shineGold,
		label: labels.shadow,
		anchor: [0.5],
		scale: [0]
	});
	const elementShadow = shadow.getElement();
	
	container.addChildren([elementShadow, elementCore, elementGoblin, elementCoin]);
	
	if (left) {
		elementGoblin.scale.set(-1, 1);
		elementGoblin.pivot.x = elementGoblin.width / 2;
		elementCore.position.set(-elementGoblin.width / 5, -10);
		elementShadow.position.set(elementGoblin.x + elementGoblin.width / 2, elementGoblin.y);
		elementCoin.position.set(elementGoblin.width / 7, -10);
	} else {
		elementCore.position.set(elementGoblin.width / 7, -10);
		elementShadow.position.set(elementGoblin.x, elementGoblin.y);
		elementCoin.position.set(elementGoblin.width / 7, -10);
	}
	
	// Coin launch
	elementGoblin.onFrameChange = (currentFrame) => {
		if (currentFrame === 5) launchElementToTarget(elementCoin, app, coinPosition, coinCount);
	};
	
	return elementContainer;
}
