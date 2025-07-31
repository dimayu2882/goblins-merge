import { gsap } from "gsap";

import { labels } from "../common/enums.js";
import { getByLabel, getUIElement } from "../helpers/index.js";
import { eventBus } from "../utils/EventBus.js";
import { soundManager } from "../utils/SoundManager.js";
import { gameState } from "./GameState.js";

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
    this.textMerge = getUIElement(this.gameContainer, labels.textMerge);

    this.initializeDraggableGoblins();
    // soundManager.play('bg');

    // Подписка на события EventBus
    eventBus.on("clickMine", this.activeMine);

    // Добавление обработчиков
    this.mine.on("pointerdown", () => eventBus.emit("clickMine"));
  }

  initializeDraggableGoblins = () => {
    this.goblins.children.forEach((container) => {
      const sprite = container.children.find(
        (child) => child.label === labels.goblin && child.visible,
      );
      this.makeDraggable(sprite);
    });
  };

  makeDraggable = (sprite) => {
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    let originalPosition = { x: sprite.x, y: sprite.y };

    sprite.on("pointerdown", (event) => {
      isDragging = true;
      offset.x = event.global.x - sprite.x;
      offset.y = event.global.y - sprite.y;
      originalPosition = { x: sprite.x, y: sprite.y };

      const parent = sprite.parent;
      this.goblins.setChildIndex(parent, this.goblins.children.length - 1);

      this.toggleShadows(null, false);
      this.toggleShadows(sprite, true);
      sprite.stop();
      if (sprite.stopCoinFlow) sprite.stopCoinFlow();
    });

    sprite.on("pointermove", (event) => {
      if (!isDragging) return;
      const local = sprite.parent.toLocal(event.data.global);
      sprite.position.set(local.x, local.y);
    });

    const stopDragging = () => {
      isDragging = false;
      this.handleDrop(sprite, originalPosition);
    };

    sprite.on("pointerup", stopDragging);
    sprite.on("pointerupoutside", stopDragging);
  };

  handleDrop = (sprite, originalPosition) => {
    const type = sprite.parent.typeGoblin;
    const goblinSprites = this.getSlots(type);
    const closest = this.findClosestSameType(sprite, goblinSprites);

    if (closest) {
      const targetPos = closest.getGlobalPosition();
      const targetGoblin = goblinSprites.find((g) => g === closest);
      const animatingGoblins = goblinSprites.filter((g) => g !== closest);

      if (gameState.getGameState() === labels.gameSceneMove) {
        this.animateGoblinsToPoint({
          goblins: animatingGoblins,
          targetPos,
          draggedGoblin: sprite,
          originalPosition,
          targetGoblin,
          onEachComplete: (goblin) => {
            this.mergeGoblins(goblin, targetGoblin);
          },
        });
      } else {
        const center = this.app.stage.toGlobal({
          x: this.app.renderer.width / 2,
          y: this.app.renderer.height / 2,
        });

        this.animateGoblinsToPoint({
          goblins: goblinSprites,
          targetPos: center,
          draggedGoblin: sprite,
          originalPosition,
          targetGoblin,
          onAllComplete: () => this.activeScene(),
        });
      }
    } else {
      sprite.play();
      gsap.to(sprite.position, {
        x: originalPosition.x,
        y: originalPosition.y,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    this.toggleShadows(null, false);
  };

  animateGoblinsToPoint = ({
    goblins,
    targetPos,
    draggedGoblin,
    originalPosition,
    targetGoblin,
    onEachComplete,
    onAllComplete,
  }) => {
    const timeline = gsap.timeline({ onComplete: () => onAllComplete?.() });

    const uniqueParents = new Set(
      goblins.filter((g) => g !== targetGoblin).map((g) => g.parent),
    );
    uniqueParents.forEach((parent) => (parent.isHidden = true));

    // Флаг для отслеживания первого слияния
    let mergeExecuted = false;

    goblins.forEach((goblin) => {
      const parent = goblin.parent;
      const localTarget = parent.toLocal(targetPos);
      const original =
        goblin === draggedGoblin ? originalPosition : goblin.position.clone();

      const tl = gsap.timeline();

      tl.to(goblin.position, {
        x: localTarget.x,
        y: localTarget.y,
        duration: 0.35,
        ease: "power2.out",
        onStart: () => goblin.play?.(),
        onComplete: () => {
          goblin.stop();
          if (!mergeExecuted && onEachComplete) {
            mergeExecuted = true;
            onEachComplete(goblin);
          }
        },
      });

      tl.to(goblin, { alpha: 0, duration: 0.3, ease: "power1.out" });
      tl.to(goblin.position, { x: original.x, y: original.y, duration: 0.3 });

      timeline.add(tl, 0);
    });
  };

  mergeGoblins = (goblin, targetGoblin) => {
    goblin.stop();
    goblin.parent.isHidden = true;
    goblin.stopCoinFlow?.();

    const targetContainer = targetGoblin.parent;
    const goblinSprite = targetContainer.children.find(
      (ch) =>
        ch.label === labels.goblin && ch.typeGoblin !== labels.upgradeGoblin,
    );
    const upgradeSprite = targetContainer.children.find(
      (ch) => ch.typeGoblin === labels.upgradeGoblin,
    );

    if (goblinSprite) {
      goblinSprite.stop();
      goblinSprite.visible = false;
    }

    if (upgradeSprite) {
      upgradeSprite.visible = true;
      upgradeSprite.play();
      upgradeSprite.gotoAndPlay(0);
      this.makeDraggable(upgradeSprite);
    }

    targetContainer.typeGoblin = labels.upgradeGoblin;
    upgradeSprite.typeGoblin = labels.upgradeGoblin;
    soundManager.play("swoosh");
    this.initializeDraggableGoblins();
  };

  findClosestSameType = (sprite, candidates, maxDist = 150) => {
    const pos = sprite.getGlobalPosition();
    let closest = null,
      min = maxDist;
    for (const other of candidates) {
      if (other === sprite) continue;
      const d = Math.hypot(
        pos.x - other.getGlobalPosition().x,
        pos.y - other.getGlobalPosition().y,
      );
      if (d < min) {
        min = d;
        closest = other;
      }
    }
    return closest;
  };

  getSlots = (typeGoblin) => {
    return this.goblins.children
      .filter((container) => container.typeGoblin === typeGoblin)
      .map((container) => {
        return container.children.find(
          (child) =>
            (child.label === labels.goblin && child.visible) ||
            (child.typeGoblin === labels.upgradeGoblin && child.visible),
        );
      });
  };

  toggleShadows = (sprite, visible = true) => {
    this.filteredGoblinsByType(sprite)
      .map((g) => getUIElement(g, labels.shadow))
      .filter(Boolean)
      .forEach((shadow) => {
        gsap.to(shadow.scale, {
          x: visible ? 2 : 0,
          y: visible ? 2 : 0,
          duration: 0.1,
        });
      });
  };

  filteredGoblinsByType = (sprite) => {
    return this.goblins.children.filter((container) => {
      if (!sprite) return true;
      const isSameType =
        container !== sprite.parent &&
        container.typeGoblin === sprite.parent.typeGoblin;
      const hasVisibleGoblin = container.children.some(
        (child) =>
          (child.label === labels.goblin ||
            child.typeGoblin === labels.upgradeGoblin) &&
          child.alpha &&
          child.visible,
      );
      return isSameType && hasVisibleGoblin;
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
        ease: "power1.inOut",
      },
    );
    this.checkActiveElements();
  };

  activeScene = () => {
    gsap.to(this.textMerge, {
      alpha: 0,
      duration: 0.4,
      ease: "power1.out",
    });

    this.mine.visible = true;
    this.mine.alpha = 0;
    this.mine.scale.set(0);

    gsap.to(this.mine.scale, {
      x: 1,
      y: 1,
      duration: 0.4,
      ease: "back.out(2)",
    });

    gsap.to(this.mine, {
      alpha: 1,
      duration: 0.4,
      ease: "power1.out",
    });

    gsap.to(this.mine.position, {
      x: this.mine.position.x + 5,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: "sine.inOut",
      onComplete: () => {
        gsap.set(this.mine.position, { x: this.mine.position.x - 5 });
        soundManager.play("build");

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
          },
        });

        this.showAllElements({ container: this.chests });
      },
    });
  };

  showAllElements = ({
    container,
    onEachStart = () => {},
    afterTween = () => {},
  }) => {
    const center = {
      x: this.app.renderer.width / 2,
      y: this.app.renderer.height / 2,
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
        ease: "back.out(2)",
        onComplete: () => afterTween(element),
      });
    });
  };

  checkActiveElements = () => {
    const chest = this.chests.children.find(
      (c) => !getUIElement(c, labels.chest)?.visible,
    );

    if (chest) {
      getUIElement(chest, labels.chest).visible = true;
      getUIElement(chest, labels.chestOpen).alpha = 1;
      chest.visible = true;
      return;
    }

    const container = this.goblins.children.find((c) => c.isHidden);
    if (container) {
      const goblin = getUIElement(container, labels.goblin);
      Object.assign(container, { visible: true, alpha: 1, isHidden: false });
      Object.assign(goblin, { visible: true, alpha: 1 });
      goblin.play();
    }
  };
}
