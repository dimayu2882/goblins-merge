import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';
import { createResourceBar } from './index.js';

export default function createResourceBars(app) {
	const resourceBars = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.resourceBars,
	}, onResizeHandler, true);
	const elementResourceBars = resourceBars.getElement();
	
	const resourceBarMoney = createResourceBar(app, labels.moneyBar, allTextureKeys.coin);
	const resourceBarDiamond = createResourceBar(app, labels.diamondBar, allTextureKeys.gem);
	const resourceBarCure = createResourceBar(app, labels.potionBar, allTextureKeys.cure);
	
	resourceBars.addChildren([resourceBarMoney, resourceBarDiamond, resourceBarCure]);
	
	function setPositions() {
		resourceBarDiamond.position.set(resourceBarMoney.width + 10, 0);
		resourceBarCure.position.set(resourceBarMoney.width * 2 + 20, 0);
		elementResourceBars.pivot.set(elementResourceBars.width / 2, elementResourceBars.height / 2);
		elementResourceBars.position.set(app.renderer.width / 2, elementResourceBars.height / 2 + 10);
	}
	setPositions();
	
	function onResizeHandler() {
		setPositions();
	}
	
	return elementResourceBars;
}
