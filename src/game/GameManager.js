import { gsap } from 'gsap';

import { labels } from '../common/enums.js';
import { getUIElement } from '../helpers/index.js';
import { eventBus } from '../utils/EventBus.js';
import { soundManager } from '../utils/SoundManager.js';

export class GameManager {
	constructor(app) {
		this.app = app;

		// Инициализация UI элементов
		this.gameContainer = getUIElement(this.app.stage, labels.game);
		this.resourceBar = getUIElement(this.gameContainer, labels.resourceBars);
		this.resourceBarMoney = getUIElement(this.resourceBar, labels.moneyBar);
		this.coinBar = getUIElement(this.resourceBarMoney, `${labels.moneyBar}Element`);
		this.goblins = getUIElement(this.gameContainer, labels.goblins);
		this.chests =  getUIElement(this.gameContainer, labels.chests);
		this.mine =   getUIElement(this.gameContainer, labels.mine);

		this.initializeDraggableGoblins();

		// Подписка на события EventBus
		eventBus.on('toggleSound', this.toggleSound);

		// Добавление обработчиков
	}

	initializeDraggableGoblins() {
		this.goblins.children.forEach(goblin => {
			const sprite = getUIElement(goblin, labels.goblin);
			if (sprite) this.makeDraggable(sprite);
		});
	}

	makeDraggable(sprite) {
		let isDragging = false;
		let offset = { x: 0, y: 0 };
		let originalPosition = { x: sprite.x, y: sprite.y };

		sprite.on('pointerdown', event => {
			isDragging = true;
			offset.x = event.global.x - sprite.x;
			offset.y = event.global.y - sprite.y;
			originalPosition = { x: sprite.x, y: sprite.y };

			// goblinContainer zIndex:
			const goblinContainer = sprite.parent;
			this.goblins.setChildIndex(goblinContainer, this.goblins.children.length - 1);

			this.toggleShadows(null, false);
			this.toggleShadows(sprite, true);
			sprite.stop();
		});

		sprite.on('pointermove', event => {
			if (!isDragging) return;

			let newX = event.global.x - offset.x;
			let newY = event.global.y - offset.y;

			sprite.position.set(newX, newY);
		});

		const stopDragging = () => {
			isDragging = false;

			// Проверка на ближайший слот
			const slots = this.getSlots(sprite.typeGoblin);
			const snapSlot = this.getClosestSlot(sprite, slots);
			if (snapSlot) {
				const global = snapSlot.getGlobalPosition();
				const parent = sprite.parent;
				const local = parent.toLocal(global);
				sprite.position.set(local.x, local.y);
				sprite.destroy({ once: true });
			} else {
				sprite.play();
				gsap.to(sprite.position, {
					x: originalPosition.x,
					y: originalPosition.y,
					duration: 0.3,
					ease: 'power2.out',
				});
			}

			this.toggleShadows(null, false);
		};

		sprite.on('pointerup', stopDragging);
		sprite.on('pointerupoutside', stopDragging);
	}

	getClosestSlot(sprite, slots) {
		if (!slots?.length) return null;

		const spritePos = sprite.getGlobalPosition();
		let closest = null;
		let minDist = 150;

		for (const slot of slots) {
			if (!slot || slot === sprite) continue;
			const slotPos = slot.getGlobalPosition();

			const dx = spritePos.x - slotPos.x;
			const dy = spritePos.y - slotPos.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < minDist) {
				minDist = dist;
				closest = slot;
			}
		}

		return closest;
	}

	getSlots(typeGoblin) {
		return this.goblins.children
			.map(goblin => getUIElement(goblin, labels.goblin))
			.filter(slot => slot && slot.typeGoblin === typeGoblin);
	}

	toggleShadows(sprite, visible = true) {
		const goblins = this.goblins.children.filter(goblin => {
			const goblinSprite = getUIElement(goblin, labels.goblin);
			return (
				goblinSprite &&
				(!sprite ||
					(goblinSprite !== sprite &&
						goblinSprite.typeGoblin === sprite.typeGoblin))
			);
		});

		goblins.forEach(goblin => {
			const shadow = getUIElement(goblin, labels.shadow);
			if (shadow) {
				gsap.to(shadow.scale, {
					x: visible ? 1 : 0,
					y: visible ? 1 : 0,
					duration: 0.1,
					ease: 'power1.inOut',
				});
			}
		});
	}

	toggleSound = () => {
		const isMuted = soundManager.toggleMute();
	};
}
