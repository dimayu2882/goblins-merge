import { PixiElement } from '../utils/PixiElement.js';
import { elementType } from '../common/enums.js';

export default function createResourceBar(app, label, sprite) {
	const resourceBar = new PixiElement({
		type: elementType.CONTAINER,
		label: label,
		scale: [2]
	});
	const elementResourceBar = resourceBar.getElement();
	
	const resourceBarBg = new PixiElement({
		type: elementType.GRAPHICS,
		label: label,
		roundRect: [0, 0, 200, 45],
		fill: 0x000000,
	});
	const elementResourceBarBg = resourceBarBg.getElement();
	
	const resourceSprite = new PixiElement({
		type: elementType.SPRITE,
		texture: sprite,
		label: `${label}Element`,
		anchor: [0.5],
	});
	const elementResourceSprite = resourceSprite.getElement();
	
	const resourceScore = new PixiElement({
		type: elementType.TEXT,
		text: '0',
		label: `${label}Text`,
		anchor: [0, 0.5],
		style: {
			fill: 0xffffff,
			fontFamily: 'Arial',
			fontSize: 40,
			fontWeight: 'bold',
			align: 'center',
		}
	});
	const elementResourceScore = resourceScore.getElement();
	
	resourceBar.addChildren([elementResourceBarBg, elementResourceSprite, elementResourceScore]);
	
	elementResourceSprite.position.set(elementResourceSprite.width / 2 + 5, elementResourceBarBg.height / 2);
	elementResourceScore.position.set(elementResourceSprite.width + 30, elementResourceBarBg.height / 2);
	
	return elementResourceBar;
}
