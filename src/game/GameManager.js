import { gsap } from 'gsap';

import { labels } from '../common/enums.js';
import { getByLabel, getUIElement } from '../helpers/index.js';
import { eventBus } from '../utils/EventBus.js';
import { gameState } from './GameState.js';

export class GameManager {
	constructor(app) {
		this.app = app;

		// Инициализация UI элементов
		this.gameContainer = getUIElement(this.app.stage, labels.game);
		this.goblins = getUIElement(this.gameContainer, labels.goblins);
		this.chests = getUIElement(this.gameContainer, labels.chests);
		this.mine = getUIElement(this.gameContainer, labels.mine);
		this.smokeMine = getUIElement(this.mine, labels.smoke);
		this.resourceBar = getUIElement(this.gameContainer, labels.resourceBars);
		this.coin = getByLabel(this.resourceBar, `${labels.moneyBar}Element`);
		this.coinCount = getByLabel(this.resourceBar, `${labels.moneyBar}Text`);
		this.textMerge = getUIElement(this.gameContainer, labels.textMerge);

		this.initializeDraggableGoblins();

		// Подписка на события EventBus
		eventBus.on('clickMine', this.activeMine);

		// Добавление обработчиков
		this.mine.on('pointerdown', () => eventBus.emit('clickMine'));
	}
	
	initializeDraggableGoblins = () => {
		this.goblins.children.forEach(container => {
			const { typeGoblin } = container;
			const sprite = getUIElement(container, labels.goblin);
			this.makeDraggable(sprite);
			if (typeGoblin === labels.goblinTwo) sprite.stop();
		});
	};
	
	makeDraggable = (sprite) => {
		const goblinsContainer = this.goblins;
		let isDragging = false;
		let offset = { x: 0, y: 0 };
		let originalPosition = { x: sprite.x, y: sprite.y };
		
		sprite.on('pointerdown', event => {
			isDragging = true;
			offset.x = event.global.x - sprite.x;
			offset.y = event.global.y - sprite.y;
			originalPosition = { x: sprite.x, y: sprite.y };
			
			const parent = sprite.parent;
			goblinsContainer.setChildIndex(parent, goblinsContainer.children.length - 1);
			
			this.toggleShadows(null, false);
			this.toggleShadows(sprite, true);
			sprite.stop();
		});
		
		sprite.on('pointermove', event => {
			if (!isDragging) return;
			sprite.position.set(event.global.x - offset.x, event.global.y - offset.y);
		});
		
		const stopDragging = () => {
			isDragging = false;
			this.handleDrop(sprite, originalPosition);
		};
		
		sprite.on('pointerup', stopDragging);
		sprite.on('pointerupoutside', stopDragging);
	};
	
	handleDrop = (sprite, originalPosition) => {
		const type = sprite.parent.typeGoblin;
		const goblinSprites = this.getSlots(type);
		const closest = this.findClosestSameType(sprite, goblinSprites);
		
		if (closest) {
			const targetPos = closest.getGlobalPosition();
			const targetGoblin = goblinSprites.find(g => g === closest);
			const animatingGoblins = goblinSprites.filter(g => g !== closest);
			
			if (gameState.getGameState() === labels.gameSceneMove) {
				this.animateGoblinsToPoint({
					goblins: animatingGoblins,
					targetPos,
					draggedGoblin: sprite,
					originalPosition,
					onEachComplete: goblin => this.mergeGoblins(goblin, targetGoblin)
				});
			} else {
				const center = this.app.stage.toGlobal({
					x: this.app.renderer.width / 2,
					y: this.app.renderer.height / 2
				});
				
				this.animateGoblinsToPoint({
					goblins: goblinSprites,
					targetPos: center,
					draggedGoblin: sprite,
					originalPosition,
					onAllComplete: () => this.activeScene()
				});
			}
		} else {
			sprite.play();
			gsap.to(sprite.position, {
				x: originalPosition.x,
				y: originalPosition.y,
				duration: 0.3,
				ease: 'power2.out'
			});
		}
		
		this.toggleShadows(null, false);
	};
	
	animateGoblinsToPoint = ({ goblins, targetPos, draggedGoblin, originalPosition, onEachComplete, onAllComplete }) => {
		const timeline = gsap.timeline({ onComplete: () => onAllComplete?.() });
		
		goblins.forEach((goblin) => {
			const parent = goblin.parent;
			const localTarget = parent.toLocal(targetPos);
			const original = goblin === draggedGoblin ? originalPosition : goblin.position.clone();
			
			const tl = gsap.timeline();
			
			tl.to(goblin.position, {
				x: localTarget.x,
				y: localTarget.y,
				duration: 0.35,
				ease: 'power2.out',
				onStart: () => goblin.play?.(),
				onComplete: () => {
					goblin.stop();
					onEachComplete?.(goblin);
				}
			});
			
			tl.to(goblin, { alpha: 0, duration: 0.3, ease: 'power1.out' });
			tl.to(goblin.position, { x: original.x, y: original.y, duration: 0.3 });
			
			timeline.add(tl, 0);
		});
	};
	
