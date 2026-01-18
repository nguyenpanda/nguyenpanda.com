/**
 * YAML Utility Module
 * ===================
 * Provides YAML parsing functionality using js-yaml library
 * Since browsers don't natively parse YAML, we load js-yaml from CDN
 */

// Load js-yaml library dynamically
let jsYamlLoaded = false;

/**
 * Load the js-yaml library from CDN
 */
async function loadYamlLibrary() {
	if (jsYamlLoaded && window.jsyaml) return true;

	return new Promise((resolve, reject) => {
		// Check if already loaded
		if (window.jsyaml) {
			jsYamlLoaded = true;
			resolve(true);
			return;
		}

		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';
		script.async = true;

		script.onload = () => {
			jsYamlLoaded = true;
			console.log('js-yaml library loaded successfully');
			resolve(true);
		};

		script.onerror = () => {
			console.error('Failed to load js-yaml library');
			reject(new Error('Failed to load js-yaml library'));
		};

		document.head.appendChild(script);
	});
}

/**
 * Fetch and parse a YAML file
 * @param {string} url - Path to the YAML file
 * @returns {Promise<Object>} Parsed YAML data
 */
async function fetchYaml(url) {
	try {
		// Ensure js-yaml is loaded
		await loadYamlLibrary();

		// Fetch the YAML file
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status}`);
		}

		const yamlText = await response.text();

		// Parse YAML
		const data = window.jsyaml.load(yamlText);
		return data;
	} catch (error) {
		console.error(`Error loading YAML file ${url}:`, error);
		throw error;
	}
}

/**
 * Fetch and parse YAML with fallback to JSON
 * This allows gradual migration from JSON to YAML
 * @param {string} basePath - Base path without extension
 * @returns {Promise<Object>} Parsed data
 */
async function fetchData(basePath) {
	const yamlPath = basePath + '.yaml';
	const jsonPath = basePath + '.json';

	try {
		// Try YAML first
		return await fetchYaml(yamlPath);
	} catch (yamlError) {
		console.warn(`YAML not found at ${yamlPath}, trying JSON fallback...`);
		try {
			// Fallback to JSON
			const response = await fetch(jsonPath);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${jsonPath}: ${response.status}`);
			}
			return await response.json();
		} catch (jsonError) {
			console.error(`Failed to load data from ${basePath}:`, jsonError);
			throw jsonError;
		}
	}
}

// Export for use
if (typeof window !== 'undefined') {
	window.loadYamlLibrary = loadYamlLibrary;
	window.fetchYaml = fetchYaml;
	window.fetchData = fetchData;
}

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		loadYamlLibrary,
		fetchYaml,
		fetchData
	};
}
