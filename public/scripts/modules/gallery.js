/**
 * Gallery Module
 * ==============
 * Handles image gallery with categories and lightbox
 */

let galleryData = null;
let currentCategory = 'all';
let lightboxOpen = false;
let currentImageIndex = 0;

// Pagination and sorting state
let currentPage = 1;
let pageSize = 12; // Will be set from config
let sortOrder = 'random'; // 'random', 'date-desc', 'date-asc'
let shuffledIndices = []; // Store shuffled order

/**
 * Load gallery data from YAML (with JSON fallback)
 */
async function loadGalleryData() {
	try {
		// Use fetchData from yaml.js module
		galleryData = await fetchData('/public/data/gallery');
		return galleryData;
	} catch (error) {
		console.error('Error loading gallery:', error);
		return null;
	}
}

/**
 * Render category tabs
 */
function renderGalleryCategories() {
	const container = document.getElementById('gallery-categories');
	if (!container || !galleryData) return;

	container.innerHTML = galleryData.categories.map(cat => `
        <button class="gallery-category-btn ${cat.id === currentCategory ? 'active' : ''}" 
                onclick="filterGallery('${cat.id}')">
            <i class="fas ${cat.icon}"></i>
            <span>${cat.label}</span>
        </button>
    `).join('');
}

/**
 * Render gallery grid
 */
