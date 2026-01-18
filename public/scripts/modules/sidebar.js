/**
 * Sidebar Module
 * ==============
 * Handles collapsible & resizable sidebar navigation with logo
 */

// State
let sidebarOpen = true;
let navigationData = null;
let isResizing = false;
let sidebarWidth = 260;

/**
 * Load navigation data from YAML (with JSON fallback)
 */
async function loadNavigationData() {
	try {
		// Use fetchData from yaml.js module
		navigationData = await fetchData('/public/data/navigation');
		return navigationData;
	} catch (error) {
		console.error('Error loading navigation:', error);
		return null;
	}
}

/**
 * Render global header
 */
function renderGlobalHeader() {
	const header = document.getElementById('global-header');
	if (!header) return;

	const currentPath = window.location.pathname;
	let displayPath = '~';

	if (currentPath.includes('research')) displayPath = '~/research';
	else if (currentPath.includes('projects')) displayPath = '~/projects';
	else if (currentPath.includes('hpc')) displayPath = '~/hpc';
	else if (currentPath.includes('gallery')) displayPath = '~/gallery';
	else if (currentPath.includes('archive')) displayPath = '~/archive';
	else if (currentPath.includes('portal')) displayPath = '~/portal';

	header.innerHTML = `
        <a href="/" class="header-prompt">
            <span class="prompt-user">root</span><span class="prompt-at">@</span><span class="prompt-host">nguyenpanda</span><span class="prompt-colon">:</span><span class="prompt-path">${displayPath}</span><span class="prompt-symbol">#</span><span class="blink">_</span>
        </a>
        <div class="header-right">
            <div class="header-datetime">
                <span class="header-date" id="header-date"></span>
                <span class="header-time" id="header-time"></span>
            </div>
        </div>
    `;

	// Update date/time immediately and then every second
	updateHeaderDateTime();
	setInterval(updateHeaderDateTime, 1000);
}

