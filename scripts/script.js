// Global UI helpers (theme toggle, small utilities)

function applyTheme(isDark) {
	if (isDark) document.body.classList.add('dark');
	else document.body.classList.remove('dark');
}

function initThemeToggle() {
	const toggle = document.getElementById('themeToggle');
	if (!toggle) return;
	try {
		const saved = localStorage.getItem('musicpages-theme');
		const isDark = saved === 'dark';
		toggle.checked = isDark;
		applyTheme(isDark);
	} catch (e) {}

	toggle.addEventListener('change', function () {
		const isDark = !!this.checked;
		try { localStorage.setItem('musicpages-theme', isDark ? 'dark' : 'light'); } catch(e) {}
		applyTheme(isDark);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initThemeToggle();
});
