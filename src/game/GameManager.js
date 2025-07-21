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
			
			if(sprite.typeGoblin === labels.goblinTwo) sprite.stop();
		});
	};

	makeDraggable = sprite => {
		let isDragging = false;
		let offset = { x: 0, y: 0 };
		let originalPosition = { x: sprite.x, y: sprite.y };

		sprite.on('pointerdown', event => {
			isDragging = true;
			offset.x = event.global.x - sprite.x;
			offset.y = event.global.y - sprite.y;
			originalPosition = { x: sprite.x, y: sprite.y };

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
			this.handleDrop(sprite, originalPosition);
		};

		sprite.on('pointerup', stopDragging);
		sprite.on('pointerupoutside', stopDragging);
	};

	handleDrop = (sprite, originalPosition) => {
		const goblinSprites = this.getSlots(sprite.typeGoblin);
		const closest = this.findClosestSameType(sprite, goblinSprites);

		if (closest) {
			const targetPos = closest.getGlobalPosition();
			const targetGoblin = goblinSprites.find(g => g === closest);
			const animatingGoblins = goblinSprites.filter(g => g !== closest);

			if (gameState.getGameState() === labels.gameSceneMove) {
				this.animateGoblinsToTarget(animatingGoblins, targetPos, goblin => {
					this.mergeGoblins(goblin, targetGoblin);
				});
			} else {
				this.animateGoblinsToAppCenter(
					goblinSprites,
					sprite,
					originalPosition,
					() => {
						this.activeScene();
					}
				);
			}
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

	animateGoblinsToTarget = (goblins, targetPos, onEachComplete) => {
		goblins.forEach((goblin, i) => {
			const parent = goblin.parent;
			const local = parent.toLocal(targetPos);

			gsap.to(parent, {
				alpha: 0,
				duration: 0.2,
				delay: i * 0.05,
				ease: 'power1.out',
			});

			gsap.to(goblin.position, {
				x: local.x,
				y: local.y,
				duration: 0.35,
				delay: i * 0.05,
				ease: 'power2.out',
				onComplete: () => {
					goblin.stop();
					parent.visible = false;
					onEachComplete?.(goblin);
				},
			});
		});
	};

	animateGoblinsToAppCenter = (goblins, draggedGoblin, originalPosition, onAllComplete) => {
		const targetX = this.app.renderer.width / 2;
		const targetY = this.app.renderer.height / 2;

		const masterTimeline = gsap.timeline({
			onComplete: () => {
				onAllComplete?.();
			},
		});

		goblins.forEach((goblin, i) => {
			const globalTarget = goblin.parent.toLocal({ x: targetX, y: targetY });
			const originalPos =
				goblin === draggedGoblin
					? originalPosition
					: { x: goblin.position.x, y: goblin.position.y };

			const tl = gsap.timeline();

			tl.to(goblin.position, {
				x: globalTarget.x,
				y: globalTarget.y,
				duration: 0.35,
				ease: 'power2.out',
				onComplete: () => goblin.stop(),
			})
				.to(goblin, {
					alpha: 0,
					duration: 0.3,
					ease: 'power1.out',
				})
				.to(goblin.position, {
					x: originalPos.x,
					y: originalPos.y,
					duration: 0.3,
					ease: 'power2.inOut',
				});

			masterTimeline.add(tl, i * 0.05);
		});
	};

	mergeGoblins = (goblin, targetGoblin) => {
		goblin.stop();
		goblin.parent.visible = false;

		const upgradeSprite = targetGoblin.parent.children.find(childe => childe.label === labels.upgradeGoblin);
		upgradeSprite.visible = true;
		targetGoblin.visible = false;

		const texture = Assets.cache.get(allTextureKeys.coin);
		const clonedCoin = new Sprite(texture);
		upgradeSprite.parent.addChild(clonedCoin);
		upgradeSprite.visible = true;

		const count = 5;
		const delayStep = 0.05;

		for (let i = 0; i < count; i++) {
			gsap.delayedCall(i * delayStep, () => {
				const coinTexture = Assets.cache.get(allTextureKeys.coin);
				const newCoin = new Sprite(coinTexture);
				upgradeSprite.parent.addChild(newCoin);

				launchElementToTarget(
					newCoin,
					this.app,
					this.coin.getGlobalPosition(),
					this.coinCount
				);
			});
		}
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
					ease: 'power1.inOut',
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

					// Добавляем монету в контейнер гоблина, а не в глобальный контейнер
					goblinContainer.addChild(coin);

					launchElementToTarget(
						coin,
						this.app, // Передаем главный объект приложения
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
		this.smokeMine.onComplete = () => (this.smokeMine.visible = false);

		gsap.fromTo(
			this.mine.scale,
			{ x: 1, y: 1 },
			{
				x: 1.1,
				y: 0.9,
				duration: 0.1,
				yoyo: true,
				repeat: 2,
				ease: 'power1.inOut',
			}
		);
		
		this.checkActiveElements();
	};

	activeScene = () => {
		gsap.to(this.textMerge, {
			alpha: 0,
			duration: 0.4,
			ease: 'power1.out',
		});

		this.mine.visible = true;
		this.mine.alpha = 0;
		this.mine.scale.set(0);

		gsap.to(this.mine.scale, {
			x: 1,
			y: 1,
			duration: 0.4,
			ease: 'back.out(2)',
		});
		gsap.to(this.mine, {
			alpha: 1,
			duration: 0.4,
			ease: 'power1.out',
		});

		gsap.to(this.mine.position, {
			x: this.mine.position.x + 5,
			duration: 0.05,
			yoyo: true,
			repeat: 5,
			ease: 'sine.inOut',
			onComplete: () => {
				this.mine.position.x -= 5;
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
					},
				});
				
				this.produceCoinsFromAllGoblins();
				this.showAllElements({ container: this.chests, });
			},
		});
	};
	
	showAllElements = ({ container, afterTween = () => {}, onEachStart = () => {} }) => {
		const centerX = this.app.renderer.width / 2;
		const centerY = this.app.renderer.height / 2;
		
		const centerInContainer = container.toLocal({ x: centerX, y: centerY });
		
		container.children.forEach((element) => {
			element.visible = true;
			
			const targetX = element.x;
			const targetY = element.y;
			
			element.x = centerInContainer.x;
			element.y = centerInContainer.y;
			
			onEachStart(element);
			
			gsap.to(element.position, {
				x: targetX,
				y: targetY,
				duration: '0.6',
				ease: 'back.out(2)',
				onComplete: () => afterTween(element),
			});
		});
	};
	
	checkActiveElements = () => {
		const disabledChest = this.chests.children.find((chest) => {
			const chestClosed = getUIElement(chest, labels.chest);
			return !chestClosed.visible;
		});
		
		if (disabledChest) {
			const chestClosed = getUIElement(disabledChest, labels.chest);
			const chestOpen = getUIElement(disabledChest, labels.chestOpen);
			
			disabledChest.visible = true;
			chestClosed.visible = true;
			chestOpen.alpha = 1;
		} else {
			const disabledGoblin = this.goblins.children.find((goblin) => !goblin.visible);
			console.log(disabledGoblin);
			
			if (disabledGoblin) {
				disabledGoblin.visible = true;
			}
		}
	};
}