function updateHeaderDateTime() {
	const dateEl = document.getElementById('header-date');
	const timeEl = document.getElementById('header-time');
	const now = new Date();

	if (dateEl) {
		dateEl.textContent = now.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	if (timeEl) {
		timeEl.textContent = now.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}
}

/**
 * Render sidebar
 */
function renderSidebar() {
	const sidebar = document.getElementById('sidebar');
	if (!sidebar || !navigationData) return;

	const currentPage = window.location.pathname;

	// Build navigation items
	const navItems = navigationData.sidebar.items.map(item => {
		const isActive = currentPage.includes(item.href) ||
			(item.href === '/' && (currentPage === '/' || currentPage.endsWith('home.html')));
		const highlightClass = item.isHighlight ? 'highlight' : '';
		const homeClass = (item.href === '/' || item.href.includes('home')) ? 'home-link' : '';
		const activeClass = isActive ? 'active' : '';

		return `
            <a href="${item.href}" class="sidebar-link ${highlightClass} ${homeClass} ${activeClass}" title="${item.label}">
                <i class="fas ${item.icon}"></i>
                <span class="sidebar-label">${item.label}</span>
            </a>
        `;
	}).join('');

	sidebar.innerHTML = `
        <div class="sidebar-resize-handle" id="sidebar-resize"></div>
        <div class="sidebar-header">
            <a href="/" class="sidebar-logo">
                <img src="${navigationData.sidebar.logo}" alt="Logo" class="sidebar-logo-img">
                <span class="sidebar-logo-text">NGUYENPANDA</span>
            </a>
            <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Toggle sidebar" title="Toggle sidebar">
                <i class="fas fa-angles-left" id="toggle-icon"></i>
            </button>
        </div>
        <nav class="sidebar-nav">
            ${navItems}
        </nav>
        <div class="sidebar-footer">
            <span class="sidebar-brand">guest@nguyenpanda</span>
            <span class="blink">_</span>
        </div>
    `;

	// Setup resize handle
	setupResizeHandle();
	updateToggleIcon();
}

/**
 * Setup resize handle drag functionality
 */
function setupResizeHandle() {
	const handle = document.getElementById('sidebar-resize');
	const sidebar = document.getElementById('sidebar');
	const mainContent = document.querySelector('.main-content');

	if (!handle || !sidebar) return;

	handle.addEventListener('mousedown', (e) => {
		isResizing = true;
		handle.classList.add('dragging');
		document.body.style.cursor = 'ew-resize';
		document.body.style.userSelect = 'none';
		e.preventDefault();
	});

	document.addEventListener('mousemove', (e) => {
		if (!isResizing) return;

		let newWidth = e.clientX;

		// Constraints
		if (newWidth < 60) newWidth = 60;
		if (newWidth > 400) newWidth = 400;

		sidebarWidth = newWidth;
		sidebar.style.width = newWidth + 'px';
		sidebar.style.transition = 'none';

		if (mainContent) {
			mainContent.style.marginLeft = newWidth + 'px';
			mainContent.style.transition = 'none';
		}

		// Auto-collapse if too narrow
		if (newWidth <= 80) {
			sidebar.classList.add('collapsed');
			sidebarOpen = false;
		} else {
			sidebar.classList.remove('collapsed');
			sidebarOpen = true;
		}

		updateToggleIcon();
	});

	document.addEventListener('mouseup', () => {
		if (isResizing) {
			isResizing = false;
			const handle = document.getElementById('sidebar-resize');
			if (handle) handle.classList.remove('dragging');
			document.body.style.cursor = '';
			document.body.style.userSelect = '';

			const sidebar = document.getElementById('sidebar');
			const mainContent = document.querySelector('.main-content');
			if (sidebar) sidebar.style.transition = '';
			if (mainContent) mainContent.style.transition = '';

			// Save width
			localStorage.setItem('sidebarWidth', sidebarWidth);
			localStorage.setItem('sidebarOpen', sidebarOpen);
		}
	});
}

/**
 * Toggle sidebar open/collapsed
 */
function toggleSidebar() {
	const isMobile = window.innerWidth <= 768;
	const sidebar = document.getElementById('sidebar');
	const wrapper = document.querySelector('.layout-wrapper');
	const mainContent = document.querySelector('.main-content');

	if (isMobile) {
		// Mobile: Toggle .open class for slide-in/out effect
		sidebarOpen = !sidebarOpen;

		if (sidebar) {
			sidebar.classList.toggle('open', sidebarOpen);
		}

		// Toggle overlay
		toggleOverlay(sidebarOpen);
	} else {
		// Desktop: Toggle collapsed state with width changes
		sidebarOpen = !sidebarOpen;

		if (sidebar) {
			sidebar.classList.toggle('collapsed', !sidebarOpen);
			sidebar.style.width = sidebarOpen ? (sidebarWidth > 80 ? sidebarWidth + 'px' : '260px') : '60px';
		}
		if (wrapper) {
			wrapper.classList.toggle('sidebar-collapsed', !sidebarOpen);
		}
		if (mainContent) {
			mainContent.style.marginLeft = sidebarOpen ? (sidebarWidth > 80 ? sidebarWidth + 'px' : '260px') : '60px';
		}
	}

	updateToggleIcon();

	// Save preference (only for desktop)
	if (!isMobile) {
		localStorage.setItem('sidebarOpen', sidebarOpen);
	}
}

/**
 * Create and manage sidebar overlay for mobile
 */
function toggleOverlay(show) {
	let overlay = document.querySelector('.sidebar-overlay');

	if (show) {
		// Create overlay if it doesn't exist
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'sidebar-overlay';
			overlay.addEventListener('click', () => {
				// Close sidebar when overlay is clicked
				sidebarOpen = true; // Will be toggled to false
				toggleSidebar();
			});
			document.body.appendChild(overlay);
		}
		// Show overlay with slight delay for smooth animation
		setTimeout(() => {
			overlay.classList.add('open');
		}, 10);
	} else {
		// Hide overlay
		if (overlay) {
			overlay.classList.remove('open');
		}
	}
}

