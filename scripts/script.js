// Global UI helpers (theme toggle, small utilities)

function applyTheme(isDark) {
	if (isDark) document.body.classList.add('dark');
	else document.body.classList.remove('dark');
}

function initThemeToggle() {
	const toggle = document.getElementById('themeToggle');
	if (!toggle) return;

	// Reflects the current theme on the switch (ARIA + body class + persistence).
	function setTheme(isDark) {
		applyTheme(isDark);
		toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
		try { localStorage.setItem('musicpages-theme', isDark ? 'dark' : 'light'); } catch (e) {}
	}

	// Initialize from saved preference.
	let isDark = false;
	try {
		isDark = localStorage.getItem('musicpages-theme') === 'dark';
	} catch (e) {}
	applyTheme(isDark);
	toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');

	// Toggle on click (button role="switch").
	toggle.addEventListener('click', function () {
		const next = toggle.getAttribute('aria-checked') !== 'true';
		setTheme(next);
	});

	// Keyboard: Space/Enter also toggles (native for <button>, but Space may scroll
	// if default isn't prevented on keydown).
	toggle.addEventListener('keydown', function (e) {
		if (e.key === ' ' || e.key === 'Spacebar') {
			e.preventDefault();
			toggle.click();
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initThemeToggle();
});
