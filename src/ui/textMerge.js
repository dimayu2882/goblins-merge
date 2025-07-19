import { PixiElement } from '../utils/PixiElement.js';
import { allTextureKeys } from '../common/assets.js';
import { elementType, labels } from '../common/enums.js';

export default function createTextMerge(app) {
	const label = new PixiElement({
		type: elementType.TEXT,
		label: labels.textMerge,
		anchor: [0.5],
		position: [app.renderer.width / 2, app.renderer.height / 2],
		text: 'merge'.toUpperCase(),
		style: {
			fill: 0xffffff,
			fontFamily: 'Arial',
			fontSize: 64,
			fontWeight: 'bold',
			align: 'center',
		}
	}, onResizeHandler, true);
	const elementLabel = label.getElement();
	
	function onResizeHandler() {
		elementLabel.position.set(app.renderer.width / 2, app.renderer.height / 2);
	}
	
	return elementLabel;
}
