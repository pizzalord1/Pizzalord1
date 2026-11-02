'use strict';

const tourPages = [
	'socials.html',
	'Shit.html',
	'linkshrub.html',
	'Minecraft Worlds.html',
	'AboutMe.html',
	'access-denied.html'
];
const tourKey = 'surprise-tour';
const tourStepKey = 'surprise-tour-step';
const surpriseButton = document.getElementById('surprise');
const currentPage = decodeURIComponent(window.location.pathname.split('/').pop());
const currentUrl = new URL(window.location.href);

const removeTourFromUrl = () => {
	currentUrl.searchParams.delete(tourKey);
	currentUrl.searchParams.delete(tourStepKey);
	window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
};

const navigateToTourStep = (step) => {
	const destination = new URL(tourPages[step], window.location.href);
	destination.searchParams.set(tourKey, '1');
	destination.searchParams.set(tourStepKey, String(step));

	window.setTimeout(() => {
		window.location.assign(destination.href);
	}, 100);
};

if (surpriseButton) {
	surpriseButton.addEventListener('click', () => {
		if (currentUrl.searchParams.get(tourKey) === '1') {
			return;
		}

		navigateToTourStep(0);
	});
}

if (currentUrl.searchParams.get(tourKey) === '1') {
	const stepValue = currentUrl.searchParams.get(tourStepKey);
	const step = Number(stepValue);

	if (
		stepValue === null
		|| !Number.isInteger(step)
		|| step < 0
		|| step >= tourPages.length
		|| tourPages[step] !== currentPage
	) {
		removeTourFromUrl();
	} else {
		const advanceTour = () => {
			if (step === tourPages.length - 1) {
				removeTourFromUrl();
				return;
			}

			navigateToTourStep(step + 1);
		};

		if (document.readyState === 'complete') {
			advanceTour();
		} else {
			window.addEventListener('load', advanceTour, { once: true });
		}
	}
}
