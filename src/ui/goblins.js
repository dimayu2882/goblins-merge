import { allTextureKeys } from '../common/assets.js';
import { getByLabel } from '../helpers/index.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';
import { createGoblin } from './index.js';

export default function createGoblins(app, resourceBar) {
	const goblins = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.goblins
	});
	const elementGoblins = goblins.getElement();
	
	const coin = getByLabel(resourceBar, `${labels.moneyBar}Element`);
	const coinPosition = coin.getGlobalPosition();
	console.log(coinPosition);
	
	const goblinOne = createGoblin(
		app,
		labels.goblinOne,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreOne,
		false,
		coinPosition
	);
	
	const goblinTwo = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreTwo,
		false,
		coinPosition
	);
	
	const goblinTree = createGoblin(
		app,
		labels.goblinThree,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreTwo,
		true,
		coinPosition
	);
	
	goblinOne.position.set(app.renderer.width - goblinOne.width, app.renderer.height / 3);
	goblinTwo.position.set(app.renderer.width / 1.3, app.renderer.height / 1.5);
	goblinTree.position.set(goblinOne.width, app.renderer.height / 5);
	
	goblins.addChildren([goblinOne, goblinTwo, goblinTree]);
	return elementGoblins;
}