function renderGalleryGrid() {
	const container = document.getElementById('gallery-grid');
	if (!container || !galleryData) return;

	const images = getPaginatedImages();

	if (images.length === 0) {
		container.innerHTML = `
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <p>No images in this category yet.</p>
            </div>
        `;
		return;
	}

	// Get all filtered images to calculate correct index for lightbox
	const allImages = getFilteredSortedImages();
	const startIndex = (currentPage - 1) * pageSize;

	container.innerHTML = images.map((img, pageIndex) => {
		const actualIndex = startIndex + pageIndex;
		const dateParts = img.date.split('-');
		let formattedTitle = '';

		if (dateParts.length === 3) {
			const yy = dateParts[0].slice(-2); // "2026" -> "26"
			const mm = dateParts[1];           // "01"
			const dd = dateParts[2];           // "01"
			formattedTitle = `${yy}_${mm}${dd}`; // "26_0101"
		} else {
			formattedTitle = img.date;
		}

		return `
            <div class="gallery-item" onclick="openLightbox(${actualIndex})">
                <img src="${img.thumbnail || img.src}" alt="${formattedTitle}" loading="lazy">
                <div class="gallery-item-overlay">
					<span class="gallery-caption">${formattedTitle}</span>
                </div>
            </div>
        `;
	}).join('');
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Get filtered and sorted images
 */
function getFilteredSortedImages() {
	let images = galleryData.images;

	// Filter by category
	if (currentCategory !== 'all') {
		images = images.filter(img => img.category === currentCategory);
	}

	// Sort based on sortOrder
	if (sortOrder === 'random') {
		// Use shuffled indices
		if (shuffledIndices.length !== images.length) {
			shuffledIndices = shuffleArray([...Array(images.length).keys()]);
		}
		images = shuffledIndices.map(i => images[i]);
	} else if (sortOrder === 'date-desc') {
		// Newest first
		images = [...images].sort((a, b) => new Date(b.date) - new Date(a.date));
	} else if (sortOrder === 'date-asc') {
		// Oldest first
		images = [...images].sort((a, b) => new Date(a.date) - new Date(b.date));
	}

	return images;
}

/**
 * Get paginated images for current page
 */
function getPaginatedImages() {
	const images = getFilteredSortedImages();
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return images.slice(startIndex, endIndex);
}

/**
 * Get total number of pages
 */
function getTotalPages() {
	const images = getFilteredSortedImages();
	return Math.ceil(images.length / pageSize);
}

/**
 * Filter gallery by category
 */
function filterGallery(category) {
	currentCategory = category;
	currentPage = 1; // Reset to first page
	shuffledIndices = []; // Reset shuffle
	renderGalleryCategories();
	renderGalleryGrid();
	renderPaginationControls();
}

/**
 * Change page size
 */
function changePageSize(newSize) {
	pageSize = parseInt(newSize);
	currentPage = 1; // Reset to first page
	renderGalleryGrid();
	renderPaginationControls();
}

/**
 * Sort images
 */
function sortImages(order) {
	sortOrder = order;
	currentPage = 1; // Reset to first page
	if (order === 'random') {
		shuffledIndices = []; // Force new shuffle
	}
	renderGalleryGrid();
	renderPaginationControls();
}

/**
 * Navigate to next page
 */
function nextPage() {
	const totalPages = getTotalPages();
	if (currentPage < totalPages) {
		currentPage++;
		renderGalleryGrid();
		renderPaginationControls();
		// Scroll to top of gallery
		document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' });
	}
}

/**
 * Navigate to previous page
 */
function prevPage() {
	if (currentPage > 1) {
		currentPage--;
		renderGalleryGrid();
		renderPaginationControls();
		// Scroll to top of gallery
		document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' });
	}
}

/**
 * Open lightbox
 */
function openLightbox(index) {
	if (!galleryData?.config?.lightboxEnabled) return;

	const images = getFilteredSortedImages();
	currentImageIndex = index;
	const image = images[index];

	const lightbox = document.getElementById('lightbox');
	if (!lightbox) return;

	lightbox.innerHTML = `
        <div class="lightbox-backdrop" onclick="closeLightbox()"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="closeLightbox()">
                <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-prev" onclick="navigateLightbox(-1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <img src="${image.src}" alt="${image.caption}" class="lightbox-image">
            <button class="lightbox-next" onclick="navigateLightbox(1)">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="lightbox-caption">${image.caption}</div>
        </div>
    `;

	lightbox.classList.add('open');
	document.body.style.overflow = 'hidden';
	lightboxOpen = true;
}

/**
 * Close lightbox
 */
function closeLightbox() {
	const lightbox = document.getElementById('lightbox');
	if (lightbox) {
		lightbox.classList.remove('open');
		document.body.style.overflow = '';
	}
	lightboxOpen = false;
}

/**
 * Navigate lightbox
 */
function navigateLightbox(direction) {
	const images = getFilteredSortedImages();

	currentImageIndex += direction;
	if (currentImageIndex < 0) currentImageIndex = images.length - 1;
	if (currentImageIndex >= images.length) currentImageIndex = 0;

	openLightbox(currentImageIndex);
}

/**
 * Render pagination controls
 */
function renderPaginationControls() {
	const container = document.getElementById('pagination-controls');
	if (!container || !galleryData) return;

	const totalPages = getTotalPages();
	const images = getFilteredSortedImages();

	if (images.length === 0) {
		container.innerHTML = '';
		return;
	}

	// Page size selector
	const pageSizeOptions = galleryData.config?.pageSizeOptions || [4, 8, 12, 16];
	const pageSizeSelector = pageSizeOptions.map(size =>
		`<button class="page-size-btn ${pageSize === size ? 'active' : ''}" 
		         onclick="changePageSize(${size})">${size}</button>`
	).join('');

	// Sort buttons
	const sortButtons = `
		<button class="sort-btn ${sortOrder === 'random' ? 'active' : ''}" 
		        onclick="sortImages('random')" title="Random order">
			<i class="fas fa-random"></i> Random
		</button>
		<button class="sort-btn ${sortOrder === 'date-desc' ? 'active' : ''}" 
		        onclick="sortImages('date-desc')" title="Newest first">
			<i class="fas fa-sort-amount-down"></i> Newest
		</button>
		<button class="sort-btn ${sortOrder === 'date-asc' ? 'active' : ''}" 
		        onclick="sortImages('date-asc')" title="Oldest first">
			<i class="fas fa-sort-amount-up"></i> Oldest
		</button>
	`;

	// Pagination navigation
	const prevDisabled = currentPage === 1 ? 'disabled' : '';
	const nextDisabled = currentPage === totalPages ? 'disabled' : '';

	const paginationNav = `
		<button class="pagination-btn" onclick="prevPage()" ${prevDisabled}>
			<i class="fas fa-chevron-left"></i> Previous
		</button>
		<span class="page-indicator">Page ${currentPage} of ${totalPages}</span>
		<button class="pagination-btn" onclick="nextPage()" ${nextDisabled}>
			Next <i class="fas fa-chevron-right"></i>
		</button>
	`;

	container.innerHTML = `
		<div class="gallery-controls">
			<div class="control-group">
				<label><i class="fas fa-th"></i> Items per page:</label>
				<div class="page-size-selector">${pageSizeSelector}</div>
			</div>
			<div class="control-group">
				<label><i class="fas fa-sort"></i> Sort:</label>
				<div class="sort-buttons">${sortButtons}</div>
			</div>
		</div>
		<div class="pagination-nav">${paginationNav}</div>
	`;
}


/**
 * Initialize gallery
 */
async function initGalleryModule() {
	await loadGalleryData();

	// Set page size from config
	if (galleryData?.config?.defaultPageSize) {
		pageSize = galleryData.config.defaultPageSize;
	}

	renderGalleryCategories();
	renderGalleryGrid();
	renderPaginationControls();

	// Keyboard navigation
	document.addEventListener('keydown', (e) => {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') navigateLightbox(-1);
		if (e.key === 'ArrowRight') navigateLightbox(1);
	});
}

// Export
if (typeof window !== 'undefined') {
	window.filterGallery = filterGallery;
	window.openLightbox = openLightbox;
	window.closeLightbox = closeLightbox;
	window.navigateLightbox = navigateLightbox;
	window.initGalleryModule = initGalleryModule;
	window.changePageSize = changePageSize;
	window.sortImages = sortImages;
	window.nextPage = nextPage;
	window.prevPage = prevPage;
}
