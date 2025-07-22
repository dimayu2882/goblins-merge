import { gsap } from 'gsap';
import { Assets, Sprite } from 'pixi.js';

import { allTextureKeys } from '../common/assets.js';
import { labels } from '../common/enums.js';
import { getByLabel, getUIElement } from '../helpers/index.js';
import { eventBus } from '../utils/EventBus.js';
import { launchElementToTarget } from '../utils/utils.js';
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
		this.goblins.children.forEach(goblin => {
			const sprite = getUIElement(goblin, labels.goblin);
			this.makeDraggable(sprite);

			if (sprite.typeGoblin === labels.goblinTwo) sprite.stop();
		});
	};
	
	makeDraggable = (sprite) => {
		const goblinsContainer = this.goblins;
		
		let isDragging = false;
		let offset = { x: 0, y: 0 };
		let originalPosition = { x: sprite.x, y: sprite.y };
		
		const onPointerDown = (event) => {
			isDragging = true;
			
			offset = {
				x: event.global.x - sprite.x,
				y: event.global.y - sprite.y
			};
			
			originalPosition = { x: sprite.x, y: sprite.y };
			
			const parent = sprite.parent;
			goblinsContainer.setChildIndex(parent, goblinsContainer.children.length - 1);
			
			this.toggleShadows(null, false);
			this.toggleShadows(sprite, true);
			
			sprite.stop();
		};
		
		const onPointerMove = (event) => {
			if (!isDragging) return;
			
			const newX = event.global.x - offset.x;
			const newY = event.global.y - offset.y;
			
			sprite.position.set(newX, newY);
		};
		
		const onPointerUp = () => {
			isDragging = false;
			this.handleDrop(sprite, originalPosition);
		};
		
		sprite.on('pointerdown', onPointerDown);
		sprite.on('pointermove', onPointerMove);
		sprite.on('pointerup', onPointerUp);
		sprite.on('pointerupoutside', onPointerUp);
	};

	handleDrop = (sprite, originalPosition) => {
		const goblinSprites = this.getSlots(sprite.typeGoblin);
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
					onEachComplete: goblin => {
						this.mergeGoblins(goblin, targetGoblin);
					}
				});
			} else {
				const targetPos = this.app.stage.toGlobal({ x: this.app.renderer.width / 2, y: this.app.renderer.height / 2 });

				this.animateGoblinsToPoint({
					goblins: goblinSprites,
					targetPos,
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

	animateGoblinsToPoint = (
		{
			goblins,
			targetPos,
			draggedGoblin,
			originalPosition,
			onEachComplete,
			onAllComplete
		}) => {
		const masterTimeline = gsap.timeline({
			onComplete: () => {
				onAllComplete?.();
			}
		});

		goblins.forEach((goblin, i) => {
			const parent = goblin.parent;
			const localTarget = parent.toLocal(targetPos);

			const originalPos = goblin === draggedGoblin
				? originalPosition
				: { x: goblin.position.x, y: goblin.position.y };

			const goblinTimeline = gsap.timeline();

			goblinTimeline.to(goblin.position, {
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

			goblinTimeline.to(goblin, {
				alpha: 0,
				duration: 0.3,
				ease: 'power1.out'
			})
				.to(goblin.position, {
					x: originalPos.x,
					y: originalPos.y,
					duration: 0.3,
					ease: 'power2.inOut'
				});

			masterTimeline.add(goblinTimeline, i * 0.05);
		});
	};

	mergeGoblins = (goblin, targetGoblin) => {
		goblin.stop();
		goblin.parent.visible = false;

		const upgradeSprite = targetGoblin.parent.children.find(child => child.label === labels.upgradeGoblin);
		upgradeSprite.visible = true;
		targetGoblin.visible = false;
		upgradeSprite.play();
	};

	findClosestSameType = (sprite, candidates, maxDist = 150) => {
		const draggedPos = sprite.getGlobalPosition();
		let closest = null;
		let minDist = maxDist;
		for (const other of candidates) {
			if (other === sprite) continue;
			const pos = other.getGlobalPosition();
			const dist = Math.hypot(draggedPos.x - pos.x, draggedPos.y - pos.y);
			if (dist < minDist) {
				minDist = dist;
				closest = other;
			}
		}
		return closest;
	};

	getSlots = typeGoblin => {
		return this.goblins.children
			.map(goblin => getUIElement(goblin, labels.goblin))
			.filter(slot => slot && slot.typeGoblin === typeGoblin);
	};

	toggleShadows = (sprite, visible = true) => {
		this.filteredGoblinsByType(sprite)
			.map(g => getUIElement(g, labels.shadow))
			.filter(Boolean)
			.forEach(shadow => {
				gsap.to(shadow.scale, {
					x: visible ? 1 : 0,
					y: visible ? 1 : 0,
					duration: 0.1,
					ease: 'power1.inOut'
				});
			});
	};

	filteredGoblinsByType = sprite => {
		return this.goblins.children.filter(goblin => {
			const goblinSprite = getUIElement(goblin, labels.goblin);
			return (
				goblinSprite &&
				(!sprite ||
					(goblinSprite !== sprite &&
						goblinSprite.typeGoblin === sprite.typeGoblin))
			);
		});
	};

	produceCoinsFromAllGoblins = () => {
		this.goblins.children.forEach(goblinContainer => {
			if (!goblinContainer.visible) return;

			const goblinSprite = getUIElement(goblinContainer, labels.goblin);
			if (!goblinSprite) return;

			const count = 3;
			const delayStep = 0.1;

			for (let i = 0; i < count; i++) {
				gsap.delayedCall(i * delayStep, () => {
					const coinTexture = Assets.cache.get(allTextureKeys.coin);
					const coin = new Sprite(coinTexture);
					coin.anchor.set(0.5);

					// Добавляем монету в контейнер гоблина
					goblinContainer.addChild(coin);

					launchElementToTarget(
						coin,
						this.app,
						this.coin.getGlobalPosition(),
						this.coinCount
					);
				});
			}
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
					onEachStart: (goblin) => {
						const sprite = getUIElement(goblin, labels.goblin);
						sprite.alpha = 0;
					},
					afterTween: (goblin) => {
						const sprite = getUIElement(goblin, labels.goblin);
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
		const disabledChest = this.chests.children.find((chest) => {
			const closed = getUIElement(chest, labels.chest);
			return !closed.visible;
		});

		if (disabledChest) {
			const closed = getUIElement(disabledChest, labels.chest);
			const open = getUIElement(disabledChest, labels.chestOpen);

			disabledChest.visible = true;
			closed.visible = true;
			open.alpha = 1;
		} else {
			const disabledGoblin = this.goblins.children.find((goblin) => !goblin.visible);

			if (disabledGoblin) {
				disabledGoblin.visible = true;
				disabledGoblin.alpha = 1;
				const goblin = getUIElement(disabledGoblin, labels.goblin);
				goblin.alpha = 1;
				goblin.play();
			}
		}
	};
}
