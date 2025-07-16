import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createFinger() {
	const finger = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.hand,
		label: labels.finger,
		interactive: false,
		anchor: [0.5],
		visible: false,
	});
	
	return finger.getElement();
}
