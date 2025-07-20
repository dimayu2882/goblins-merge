import { allTextureKeys } from '../common/assets.js';
import { getByLabel } from '../helpers/index.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';
import { createGoblin } from './index.js';

export default function createGoblins(app, resourceBar) {
	const goblins = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.goblins,
		sortableChildren: true
	}, onResizeHandler, true);
	const elementGoblins = goblins.getElement();
	
	const coin = getByLabel(resourceBar, `${labels.moneyBar}Element`);
	const coinPosition = coin.getGlobalPosition();
	
	const coinCount = getByLabel(resourceBar, `${labels.moneyBar}Text`);
	
	const goblinOne = createGoblin(
		app,
		labels.goblinOne,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreOne,
		false,
		labels.goblinOne,
		coinPosition,
		coinCount
	);
	
	const goblinTwo = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreTwo,
		false,
		labels.goblinOne,
		coinPosition,
		coinCount
	);
	
	const goblinTree = createGoblin(
		app,
		labels.goblinOne,
		allTextureKeys.pickaxeJson,
		allTextureKeys.oreTwo,
		true,
		labels.goblinOne,
		coinPosition,
		coinCount
	);
	
	const goblinFour = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		allTextureKeys.oreOne,
		true,
		labels.goblinTwo,
		coinPosition,
		coinCount
	);
	
	const goblinFive = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		allTextureKeys.oreFour,
		false,
		labels.goblinTwo,
		coinPosition,
		coinCount
	);
	
	const goblinSix = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		allTextureKeys.oreFour,
		true,
		labels.goblinTwo,
		coinPosition,
		coinCount
	);
	
	goblins.addChildren([goblinOne, goblinTwo, goblinTree, goblinFour, goblinFive, goblinSix]);
	setPosition();
	
	function setPosition() {
		goblinOne.position.set(app.renderer.width / 1.5, app.renderer.height / 5);
		goblinTwo.position.set(app.renderer.width / 1.3, app.renderer.height / 1.5);
		goblinTree.position.set(goblinOne.width / 2, app.renderer.height / 1.5);
		goblinFour.position.set(goblinFour.width / 2, app.renderer.height / 2.5);
		goblinFive.position.set(app.renderer.width / 1.3, app.renderer.height / 2.2);
		goblinSix.position.set(app.renderer.width / 4, app.renderer.height / 5);
	}
	
	function onResizeHandler() {
		setPosition();
	}
	return elementGoblins;
}
