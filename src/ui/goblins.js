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
	const getCoinPosition = () => coin.getGlobalPosition();
	
	const coinCount = getByLabel(resourceBar, `${labels.moneyBar}Text`);
	
	const goblinOne = createGoblin(
		app,
		labels.goblinOne,
		allTextureKeys.pickaxeJson,
		true,
		allTextureKeys.oreOne,
		false,
		labels.goblinOne,
		getCoinPosition,
		coinCount
	);
	
	const goblinTwo = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.pickaxeJson,
		true,
		allTextureKeys.oreTwo,
		false,
		labels.goblinOne,
		getCoinPosition,
		coinCount
	);
	
	const goblinTree = createGoblin(
		app,
		labels.goblinOne,
		allTextureKeys.pickaxeJson,
		true,
		allTextureKeys.oreTwo,
		true,
		labels.goblinOne,
		getCoinPosition,
		coinCount
	);
	
	const goblinFour = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		false,
		allTextureKeys.oreOne,
		true,
		labels.goblinTwo,
		getCoinPosition,
		coinCount
	);
	
	const goblinFive = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		false,
		allTextureKeys.oreFour,
		false,
		labels.goblinTwo,
		getCoinPosition,
		coinCount
	);
	
	const goblinSix = createGoblin(
		app,
		labels.goblinTwo,
		allTextureKeys.siedgeHammerJson,
		false,
		allTextureKeys.oreFour,
		true,
		labels.goblinTwo,
		getCoinPosition,
		coinCount
	);
	
	goblins.addChildren([goblinOne, goblinTwo, goblinTree, goblinFour, goblinFive, goblinSix]);
	setPosition();
	
	function setPosition() {
		goblinOne.position.set(app.renderer.width / 1.5, app.renderer.height / 5);
		goblinTwo.position.set(app.renderer.width / 1.3, app.renderer.height / 1.5);
		goblinTree.position.set(goblinOne.width / 1.5, app.renderer.height / 1.5);
		goblinFour.position.set(goblinFour.width / 1.5, app.renderer.height / 2.5);
		goblinFive.position.set(app.renderer.width / 1.3, app.renderer.height / 2.2);
		goblinSix.position.set(app.renderer.width / 4, app.renderer.height / 6);
	}
	
	function onResizeHandler() {
		setPosition();
	}
	return elementGoblins;
}