/**
 * Update toggle icon direction
 */
function updateToggleIcon() {
	const icon = document.getElementById('toggle-icon');
	if (icon) {
		icon.className = sidebarOpen ? 'fas fa-angles-left' : 'fas fa-angles-right';
	}
}

/**
 * Initialize sidebar from saved state
 */
function initSidebar() {
	const savedOpen = localStorage.getItem('sidebarOpen');
	const savedWidth = localStorage.getItem('sidebarWidth');

	if (savedOpen !== null) {
		sidebarOpen = savedOpen === 'true';
	}
	if (savedWidth !== null) {
		sidebarWidth = parseInt(savedWidth, 10);
		if (isNaN(sidebarWidth) || sidebarWidth < 60) sidebarWidth = 260;
	}

	// Apply initial state
	const wrapper = document.querySelector('.layout-wrapper');
	const sidebar = document.getElementById('sidebar');
	const mainContent = document.querySelector('.main-content');

	if (!sidebarOpen) {
		if (wrapper) wrapper.classList.add('sidebar-collapsed');
		if (sidebar) {
			sidebar.classList.add('collapsed');
			sidebar.style.width = '60px';
		}
		if (mainContent) mainContent.style.marginLeft = '60px';
	} else if (sidebarWidth !== 260) {
		if (sidebar) sidebar.style.width = sidebarWidth + 'px';
		if (mainContent) mainContent.style.marginLeft = sidebarWidth + 'px';
	}
}

/**
 * Render footer with two-column layout
 */
function renderFooter() {
	const footer = document.querySelector('footer');
	if (!footer || !navigationData) return;

	const footerData = navigationData.footer;

	const rightLinks = footerData.right.links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" title="${link.platform}">
            <i class="${link.icon}"></i>
        </a>
    `).join('');

	footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-left">
                <p class="footer-copyright">
                    ${footerData.left.copyright}
                    <span class="divider">|</span>
                    ${footerData.left.tagline}
                </p>
                <p class="footer-powered">
                    Powered by <strong>${footerData.left.poweredBy.name}</strong>,
                    ${footerData.left.poweredBy.description}
                    <br>
                    <a href="${footerData.left.poweredBy.githubUrl}" target="_blank" rel="noopener noreferrer">
                        View Source on GitHub
                    </a>
                </p>
            </div>
            <div class="footer-right">
                <p class="footer-connect-title">${footerData.right.title}</p>
                <div class="footer-social">
                    ${rightLinks}
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize sidebar module
 */
async function initSidebarModule() {
	// Initialize theme first
	if (typeof initTheme === 'function') {
		initTheme();
	}

	await loadNavigationData();
	renderGlobalHeader();

	// Render theme toggle after header is ready
	if (typeof renderThemeToggle === 'function') {
		renderThemeToggle();
	}

	initSidebar();
	renderSidebar();
	renderFooter();

	// Handle mobile menu
	handleMobileResize();
	window.addEventListener('resize', handleMobileResize);
}

/**
 * Handle responsive changes
 */
function handleMobileResize() {
	const isMobile = window.innerWidth <= 768;
	const sidebar = document.getElementById('sidebar');
	const overlay = document.querySelector('.sidebar-overlay');

	if (isMobile) {
		// On mobile, ensure sidebar is closed by default unless explicitly opened
		if (!sidebar?.classList.contains('open')) {
			sidebarOpen = false;
		}
		// Remove desktop-specific classes
		sidebar?.classList.remove('collapsed');
	} else {
		// On desktop, remove mobile-specific classes
		sidebar?.classList.remove('open');
		// Remove overlay if it exists
		if (overlay) {
			overlay.classList.remove('open');
		}
		// Restore desktop sidebar state
		if (sidebar) {
			sidebar.classList.toggle('collapsed', !sidebarOpen);
		}
	}
}

// Export for use
if (typeof window !== 'undefined') {
	window.toggleSidebar = toggleSidebar;
	window.initSidebarModule = initSidebarModule;
}
