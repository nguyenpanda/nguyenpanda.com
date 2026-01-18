/**
 * Theme Module
 * ============
 * Handles dark/light theme toggle with localStorage persistence
 */

// Default to dark theme
let currentTheme = 'dark';

/**
 * Initialize theme from localStorage (default: dark)
 */
function initTheme() {
	// Check localStorage first, otherwise default to dark
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme) {
		currentTheme = savedTheme;
	} else {
		// Always default to dark mode
		currentTheme = 'dark';
	}

	applyTheme(currentTheme);

	// Listen for system theme changes (only if user hasn't set preference)
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (!localStorage.getItem('theme')) {
			applyTheme('dark'); // Always prefer dark
		}
	});
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
	currentTheme = theme;
	document.documentElement.setAttribute('data-theme', theme);

	// Update toggle button icon if exists
	updateThemeToggleIcon();

	// Save to localStorage
	localStorage.setItem('theme', theme);

	console.log(`Theme set to: ${theme}`);
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
	applyTheme(newTheme);
}

/**
 * Update theme toggle button icon
 */
function updateThemeToggleIcon() {
	const toggle = document.getElementById('theme-toggle');
	if (toggle) {
		const icon = toggle.querySelector('i');
		if (icon) {
			icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
		}
		toggle.setAttribute('title', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
	}
}

/**
 * Render theme toggle button in header
 */
function renderThemeToggle() {
	const headerRight = document.querySelector('.header-right');
	if (!headerRight) return;

	// Check if already exists
	if (document.getElementById('theme-toggle')) return;

	const toggle = document.createElement('button');
	toggle.id = 'theme-toggle';
	toggle.className = 'theme-toggle';
	toggle.setAttribute('aria-label', 'Toggle theme');
	toggle.innerHTML = `<i class="fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
	toggle.onclick = toggleTheme;
	toggle.title = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

	// Insert before datetime
	const datetime = headerRight.querySelector('.header-datetime');
	if (datetime) {
		headerRight.insertBefore(toggle, datetime);
	} else {
		headerRight.appendChild(toggle);
	}
}

/**
 * Get current theme
 */
function getTheme() {
	return currentTheme;
}

// Export for use
if (typeof window !== 'undefined') {
	window.initTheme = initTheme;
	window.toggleTheme = toggleTheme;
	window.applyTheme = applyTheme;
	window.renderThemeToggle = renderThemeToggle;
	window.getTheme = getTheme;
}
