/**
 * Statistics Module
 * =================
 * Handles category statistics and visualizations
 */

/**
 * Calculate category statistics for projects
 */
function calculateProjectStats(projects) {
	if (!projects?.length) return { total: 0, categories: {}, highlights: 0 };

	const stats = {
		total: projects.length,
		highlights: projects.filter(p => p.isHighlight).length,
		hpc: projects.filter(p => p.isHPC).length,
		categories: {}
	};

	// Count by category
	projects.forEach(project => {
		if (project.category) {
			project.category.forEach(cat => {
				stats.categories[cat] = (stats.categories[cat] || 0) + 1;
			});
		}
	});

	return stats;
}

/**
 * Calculate category statistics for research
 */
function calculateResearchStats(research) {
	if (!research?.length) return { total: 0, categories: {}, highlights: 0 };

	const stats = {
		total: research.length,
		highlights: research.filter(r => r.isHighlight).length,
		hpc: research.filter(r => r.isHPC).length,
		keywords: {}
	};

	// Count by keywords
	research.forEach(item => {
		if (item.keywords) {
			item.keywords.forEach(keyword => {
				stats.keywords[keyword] = (stats.keywords[keyword] || 0) + 1;
			});
		}
	});

	return stats;
}

/**
 * Render project statistics
 */
function renderProjectStats(projects) {
	const container = document.getElementById('project-stats');
	if (!container) return;

	const stats = calculateProjectStats(projects);

	// Sort categories by count
	const sortedCategories = Object.entries(stats.categories)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8); // Top 8 categories

	container.innerHTML = `
        <div class="stats-overview">
            <div class="stat-item">
                <span class="stat-number">${stats.total}</span>
                <span class="stat-label">Projects</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.highlights}</span>
                <span class="stat-label">Highlights</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${Object.keys(stats.categories).length}</span>
                <span class="stat-label">Categories</span>
            </div>
        </div>
        <div class="stats-breakdown">
            <h4>By Category</h4>
            <div class="stats-bars">
                ${sortedCategories.map(([cat, count]) => `
                    <div class="stats-bar-item">
                        <span class="stats-bar-label">${cat}</span>
                        <div class="stats-bar-container">
                            <div class="stats-bar" style="width: ${(count / stats.total) * 100}%"></div>
                        </div>
                        <span class="stats-bar-count">${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Render research statistics
 */
function renderResearchStats(research) {
	const container = document.getElementById('research-stats');
	if (!container) return;

	const stats = calculateResearchStats(research);

	// Sort keywords by count
	const sortedKeywords = Object.entries(stats.keywords)
		.sort() // we can use (a, b) => b[1] - a[1]
		.slice(0, 8); // Top 8 keywords

	container.innerHTML = `
        <div class="stats-overview">
            <div class="stat-item">
                <span class="stat-number">${stats.total}</span>
                <span class="stat-label">Papers</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.highlights}</span>
                <span class="stat-label">Highlights</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.hpc}</span>
                <span class="stat-label">HPC Related</span>
            </div>
        </div>
        <div class="stats-breakdown">
            <h4>By Topic</h4>
            <div class="stats-tags">
                ${sortedKeywords.map(([keyword, count]) => `
                    <span class="stats-tag">
                        ${keyword}
                        <span class="stats-tag-count">${count}</span>
                    </span>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Update inline statistics (for existing stat elements)
 */
function updateInlineStats(projects, research) {
	// Projects stats
	if (projects) {
		const stats = calculateProjectStats(projects);
		const projectCount = document.getElementById('project-count');
		const highlightCount = document.getElementById('highlight-count');
		const techCount = document.getElementById('tech-count');

		if (projectCount) projectCount.textContent = stats.total;
		if (highlightCount) highlightCount.textContent = stats.highlights;
		if (techCount) techCount.textContent = Object.keys(stats.categories).length;
	}

	// Research stats
	if (research) {
		const stats = calculateResearchStats(research);
		const researchCount = document.getElementById('research-count');
		const researchHighlight = document.getElementById('research-highlight-count');
		const keywordCount = document.getElementById('keyword-count');

		if (researchCount) researchCount.textContent = stats.total;
		if (researchHighlight) researchHighlight.textContent = stats.highlights;
		if (keywordCount) keywordCount.textContent = Object.keys(stats.keywords).length;
	}
}

// Export
if (typeof window !== 'undefined') {
	window.calculateProjectStats = calculateProjectStats;
	window.calculateResearchStats = calculateResearchStats;
	window.renderProjectStats = renderProjectStats;
	window.renderResearchStats = renderResearchStats;
	window.updateInlineStats = updateInlineStats;
}
