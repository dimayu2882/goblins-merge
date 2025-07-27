import { allTextureKeys } from '../common/assets.js';
import { getByLabel } from '../helpers/index.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';
import createChest from './chest.js';

export default function createChests(app, resourceBar) {
	const chests = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.chests,
	}, onResizeHandler, true);
	const elementChests = chests.getElement();
	
	const coin = getByLabel(resourceBar, `${labels.moneyBar}Element`);
	const getCoinPosition = () => coin.getGlobalPosition();
	const coinCount = getByLabel(resourceBar, `${labels.moneyBar}Text`);
	
	const gem = getByLabel(resourceBar, `${labels.diamondBar}Element`);
	const getGemPosition = () => gem.getGlobalPosition();
	const gemCount = getByLabel(resourceBar, `${labels.diamondBar}Text`);
	
	const cure = getByLabel(resourceBar, `${labels.potionBar}Element`);
	const getCurePosition = () => cure.getGlobalPosition();
	const cureCount = getByLabel(resourceBar, `${labels.potionBar}Text`);
	
	const chestOne = createChest(
		app,
		labels.chest,
		allTextureKeys.woodenChestClosed,
		allTextureKeys.woodenChestOpen,
		getCoinPosition,
		coinCount,
		getGemPosition,
		gemCount,
		getCurePosition,
		cureCount
	);
	
	const chestTwo = createChest(
		app,
		labels.chest,
		allTextureKeys.ironChestClosed,
		allTextureKeys.ironChestOpen,
		getCoinPosition,
		coinCount,
		getGemPosition,
		gemCount,
		getCurePosition,
		cureCount
	);
	
	const chestTree = createChest(
		app,
		labels.chest,
		allTextureKeys.goldenChestClosed,
		allTextureKeys.goldenChestOpen,
		getCoinPosition,
		coinCount,
		getGemPosition,
		gemCount,
		getCurePosition,
		cureCount
	);
	
	chests.addChildren([chestOne, chestTwo, chestTree]);
	setPosition();
	
	function setPosition() {
		chestOne.position.set(app.renderer.width / 2, app.renderer.height / 5);
		chestTwo.position.set(app.renderer.width / 8, app.renderer.height / 3);
		chestTree.position.set(app.renderer.width / 2, app.renderer.height / 1.1);
	}
	
	function onResizeHandler() {
		setPosition();
	}
	return elementChests;
}
