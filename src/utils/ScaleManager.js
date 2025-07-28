// utils/ScaleManager.js
import { getAdaptiveSize } from "./utils.js";

export class ScaleManager {
  constructor(gameContainer) {
    this.gameContainer = gameContainer;
    this.baseWidth = 1920;
    this.baseHeight = 1280; // 1920/1.5 согласно getAdaptiveSize

    // Определяем мобильное устройство
    this.isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    this.isTablet =
      /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768;

    // Настройки для playable
    this.playableSettings = {
      minScale: 0.3, // Минимальный масштаб для очень маленьких экранов
      maxScale: 2.0, // Максимальный масштаб
      safeAreaPadding: 20, // Отступ от краёв экрана
      mobilePadding: 10, // Дополнительный отступ для мобильных
    };

    this.currentScale = 1;
    this.isLandscape = false;
  }

  updateScale() {
    const { width, height } = getAdaptiveSize();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this.isLandscape = windowWidth >= windowHeight;

    // Учитываем safe area для мобильных устройств
    const safeWidth = this.getSafeWidth(width);
    const safeHeight = this.getSafeHeight(height);

    let scale, posX, posY;

    if (this.isLandscape) {
      // Горизонтальная ориентация
      scale = this.calculateLandscapeScale(safeWidth, safeHeight);
      const scaledHeight = this.baseHeight * scale;

      posX = 0;
      posY = (height - scaledHeight) / 2;

      // Дополнительная корректировка для мобильных в landscape
      if (this.isMobile && windowHeight < 500) {
        posY = Math.max(this.playableSettings.mobilePadding, posY);
      }
    } else {
      // Вертикальная ориентация
      scale = this.calculatePortraitScale(safeWidth, safeHeight);
      const scaledWidth = this.baseWidth * scale;

      posX = (width - scaledWidth) / 2;
      posY = 0;

      // Для мобильных в portrait делаем небольшой отступ сверху
      if (this.isMobile) {
        posY = this.playableSettings.mobilePadding;
      }
    }

    // Ограничиваем масштаб
    scale = Math.max(
      this.playableSettings.minScale,
      Math.min(this.playableSettings.maxScale, scale),
    );

    // Применяем масштаб и позицию
    this.gameContainer.scale.set(scale);
    this.gameContainer.position.set(posX, posY);

    this.currentScale = scale;

    // Логируем для отладки playable
    console.log(
      `Scale: ${scale.toFixed(3)}, ${this.isLandscape ? "Landscape" : "Portrait"}, Mobile: ${this.isMobile}`,
    );
  }

  calculateLandscapeScale(safeWidth, safeHeight) {
    // В landscape подгоняем по высоте, но проверяем ширину
    const scaleByHeight = safeHeight / this.baseHeight;
    const scaleByWidth = safeWidth / this.baseWidth;

    let scale = Math.min(scaleByHeight, scaleByWidth);

    // Для мобильных в landscape можем немного увеличить
    if (this.isMobile && !this.isTablet) {
      scale = Math.min(scale * 1.1, scaleByHeight);
    }

    return scale;
  }

  calculatePortraitScale(safeWidth, safeHeight) {
    // В portrait разная логика для мобильных и десктопов
    if (this.isMobile && !this.isTablet) {
      // Для телефонов в portrait лучше подгонять по ширине
      return safeWidth / this.baseWidth;
    } else {
      // Для планшетов и десктопов - стандартная логика
      const scaleByHeight = safeHeight / this.baseHeight;
      const scaleByWidth = safeWidth / this.baseWidth;
      return Math.min(scaleByHeight, scaleByWidth);
    }
  }

  getSafeWidth(width) {
    let padding = this.playableSettings.safeAreaPadding;

    // Дополнительный padding для мобильных
    if (this.isMobile) {
      padding += this.playableSettings.mobilePadding;
    }

    // Учитываем safe area insets (если доступны)
    if (this.isMobile && CSS.supports("padding: env(safe-area-inset-left)")) {
      const leftInset = this.getSafeAreaInset("left");
      const rightInset = this.getSafeAreaInset("right");
      padding += leftInset + rightInset;
    }

    return Math.max(width - padding * 2, width * 0.8); // Минимум 80% ширины
  }

  getSafeHeight(height) {
    let padding = this.playableSettings.safeAreaPadding;

    if (this.isMobile) {
      padding += this.playableSettings.mobilePadding;
    }

    // Учитываем safe area insets
    if (this.isMobile && CSS.supports("padding: env(safe-area-inset-top)")) {
      const topInset = this.getSafeAreaInset("top");
      const bottomInset = this.getSafeAreaInset("bottom");
      padding += topInset + bottomInset;
    }

    return Math.max(height - padding * 2, height * 0.8); // Минимум 80% высоты
  }

  getSafeAreaInset(side) {
    // Простой способ получить safe area inset
    const testEl = document.createElement("div");
    testEl.style.cssText = `
			position: fixed; top: 0; left: 0; width: 1px; height: 1px;
			padding-${side}: env(safe-area-inset-${side});
			visibility: hidden;
		`;

    document.body.appendChild(testEl);
    const inset =
      parseInt(
        getComputedStyle(testEl)[
          `padding${side.charAt(0).toUpperCase() + side.slice(1)}`
        ],
      ) || 0;
    document.body.removeChild(testEl);

    return inset;
  }

  // Дополнительные методы для playable
  getCurrentScale() {
    return this.currentScale;
  }

  getOrientation() {
    return this.isLandscape ? "landscape" : "portrait";
  }

  isMobileDevice() {
    return this.isMobile;
  }

  // Настройка параметров масштабирования
  setScaleLimits(min, max) {
    this.playableSettings.minScale = min;
    this.playableSettings.maxScale = max;
    this.updateScale(); // Пересчитываем с новыми лимитами
  }

  setSafeAreaPadding(padding) {
    this.playableSettings.safeAreaPadding = padding;
    this.updateScale();
  }
}
