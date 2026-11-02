'use strict';

const expectedPageKey = 'accessDeniedSurpriseExpectedPage';
const tourPages = [
	'socials.html',
	'Shit.html',
	'linkshrub.html',
	'Minecraft Worlds.html',
	'AboutMe.html',
	'access-denied.html'
];
const surpriseButton = document.getElementById('surprise');
const currentPage = decodeURIComponent(window.location.pathname.split('/').pop());

const clearTour = () => {
	sessionStorage.removeItem(expectedPageKey);
};

const schedulePageNavigation = (targetPage, sourcePage) => {
	sessionStorage.setItem(expectedPageKey, targetPage);
	window.setTimeout(() => {
		if (
			sessionStorage.getItem(expectedPageKey) !== targetPage
			|| decodeURIComponent(window.location.pathname.split('/').pop()) !== sourcePage
		) {
			clearTour();
			return;
		}

		window.location.assign(targetPage);
	}, 100);
};

if (surpriseButton) {
	surpriseButton.addEventListener('click', () => {
		if (sessionStorage.getItem(expectedPageKey) !== null) {
			return;
		}

		schedulePageNavigation(tourPages[0], currentPage);
	});
}

const expectedPage = sessionStorage.getItem(expectedPageKey);

if (expectedPage !== null) {
	const handlePageLoad = () => {
		if (currentPage !== expectedPage) {
			clearTour();
			return;
		}

		const currentTourIndex = tourPages.indexOf(expectedPage);

		if (currentTourIndex === -1 || currentTourIndex === tourPages.length - 1) {
			clearTour();
			return;
		}

		schedulePageNavigation(tourPages[currentTourIndex + 1], currentPage);
	};

	if (document.readyState === 'complete') {
		handlePageLoad();
	} else {
		window.addEventListener('load', handlePageLoad, { once: true });
	}
}
