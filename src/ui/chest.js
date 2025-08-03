import { gsap } from 'gsap';
import { isMobile, Sprite, Texture } from 'pixi.js';

import { allTextureKeys } from '../common/assets.js';
import { eventBus } from '../utils/EventBus.js';
import { PixiElement } from '../utils/PixiElement.js';
import { elementType, labels } from '../common/enums.js';
import { launchElementToTarget } from '../utils/utils.js';

export default function createChest(app, label, sprite, spriteOpen, coinPosition,
	coinCount, gemPosition, gemCount, curePosition, cureCount) {
	const container = new PixiElement({
		type: elementType.CONTAINER,
		label: labels.chest,
		interactive: true,
		evenMode: 'static',
		cursor: 'pointer',
		visible: false,
	}, onResizeHandler, true);
	const elementContainer = container.getElement();
	
	const chest = new PixiElement({
		type: elementType.SPRITE,
		label: labels.chest,
		texture: sprite,
		animationSpeed: 0.5,
		anchor: [0.5, 1]
	});
	const elementChest = chest.getElement();
	
	const chestOpen = new PixiElement({
		type: elementType.SPRITE,
		label: labels.chestOpen,
		texture: spriteOpen,
		animationSpeed: 0.5,
		anchor: [0.5, 1],
		visible: false
	});
	const elementChestOpen = chestOpen.getElement();
	
	const coin = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.coin,
		label: labels.coin,
		visible: false,
		anchor: [0.5]
	});
	const elementCoin = coin.getElement();
	
	const gem = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.gem,
		label: labels.gem,
		visible: false,
		anchor: [0.5]
	});
	const elementGem = gem.getElement();
	
	const cure = new PixiElement({
		type: elementType.SPRITE,
		texture: allTextureKeys.cure,
		label: labels.cure,
		visible: false,
		anchor: [0.5]
	});
	const elementCure = cure.getElement();
	
	container.addChildren([elementChest, elementChestOpen, elementCoin, elementGem, elementCure]);
	
	gsap.to(elementChest.scale, {
		duration: 0.6,
		x: 1.05,
		y: .9,
		ease: 'power1.inOut',
		yoyo: true,
		repeat: -1
	});
	
	elementContainer.addEventListener('pointerdown', () => {
		elementChest.visible = false;
		elementChestOpen.visible = true;
		launchMultipleElements(
			20,
			allTextureKeys.coin,
			elementContainer,
			coinPosition,
			coinCount
		);
		launchMultipleElements(
			20,
			allTextureKeys.gem,
			elementContainer,
			gemPosition,
			gemCount
		);
		launchMultipleElements(
			20,
			allTextureKeys.cure,
			elementContainer,
			curePosition,
			cureCount,
			() => {
				hideChest();
				eventBus.emit('chestAnimationComplete');
			}
		);
	});
	
	function launchMultipleElements(count = 30, texture, container, targetPosition, countText, onComplete) {
		let completed = 0;
		for (let i = 0; i < count; i++) {
			setTimeout(() => {
				const clone = new Sprite(Texture.from(texture));
				clone.anchor.set(0.5);
				clone.position.set(elementChest.width / 7, -elementChest.height / 2);
				container.addChild(clone);
				
				launchElementToTarget(clone, app, targetPosition, countText, () => {
					completed++;
					if (completed === count) {
						if (onComplete) onComplete();
					}
				});
			}, i * 100);
		}
	}
	
	function hideChest() {
		gsap.to(elementChestOpen, {
			alpha: 0,
			duration: 0.5,
			ease: 'power1.in',
			onComplete: () => {
				elementChestOpen.visible = false;
			}
		});
	}
	
	function setPosition() {
		if (app.renderer.width < 630 || isMobile.phone ) {
			elementContainer.scale.set(0.5);
		} else {
			elementContainer.scale.set(1);
		}
	}
	setPosition();
	
	function onResizeHandler() {
		setPosition();
	}
	
	return elementContainer;
}
