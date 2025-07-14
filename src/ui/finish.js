import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';

export default function createSceneFinish(app) {
	const sceneFinish = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.sceneFinish,
		visible: false,
	}, onResizeHandler, true);
	const elementSceneFinish = sceneFinish.getElement();
	
	function setElementsPosition() {
	}
	
	setElementsPosition();
	
	function onResizeHandler() {
		setElementsPosition();
	}

	return elementSceneFinish;
}
