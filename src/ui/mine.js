import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createMine(app) {
	const container = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.mine,
		interactive: true,
		clickable: true,
		cursor: 'pointer',
		visible: false,
	},onResizeHandler, true);
	const elementContainer = container.getElement();
	
	const mine = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.mine,
		label: 'sprite',
		anchor: [0.5],
		scale: [2]
	});
	const elementMine = mine.getElement();
	
	const smoke = new PixiElement({
		type: elementType.ANIMATED_SPRITE,
		label: labels.smoke,
		texture: allTextureKeys.smokeJson,
		animationSpeed: 0.6,
		loop: false,
		anchor: [0.5],
		alpha: 0.4,
		visible: false,
		scale: [2]
	});
	const elementSmoke = smoke.getElement();
	
	container.addChildren([elementMine, elementSmoke]);
	
	function setPosition() {
		elementContainer.position.set(app.renderer.width / 2, app.renderer.height / 2);
	}
	
	setPosition();
	
	function onResizeHandler() {
		setPosition();
	}
	
	return elementContainer;
}
