import { debounce } from './utils';
const resizeSubscribers = [];

export const initResizeManager = () => {
	window.addEventListener('resize', debounce(() => onWindowResize(), 0));
	window.addEventListener('orientationchange', debounce(() => onWindowResize(), 0));
	
	// Дополнительно для мобильных устройств
	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', debounce(() => onWindowResize(), 0));
	}
};

export const subscribeToResize = obj => {
	if (!resizeSubscribers.includes(obj)) resizeSubscribers.push(obj);
};

export const unsubscribeFromResize = obj => {
	const index = resizeSubscribers.indexOf(obj);
	if (index !== -1) resizeSubscribers.splice(index, 1);
};

const handleResizeForObj = obj => {
	if (!obj || !obj.onResize) return;
	obj.onResize();
};

export const onWindowResize = () => {
	for (const obj of resizeSubscribers) {
		handleResizeForObj(obj);
	}
};
