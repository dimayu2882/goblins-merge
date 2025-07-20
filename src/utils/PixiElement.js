import { elementType } from '../common/enums.js';
import { subscribeToResize, unsubscribeFromResize } from './resizeManager.js';
import { getAppInstance, UIFactory } from './utils.js';

export class PixiElement {
	constructor(config = {}, onResizeHandler, isSubscribeToResize) {
		this.type = config.type || elementType.CONTAINER;
		this.instance = this._create(config);
		this.app = getAppInstance();
		this.instance.__owner = this;
		this.onResizeHandler = onResizeHandler;
		if (isSubscribeToResize) subscribeToResize(this);
	}

	_create(config) {
		const element = UIFactory.createElement(this.type, config);
		this._applyCommonProperties(element, config);
		return element;
	}

	_applyCommonProperties(element, config) {
		const properties = {
			width: (el, width) => el.width = width,
			height: (el, height) => el.height = height,
			position: (el, pos) => el.position.set(...pos),
			positionX: (el, pos) => el.positionX =  pos,
			positionY: (el, pos) => el.positionY = pos,
			scale: (el, scale) => el.scale.set(...scale),
			anchor: (el, anchor) => el.anchor.set(...anchor),
			pivot: (el, pivot) => el.pivot.set(...pivot),
			alpha: (el, alpha) => (el.alpha = alpha),
			eventMode: (el, mode) => (el.eventMode = mode),
			cursor: (el, cursor) => (el.cursor = cursor),
			interactive: (el, interactive) => (el.interactive = interactive),
			buttonMode: (el, buttonMode) => (el.buttonMode = buttonMode),
			half: (el, half) => (el.half = half),
			label: (el, label) => (el.label = label),
			zIndex: (el, zIndex) => (el.zIndex = zIndex),
			visible: (el, visible) => (el.visible = visible),
			sortableChildren: (el, sortableChildren) => (el.sortableChildren = sortableChildren),
		};

		Object.entries(properties).forEach(([key, setter]) => {
			if (config[key] !== undefined) {
				setter(element, config[key]);
			}
		});
	}

	// Методы API
	registerFlag = (flagName, value = true) => {
		this.instance.flags = this.instance.flags || {};
		this.instance.flags[flagName] = value;
	};

	onResize = () => this.onResizeHandler();
	
	destroy = () => {
		unsubscribeFromResize(this);
		this.instance.destroy({ children: true });
	};

	addChildren = children => children.forEach(child => this.instance.addChild(child));

	addToContainer = container => container.addChild(this.instance);

	getElement = () => this.instance;
	
	playAnimatedSprite = () => {
		this.type === elementType.ANIMATED_SPRITE ? this.instance.play() : null;
	};
	
	stopAnimatedSprite = () => {
		this.type === elementType.ANIMATED_SPRITE ? this.instance.stop() : null;
	};
}
