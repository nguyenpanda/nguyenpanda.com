/**
 * NguyenPanda Web - Utility Functions
 * ===================================
 * Reusable utility functions for DOM manipulation, formatting, and animations
 */

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Sort projects by end date (newest first, ongoing projects at top)
 * @param {Array} projects - Array of project objects
 * @returns {Array} Sorted array
 */
function sortByDate(items) {
    return [...items].sort((a, b) => {
        const aEnd = a.endDate ? new Date(a.endDate) : new Date(9999, 11, 31);
        const bEnd = b.endDate ? new Date(b.endDate) : new Date(9999, 11, 31);
        return bEnd - aEnd;
    });
}

/**
 * Format date string to human-readable format
 * @param {string|null} dateStr - ISO date string or null
 * @returns {string} Formatted date or "Present"
 */
function formatDate(dateStr) {
    if (!dateStr) return "Present";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Get relative time string (e.g., "2 months ago")
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative time string
 */
function getRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "upcoming";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// ============================================================================
// DOM UTILITIES
// ============================================================================

/**
 * Shorthand for querySelector
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null}
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Shorthand for querySelectorAll
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {NodeList}
 */
function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Create an element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set
 * @param {Array|string} children - Child elements or text content
 * @returns {Element}
 */
function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });

    if (typeof children === 'string') {
        el.innerHTML = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                el.appendChild(child);
            }
        });
    }

    return el;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generate a slug from text
 * @param {string} text - Text to slugify
 * @returns {string}
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector
 * @param {number} offset - Offset from top
 */
function scrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Typewriter effect for text
 * @param {Element} element - Target element
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed in ms
 * @returns {Promise}
 */
function typeWriter(element, text, speed = 30) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

/**
 * Scramble text effect (matrix-like)
 * @param {Element} element - Target element
 * @param {string} finalText - Final text to display
 * @param {number} duration - Effect duration in ms
 */
function scrambleText(element, finalText, duration = 1000) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const iterations = Math.floor(duration / 30);
    let iteration = 0;

    const interval = setInterval(() => {
        element.textContent = finalText
            .split("")
            .map((char, index) => {
                if (index < iteration) return finalText[index];
                if (char === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        iteration += finalText.length / iterations;

        if (iteration >= finalText.length) {
            clearInterval(interval);
            element.textContent = finalText;
        }
    }, 30);
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Get URL parameter value
 * @param {string} name - Parameter name
 * @returns {string|null}
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Set URL parameter without reload
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setUrlParam(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

// ============================================================================
// FILTER UTILITIES
// ============================================================================

/**
 * Filter array by property value
 * @param {Array} items - Array to filter
 * @param {string} prop - Property name
 * @param {*} value - Value to match
 * @returns {Array}
 */
function filterBy(items, prop, value) {
    if (value === 'all' || !value) return items;
    return items.filter(item => {
        const propValue = item[prop];
        if (Array.isArray(propValue)) {
            return propValue.includes(value);
        }
        return propValue === value;
    });
}

/**
 * Get unique values from array of objects
 * @param {Array} items - Array of objects
 * @param {string} prop - Property to extract
 * @returns {Array}
 */
function getUniqueValues(items, prop) {
    const values = items.flatMap(item => {
        const value = item[prop];
        return Array.isArray(value) ? value : [value];
    });
    return [...new Set(values)].filter(Boolean);
}

// ============================================================================
// EXPORTS (for module usage if needed)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sortByDate,
        formatDate,
        getRelativeTime,
        $,
        $$,
        createElement,
        truncate,
        escapeHtml,
        slugify,
        scrollTo,
        typeWriter,
        scrambleText,
        delay,
        getUrlParam,
        setUrlParam,
        filterBy,
        getUniqueValues
    };
}
