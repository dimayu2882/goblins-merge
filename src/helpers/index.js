import { gsap } from 'gsap';

export const getUIElement = (container, label) => container.getChildByLabel(label);

export function useIdleCursorTracker(
	{ canvas, timeout = 5000, getMatchedGroup, finger }) {
	let isAnimating = false;
	let currentTimeline = null;
	let idleTimeout = null;
	let idleInterval = null;
	let isIdle = false;
	
	function animateCursorSequence() {
		if (isAnimating || currentTimeline) return;
		
		const matchedGroup = getMatchedGroup();
		if (!matchedGroup?.length) return;
		
		isAnimating = true;
		finger.visible = true;
		finger.position.set(0, 0);
		finger.scale.set(0.6);
		
		const tl = gsap.timeline({
			onComplete: () => {
				finger.visible = false;
				isAnimating = false;
				currentTimeline = null;
			}
		});
		
		matchedGroup.forEach(cell => {
			tl.to(finger.position, {
				x: cell.position.x + finger.width / 4,
				y: cell.position.y + finger.height / 2,
				duration: 1.5,
				ease: 'power2.inOut'
			});
			tl.to(finger.scale, {
				x: 0.4,
				y: 0.4,
				duration: 0.3,
				yoyo: true,
				repeat: 1,
				ease: 'power1.inOut'
			});
		});
		
		currentTimeline = tl;
	}
	
	// Очистка таймеров
	const clearTimers = () => {
		clearTimeout(idleTimeout);
		clearInterval(idleInterval);
	};
	
	// Включить режим idle
	const setIdle = () => {
		if (isIdle) return;
		isIdle = true;
		animateCursorSequence();
		idleInterval = setInterval(animateCursorSequence, timeout);
	};
	
	// Активность пользователя
	const onUserActive = () => {
		if (isIdle) {
			isIdle = false;
			clearTimers();
		}
		
		if (currentTimeline) {
			currentTimeline.kill();
			currentTimeline = null;
		}
		isAnimating = false;
		finger.visible = false;
		
		startIdleTimer();
	};
	
	const startIdleTimer = () => {
		clearTimers();
		idleTimeout = setTimeout(setIdle, timeout);
	};
	
	const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
	
	function start() {
		activityEvents.forEach(event =>
			canvas.addEventListener(event, onUserActive, {
				passive: event !== 'touchstart'
			})
		);
		startIdleTimer();
	}
	
	function stop() {
		clearTimers();
		activityEvents.forEach(event =>
			canvas.removeEventListener(event, onUserActive)
		);
	}
	
	return {
		start,
		stop
	};
}

export function getRandomElement(array) {
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}