	mergeGoblins = (goblin, targetGoblin) => {
		goblin.stop();
		goblin.parent.visible = false;
		
		const upgradeSprite = targetGoblin.parent.children.find(ch => ch.label === labels.upgradeGoblin);
		upgradeSprite.visible = true;
		targetGoblin.visible = false;
		upgradeSprite.play();
	};
	
	findClosestSameType = (sprite, candidates, maxDist = 150) => {
		const pos = sprite.getGlobalPosition();
		let closest = null, min = maxDist;
		for (const other of candidates) {
			if (other === sprite) continue;
			const d = Math.hypot(pos.x - other.getGlobalPosition().x, pos.y - other.getGlobalPosition().y);
			if (d < min) { min = d; closest = other; }
		}
		return closest;
	};
	
	getSlots = typeGoblin => {
		return this.goblins.children
			.filter(container => container.typeGoblin === typeGoblin)
			.map(container => getUIElement(container, labels.goblin));
	};
	
	toggleShadows = (sprite, visible = true) => {
		this.filteredGoblinsByType(sprite)
			.map(g => getUIElement(g, labels.shadow))
			.filter(Boolean)
			.forEach(shadow => {
				gsap.to(shadow.scale, {
					x: visible ? 1 : 0,
					y: visible ? 1 : 0,
					duration: 0.1
				});
			});
	};
	
	filteredGoblinsByType = sprite => {
		return this.goblins.children.filter(container => {
			if (!sprite) return true;
			return container !== sprite.parent && container.typeGoblin === sprite.parent.typeGoblin;
		});
	};
	
	activeMine = () => {
		this.smokeMine.visible = true;
		this.smokeMine.gotoAndPlay(0);
		this.smokeMine.onComplete = () => this.smokeMine.visible = false;

		gsap.fromTo(
			this.mine.scale,
			{ x: 1, y: 1 },
			{
				x: 1.1,
				y: 0.9,
				duration: 0.1,
				yoyo: true,
				repeat: 2,
				ease: 'power1.inOut'
			}
		);

		this.checkActiveElements();
	};
	
	activeScene = () => {
		gsap.to(this.textMerge, {
			alpha: 0,
			duration: 0.4,
			ease: 'power1.out'
		});
		
		this.mine.visible = true;
		this.mine.alpha = 0;
		this.mine.scale.set(0);
		
		gsap.to(this.mine.scale, {
			x: 1,
			y: 1,
			duration: 0.4,
			ease: 'back.out(2)'
		});
		
		gsap.to(this.mine, {
			alpha: 1,
			duration: 0.4,
			ease: 'power1.out'
		});
		
		gsap.to(this.mine.position, {
			x: this.mine.position.x + 5,
			duration: 0.05,
			yoyo: true,
			repeat: 5,
			ease: 'sine.inOut',
			onComplete: () => {
				gsap.set(this.mine.position, { x: this.mine.position.x - 5 });
				
				this.showAllElements({
					container: this.goblins,
					onEachStart: (container) => {
						const sprite = getUIElement(container, labels.goblin);
						sprite.alpha = 0;
					},
					afterTween: (container) => {
						const sprite = getUIElement(container, labels.goblin);
						sprite.play();
						sprite.alpha = 1;
						gameState.setGameState(labels.gameSceneMove);
					}
				});
				
				this.showAllElements({ container: this.chests });
			}
		});
	};

	showAllElements = (
		{ container,
			onEachStart = () => {},
			afterTween = () => {}
		}) => {
		const center = {
			x: this.app.renderer.width / 2,
			y: this.app.renderer.height / 2
		};

		const centerLocal = container.toLocal(center);

		container.children.forEach((element) => {
			element.visible = true;

			const target = { x: element.x, y: element.y };
			element.position.set(centerLocal.x, centerLocal.y);

			onEachStart(element);

			gsap.to(element.position, {
				x: target.x,
				y: target.y,
				duration: 0.6,
				ease: 'back.out(2)',
				onComplete: () => afterTween(element)
			});
		});
	};
	
	checkActiveElements = () => {
		const disabledChest = this.chests.children.find(chest => !getUIElement(chest, labels.chest)?.visible);
		
		if (disabledChest) {
			getUIElement(disabledChest, labels.chest).visible = true;
			getUIElement(disabledChest, labels.chestOpen).alpha = 1;
			disabledChest.visible = true;
		} else {
			const container = this.goblins.children.find(c => !c.visible);
			if (container) {
				container.visible = true;
				container.alpha = 1;
				const goblin = getUIElement(container, labels.goblin);
				goblin.alpha = 1;
				goblin.play();
			}
		}
	};
}
