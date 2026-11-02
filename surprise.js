'use strict';

const reloadsRemainingKey = 'accessDeniedSurpriseReloadsRemaining';
const surpriseButton = document.getElementById('surprise');

if (surpriseButton) {
	surpriseButton.addEventListener('click', () => {
		sessionStorage.setItem(reloadsRemainingKey, '9');
		window.location.reload();
	});
}

const storedReloadsRemaining = sessionStorage.getItem(reloadsRemainingKey);

if (storedReloadsRemaining !== null) {
	const reloadsRemaining = Number(storedReloadsRemaining);

	if (Number.isInteger(reloadsRemaining) && reloadsRemaining > 0) {
		sessionStorage.setItem(reloadsRemainingKey, String(reloadsRemaining - 1));
		window.location.reload();
	} else {
		sessionStorage.removeItem(reloadsRemainingKey);
	}
}
