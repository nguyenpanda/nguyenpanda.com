/**
 * NguyenPanda Web - Main Application Script
 * ==========================================
 * Handles data loading, rendering, and interactive terminal
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

let siteData = null;
let currentPath = '/home/nguyenpanda';
let cmdHistory = [];
let historyIndex = -1;

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load site data from YAML file (with JSON fallback)
 * @returns {Promise<Object>}
 */
async function loadSiteData() {
    try {
        // Use fetchData from yaml.js module (YAML with JSON fallback)
        siteData = await fetchData('/public/data/site');
        return siteData;
    } catch (error) {
        console.error('Error loading site data:', error);
        // Fallback to minimal data
        return {
            meta: { title: 'nguyenpanda', subtitle: 'HPC Researcher' },
            tags: [],
            about: ['Data loading failed. Please refresh.'],
            projects: [],
            research: [],
            social: []
        };
    }
}

// ============================================================================
// PAGE DETECTION
// ============================================================================

const pageId = document.body.id || 'page-unknown';
const isHome = pageId === 'page-home';
const isArchive = pageId === 'page-archive';
const isProjects = pageId === 'page-projects';
const isResearch = pageId === 'page-research';
const isHPC = pageId === 'page-hpc';

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function renderTags() {
    const container = $('#tags-container');
    if (!container || !siteData?.tags) return;

    container.innerHTML = siteData.tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
}

function renderAbout() {
    const container = $('#about-content');
    if (!container || !siteData?.about) return;

    container.innerHTML = siteData.about
        .map(para => `<p>${para}</p>`)
        .join('');
}

function renderProjects(options = {}) {
    const container = $('#projects-container');
    if (!container || !siteData?.projects) return;

    const {
        highlightOnly = false,
        hpcOnly = false,
        category = null,
        columns = getUrlParam('cols') || siteData.config?.defaultGridColumns || 3
    } = options;

    // Set grid columns via CSS variable
    container.style.setProperty('--grid-columns', columns);

    // Sort and filter projects
    let projects = sortByDate(siteData.projects);

    if (highlightOnly) {
        projects = projects.filter(p => p.isHighlight);
    }
    if (hpcOnly) {
        projects = projects.filter(p => p.isHPC);
    }
    if (category) {
        projects = projects.filter(p => p.category?.includes(category));
    }

    container.innerHTML = projects.map(project => `
        <div class="project-item" onclick="window.open('${project.url}', '_blank')">
            <div class="project-top">
                <div class="folder-icon"><i class="fas ${project.icon}"></i></div>
                <div class="project-links">
                    ${project.demo ? `<a href="${project.demo}" target="_blank" title="Live Demo" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    <a href="${project.url}" target="_blank" title="View Code" onclick="event.stopPropagation()"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <h3>${project.title}</h3>
            <p class="project-date">
                <i class="far fa-calendar-alt"></i>
                ${formatDate(project.startDate)} — ${formatDate(project.endDate)}
            </p>
            <p class="project-description">${project.description}</p>
            <div class="tech-stack">
                ${project.tech.sort().map(tech => `<span>${tech}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderResearch(options = {}) {
    const container = $('#research-container');
    if (!container || !siteData?.research) return;

    const { highlightOnly = false, hpcOnly = false } = options;

    let research = sortByDate(siteData.research);

    if (highlightOnly) {
        research = research.filter(r => r.isHighlight);
    }
    if (hpcOnly) {
        research = research.filter(r => r.isHPC);
    }

    container.innerHTML = research.map(item => `
        <div class="research-item">
            <div class="research-icon"><i class="fas fa-file-alt"></i></div>
            <div class="research-info">
                <h4>
                    ${item.link
            ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>`
            : `<span>${item.title}</span>`
        }
                </h4>
                <span class="venue">${item.venue}</span>
                <span class="divider">|</span>
                <span class="date">${formatDate(item.date)}</span>
                ${item.keywords ? `
                    <div class="research-keywords">
                        ${item.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderSocial() {
    const container = $('.social-section');
    if (!container || !siteData?.social) return;

    container.innerHTML = siteData.social.map(social => `
        <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="social-btn ${social.class}">
            <i class="${social.icon}"></i> ${social.platform}
        </a>
    `).join('');
}

function renderHPCAreas() {
    const container = $('#hpc-areas-container');
    if (!container || !siteData?.hpc?.areas) return;

    container.innerHTML = siteData.hpc.areas.map(area => `
        <div class="hpc-area-card">
            <div class="hpc-area-icon"><i class="fas ${area.icon}"></i></div>
            <h3>${area.title}</h3>
            <p>${area.description}</p>
            <div class="hpc-keywords">
                ${area.keywords.map(k => `<span>${k}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderAffiliations() {
    const container = $('#affiliations-container');
    if (!container || !siteData?.hpc?.affiliations) return;

    container.innerHTML = siteData.hpc.affiliations.map(aff => `
        <a href="${aff.url}" target="_blank" rel="noopener noreferrer" class="affiliation-card">
            <h4>${aff.name}</h4>
            <p class="full-name">${aff.fullName}</p>
            <span class="role">${aff.role}</span>
        </a>
    `).join('');
}

function renderColumnSelector() {
    const container = $('#column-selector');
    if (!container) return;

    const currentCols = getUrlParam('cols') || siteData?.config?.defaultGridColumns || 3;

    container.innerHTML = `
        <label>Grid Columns:</label>
        <div class="column-buttons">
            ${[1, 2, 3, 4].map(n => `
                <button class="${n == currentCols ? 'active' : ''}" onclick="setGridColumns(${n})">${n}</button>
            `).join('')}
        </div>
    `;
}

function setGridColumns(n) {
    setUrlParam('cols', n);
    const container = $('#projects-container');
    if (container) {
        container.style.setProperty('--grid-columns', n);
    }
    // Update selector buttons
    $$('#column-selector button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent == n);
    });
}

function renderFilters() {
    const container = $('#filter-container');
    if (!container || !siteData?.projects) return;

    const categories = getUniqueValues(siteData.projects, 'category').sort();
    const currentFilter = getUrlParam('filter') || 'all';

    container.innerHTML = `
        <button class="${currentFilter === 'all' ? 'active' : ''}" onclick="filterProjects('all')">All</button>
        ${categories.map(cat => `
            <button class="${currentFilter === cat ? 'active' : ''}" onclick="filterProjects('${cat}')">${cat}</button>
        `).join('')}
    `;
}

function filterProjects(category) {
    setUrlParam('filter', category);
    renderProjects({ category: category === 'all' ? null : category });
    // Update filter buttons
    $$('#filter-container button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === category.toLowerCase() || (category === 'all' && btn.textContent === 'All'));
    });
}

// ============================================================================
// TEXT EFFECTS
// ============================================================================

function initTitleScramble() {
    const title = $('#main-title');
    if (!title) return;

    title.addEventListener('mouseover', () => {
        scrambleText(title, title.dataset.value || title.textContent);
    });
}

function initTypewriter() {
    const element = $('#typing-subtitle');
    if (!element || !siteData?.meta?.subtitle) return;

    typeWriter(element, siteData.meta.subtitle, siteData.config?.typingSpeed || 30);
}

// ============================================================================
// TERMINAL SYSTEM
// ============================================================================

const terminalCommands = {
    help: {
        description: 'Display available commands',
        usage: 'help [command]',
        exec: (args) => {
            if (args[0]) {
                const cmd = terminalCommands[args[0]];
                if (cmd) {
                    return [
                        { text: `${args[0]} - ${cmd.description}`, type: 'info' },
                        { text: `Usage: ${cmd.usage}`, type: 'neutral' }
                    ];
                }
                return [{ text: `No manual entry for ${args[0]}`, type: 'error' }];
            }

            const cmdList = Object.entries(terminalCommands)
                .map(([name, cmd]) => `  <span class="highlight" style="padding-left: 2em;">${name.padEnd(12)}</span> ${cmd.description}`)
                .join('&#9;</br>&#9;');

            return [
                { text: 'Available commands:', type: 'info' },
                { text: cmdList, type: 'neutral' }
            ];
        }
    },

    ls: {
        description: 'List directory contents',
        usage: 'ls [-la] [path]',
        exec: (args) => {
            const showDetails = args.includes('-la') || args.includes('-l');
            const path = args.filter(a => !a.startsWith('-'))[0] || currentPath;
            const fs = siteData?.terminal?.filesystem || {};

            const contents = fs[path];
            if (!contents) {
                return [{ text: `ls: cannot access '${path}': No such file or directory`, type: 'error' }];
            }

            if (showDetails) {
                const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                const lines = contents.map(item => {
                    const isDir = !item.includes('.');
                    return `${isDir ? 'd' : '-'}rwxr-xr-x  guest  guest  ${isDir ? '4096' : ' 512'}  ${now}  ${item}`;
                });
                return lines.map(l => ({ text: l, type: 'neutral' }));
            }

            return [{ text: contents.join('  '), type: 'success' }];
        }
    },

    cd: {
        description: 'Change directory',
        usage: 'cd [directory]',
        exec: (args) => {
            if (!args[0] || args[0] === '~') {
                currentPath = '/home/nguyenpanda';
                return [{ text: `Changed to ${currentPath}`, type: 'success' }];
            }

            const target = args[0].toLowerCase();
            const fs = siteData?.terminal?.filesystem || {};

            if (target === '..') {
                const parts = currentPath.split('/').filter(Boolean);
                parts.pop();
                currentPath = '/' + parts.join('/') || '/';
                return [{ text: `Changed to ${currentPath}`, type: 'neutral' }];
            }

            // Check if it's an absolute path
            if (target.startsWith('/')) {
                if (fs[target]) {
                    currentPath = target;
                    return [{ text: `Changed to ${currentPath}`, type: 'success' }];
                }
            }

            // Try relative path
            const newPath = currentPath === '/' ? `/${target}` : `${currentPath}/${target}`;
            if (fs[newPath]) {
                currentPath = newPath;
                return [{ text: `Changed to ${currentPath}`, type: 'success' }];
            }

            // Special navigation commands
            if (['projects', 'research'].includes(target)) {
                const element = document.getElementById(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    return [{ text: `Navigating to /${target}...`, type: 'success' }];
                }
            }

            return [{ text: `bash: cd: ${target}: No such file or directory`, type: 'error' }];
        }
    },

    pwd: {
        description: 'Print working directory',
        usage: 'pwd',
        exec: () => [{ text: currentPath, type: 'neutral' }]
    },

    cat: {
        description: 'Display file contents',
        usage: 'cat [file]',
        exec: (args) => {
            const file = args[0];
            if (!file) return [{ text: 'Usage: cat [filename]', type: 'error' }];

            if (file === 'about.txt' && siteData?.about) {
                return siteData.about.map(p => ({ text: p.replace(/<[^>]+>/g, ''), type: 'neutral' }));
            }

            if (file === 'contact.md' && siteData?.social) {
                const email = siteData.social.find(s => s.platform === 'Email');
                const github = siteData.social.find(s => s.platform === 'GitHub');
                return [
                    { text: `Email: ${email?.url.replace('mailto:', '') || 'N/A'}`, type: 'neutral' },
                    { text: `GitHub: ${github?.url || 'N/A'}`, type: 'neutral' }
                ];
            }

            if (file === '.bashrc') {
                return [
                    { text: '# .bashrc - nguyenpanda configuration', type: 'neutral' },
                    { text: 'export PS1="\\u@\\h:\\w\\$ "', type: 'neutral' },
                    { text: 'alias ll="ls -la"', type: 'neutral' },
                    { text: 'alias projects="cd /var/www/projects"', type: 'neutral' }
                ];
            }

            const fs = siteData?.terminal?.filesystem || {};
            const contents = fs[currentPath];
            if (contents?.includes(file) && !file.includes('.')) {
                return [{ text: `cat: ${file}: Is a directory`, type: 'error' }];
            }

            return [{ text: `cat: ${file}: No such file or directory`, type: 'error' }];
        }
    },

    // echo: {
    //     description: 'Display a line of text',
    //     usage: 'echo [text]',
    //     exec: (args) => [{ text: args.join(' ') || '', type: 'neutral' }]
    // },

    // whoami: {
    //     description: 'Print current user',
    //     usage: 'whoami',
    //     exec: () => [{ text: `${siteData?.terminal?.user || 'guest'}@${siteData?.terminal?.hostname || 'nguyenpanda'}_web_client`, type: 'neutral' }]
    // },

    // hostname: {
    //     description: 'Print system hostname',
    //     usage: 'hostname',
    //     exec: () => [{ text: siteData?.terminal?.hostname || 'nguyenpanda', type: 'neutral' }]
    // },

    // date: {
    //     description: 'Display current date and time',
    //     usage: 'date',
    //     exec: () => [{ text: new Date().toString(), type: 'neutral' }]
    // },

    // uptime: {
    //     description: 'Show system uptime',
    //     usage: 'uptime',
    //     exec: () => {
    //         const now = new Date();
    //         const boot = new Date(now.getTime() - Math.random() * 86400000 * 30);
    //         const upMs = now - boot;
    //         const days = Math.floor(upMs / 86400000);
    //         const hours = Math.floor((upMs % 86400000) / 3600000);
    //         return [{ text: ` ${now.toTimeString().split(' ')[0]} up ${days} days, ${hours}:${Math.floor(Math.random() * 60)},  1 user,  load average: 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}, 0.${Math.floor(Math.random() * 99)}`, type: 'neutral' }];
    //     }
    // },

    // uname: {
    //     description: 'Print system information',
    //     usage: 'uname [-a]',
    //     exec: (args) => {
    //         if (args.includes('-a')) {
    //             return [{ text: 'NguyenPandaOS 2.0.0 nguyenpanda 5.4.0-generic #1 SMP Web x86_64 GNU/Linux', type: 'neutral' }];
    //         }
    //         return [{ text: 'NguyenPandaOS', type: 'neutral' }];
    //     }
    // },

    neofetch: {
        description: 'Display system information with ASCII art',
        usage: 'neofetch',
        exec: () => {
            const ascii = `
<span class="term-ascii">
    ██████╗  █████╗ ███╗   ██╗██████╗  █████╗ 
    ██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔══██╗
    ██████╔╝███████║██╔██╗ ██║██║  ██║███████║
    ██╔═══╝ ██╔══██║██║╚██╗██║██║  ██║██╔══██║
    ██║     ██║  ██║██║ ╚████║██████╔╝██║  ██║
    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝
</span>
    <span class="highlight">OS:</span> NguyenPanda OS 2.0 (Web)
    <span class="highlight">Host:</span> ${siteData?.terminal?.hostname || 'nguyenpanda'}
    <span class="highlight">Kernel:</span> PandaHttpd 1.0.0
    <span class="highlight">Shell:</span> bash 2.0.0 (simulated)
    <span class="highlight">Resolution:</span> ${window.innerWidth}x${window.innerHeight}
    <span class="highlight">Theme:</span> Cyberpunk Terminal
    <span class="highlight">CPU:</span> Web Worker @ ${navigator.hardwareConcurrency || 4} cores
    <span class="highlight">Memory:</span> Unlimited (Browser)`;
            return [{ text: ascii, type: 'ascii' }];
        }
    },

    clear: {
        description: 'Clear the terminal',
        usage: 'clear',
        exec: () => {
            const output = $('#terminal-output');
            if (output) output.innerHTML = '';
            return [];
        }
    },

    // history: {
    //     description: 'Show command history',
    //     usage: 'history',
    //     exec: () => {
    //         if (cmdHistory.length === 0) {
    //             return [{ text: 'No commands in history', type: 'neutral' }];
    //         }
    //         return cmdHistory.map((cmd, i) => ({
    //             text: `  ${(i + 1).toString().padStart(4)}  ${cmd}`,
    //             type: 'neutral'
    //         }));
    //     }
    // },

    man: {
        description: 'Display manual for command',
        usage: 'man [command]',
        exec: (args) => {
            if (!args[0]) {
                return [{ text: 'What manual page do you want?', type: 'error' }];
            }
            const cmd = terminalCommands[args[0]];
            if (!cmd) {
                return [{ text: `No manual entry for ${args[0]}`, type: 'error' }];
            }
            return [
                { text: `NAME`, type: 'info' },
                { text: `<span style="padding-left: 2em;">${args[0]} - ${cmd.description}</span>`, type: 'neutral' },
                { text: '', type: 'neutral' },
                { text: `SYNOPSIS`, type: 'info' },
                { text: `<span style="padding-left: 2em;">${cmd.usage}</span>`, type: 'neutral' }
            ];
        }
    },

    // ping: {
    //     description: 'Ping a host (simulated)',
    //     usage: 'ping [host]',
    //     exec: async (args, printFn) => {
    //         const host = args[0] || 'google.com';
    //         printFn({ text: `PING ${host} (${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}): 56 data bytes`, type: 'neutral' });

    //         for (let i = 0; i < 3; i++) {
    //             await delay(500);
    //             const time = (Math.random() * 50 + 10).toFixed(3);
    //             printFn({ text: `64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${time} ms`, type: 'success' });
    //         }

    //         return [{ text: `\n--- ${host} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`, type: 'info' }];
    //     }
    // },

    // curl: {
    //     description: 'Transfer data from URL (simulated)',
    //     usage: 'curl [url]',
    //     exec: (args) => {
    //         const url = args[0];
    //         if (!url) return [{ text: 'curl: no URL specified', type: 'error' }];
    //         return [
    //             { text: `  % Total    % Received % Xferd  Speed   Time`, type: 'neutral' },
    //             { text: `100  1024  100  1024    0     0   512k      0 --:--:-- --:--:-- --:--:-- 512k`, type: 'neutral' },
    //             { text: `<html><body>Simulated response from ${url}</body></html>`, type: 'success' }
    //         ];
    //     }
    // },

    tree: {
        description: 'Display directory tree',
        usage: 'tree [path]',
        exec: (args) => {
            const fs = siteData?.terminal?.filesystem || {};
            const path = args[0] || currentPath;

            function buildTree(p, prefix = '') {
                const contents = fs[p];
                if (!contents) return [];

                const lines = [];
                contents.forEach((item, index) => {
                    const isLast = index === contents.length - 1;
                    const connector = isLast ? '└── ' : '├── ';
                    lines.push(prefix + connector + item);

                    const childPath = p === '/' ? `/${item}` : `${p}/${item}`;
                    if (fs[childPath]) {
                        const childPrefix = prefix + (isLast ? '    ' : '│   ');
                        lines.push(...buildTree(childPath, childPrefix));
                    }
                });
                return lines;
            }

            const treeLines = buildTree(path);
            return [
                { text: path, type: 'info' },
                ...treeLines.map(l => ({ text: l, type: 'neutral' }))
            ];
        }
    },

    skills: {
        description: 'List technical skills',
        usage: 'skills',
        exec: () => {
            const skills = siteData?.skills || {};
            const lines = [];

            if (skills.languages) {
                lines.push({ text: '<span>Languages:</span>', type: 'neutral' });
                lines.push({ text: '<span style="padding-left: 2em;">' + skills.languages.join(', ') + '</span>', type: 'success' });
            }
            if (skills.frameworks) {
                lines.push({ text: '<span>Frameworks:</span>', type: 'neutral' });
                lines.push({ text: '<span style="padding-left: 2em;">' + skills.frameworks.join(', ') + '</span>', type: 'success' });
            }
            if (skills.tools) {
                lines.push({ text: '<span>Tools:</span>', type: 'neutral' });
                lines.push({ text: '<span style="padding-left: 2em;">' + skills.tools.join(', ') + '</span>', type: 'success' });
            }
            if (skills.concepts) {
                lines.push({ text: '<span>Concepts:</span>', type: 'neutral' });
                lines.push({ text: '<span style="padding-left: 2em;">' + skills.concepts.join(', ') + '</span>', type: 'success' });
            }

            return lines;
        }
    },

    contact: {
        description: 'Show contact information',
        usage: 'contact',
        exec: () => {
            const social = siteData?.social || [];
            return [
                { text: '\n=== Contact Information ===\n', type: 'info' },
                ...social.map(s => ({
                    text: `<span style="padding-left: 2em;" class="highlight">${s.platform.padEnd(12)}</span>: ${s.url}`,
                    type: 'neutral'
                }))
            ];
        }
    },

    projects: {
        description: 'List all projects',
        usage: 'projects',
        exec: () => {
            const projects = siteData?.projects || [];
            return [
                { text: '\n=== Projects ===\n', type: 'info' },
                ...projects.map(p => ({
                    text: `<span class="highlight">${p.title}</span> 
                    <span class="divider">|</span>
                    <span class="project-date-inline">
                        ${formatDate(p.startDate)} - ${formatDate(p.endDate)}
                    </span>
                    </br>
                    <span style="padding-left: 2em;">${p.description}</span>
                    </br>
                    </br>`,
                    type: 'neutral'
                }))
            ];
        }
    },

    research: {
        description: 'List research papers',
        usage: 'research',
        exec: () => {
            const research = siteData?.research || [];
            return [
                { text: '\n=== Research ===\n', type: 'info' },
                ...research.map(r => ({
                    text: `  <span class="highlight">${r.title}</span>\n    ${r.venue}`,
                    type: 'neutral'
                }))
            ];
        }
    },

    open: {
        description: 'Open a page or URL',
        usage: 'open [target]',
        exec: (args) => {
            const target = args[0]?.toLowerCase();

            const pages = {
                'home': '/',
                'projects': '/projects',
                'research': '/research',
                'hpc': '/hpc',
                'archive': '/archive',
            };

            if (pages[target]) {
                window.location.href = pages[target];
                return [{ text: `Opening ${target}...`, type: 'success' }];
            }

            if (target?.startsWith('http')) {
                window.open(target, '_blank');
                return [{ text: `Opening ${target} in new tab...`, type: 'success' }];
            }

            return [{ text: `Unknown target: ${target}. Try: ${Object.keys(pages).join(', ')}`, type: 'error' }];
        }
    },

    // sudo: {
    //     description: 'Execute as superuser',
    //     usage: 'sudo [command]',
    //     exec: () => [
    //         { text: 'guest is not in the sudoers file.', type: 'error' },
    //         { text: 'This incident will be reported.', type: 'error' }
    //     ]
    // },

    exit: {
        description: 'Close terminal session',
        usage: 'exit',
        exec: () => {
            window.location.href = '/';
            return [{ text: 'Goodbye!', type: 'success' }];
        }
    },

    cowsay: {
        description: 'Display message with ASCII cow',
        usage: 'cowsay [message]',
        exec: (args) => {
            const msg = args.join(' ') || 'Moo!';
            const border = '_'.repeat(msg.length + 2);
            const cow = `
 ${border}
< ${msg} >
 ${'-'.repeat(msg.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
            return [{ text: cow, type: 'ascii' }];
        }
    },

    // matrix: {
    //     description: 'Enter the Matrix',
    //     usage: 'matrix',
    //     exec: async (args, printFn) => {
    //         const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';

    //         for (let i = 0; i < 10; i++) {
    //             let line = '';
    //             for (let j = 0; j < 60; j++) {
    //                 line += chars[Math.floor(Math.random() * chars.length)];
    //             }
    //             printFn({ text: `<span style="color: #00ff00">${line}</span>`, type: 'ascii' });
    //             await delay(100);
    //         }

    //         return [{ text: '\nWake up, Neo...', type: 'success' }];
    //     }
    // }
};

// Terminal initialization and handling
function initTerminal() {
    const input = $('#cli-input');
    const outputDiv = $('#terminal-output');
    const terminalBox = $('#terminal');

    if (!terminalBox || !input) return;

    // Print MOTD
    if (siteData?.terminal?.motd) {
        siteData.terminal.motd.forEach(line => {
            printOutput({ text: line, type: 'ascii' });
        });
    }

    // Click to focus
    terminalBox.addEventListener('click', () => input.focus());

    // Handle input
    input.addEventListener('keydown', async function (e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++;
                input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = cmdHistory[cmdHistory.length - 1 - historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // Tab completion
            const partial = input.value.trim().split(' ').pop();
            const matches = Object.keys(terminalCommands).filter(cmd => cmd.startsWith(partial));
            if (matches.length === 1) {
                const words = input.value.trim().split(' ');
                words.pop();
                words.push(matches[0]);
                input.value = words.join(' ') + ' ';
            } else if (matches.length > 1) {
                printOutput({ text: `${siteData?.terminal?.user || 'guest'}@${siteData?.terminal?.hostname || 'nguyenpanda'}:${currentPath}$ ${input.value}`, type: 'neutral' });
                printOutput({ text: matches.join('  '), type: 'info' });
            }
        } else if (e.key === 'Enter') {
            const fullCommand = input.value.trim();

            if (fullCommand) {
                cmdHistory.push(fullCommand);
                historyIndex = -1;
            }

            const args = fullCommand.split(/\s+/);
            const command = args[0]?.toLowerCase();

            printOutput({ text: `${siteData?.terminal?.user || 'guest'}@${siteData?.terminal?.hostname || 'nguyenpanda'}:${currentPath}$ ${input.value}`, type: 'neutral' });
            input.value = '';

            if (command) {
                await handleCommand(command, args.slice(1));
            }

            setTimeout(() => {
                outputDiv.scrollTop = outputDiv.scrollHeight;
            }, 10);
        }
    });
}

function printOutput(output) {
    const outputDiv = $('#terminal-output');
    if (!outputDiv) return;

    const div = document.createElement('div');
    div.innerHTML = output.text;

    switch (output.type) {
        case 'success': div.className = 'term-success'; break;
        case 'error': div.className = 'term-error'; break;
        case 'info': div.className = 'term-info'; break;
        case 'ascii': div.className = 'term-ascii'; break;
    }

    outputDiv.appendChild(div);
}

async function handleCommand(cmd, args) {
    const command = terminalCommands[cmd];

    if (!command) {
        printOutput({ text: `Command not found: ${cmd}. Type 'help' for available commands.`, type: 'error' });
        return;
    }

    try {
        const results = await command.exec(args, printOutput);
        if (results) {
            results.forEach(output => printOutput(output));
        }
    } catch (error) {
        printOutput({ text: `Error executing command: ${error.message}`, type: 'error' });
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load data
    await loadSiteData();

    // Common renders
    renderTags();
    renderSocial();

    // Page-specific renders
    if (isHome) {
        renderAbout();
        renderProjects({ highlightOnly: true });
        renderResearch({ highlightOnly: true });
        initTitleScramble();
        initTypewriter();
    }

    if (isArchive) {
        renderProjects();
        renderResearch();
    }

    if (isProjects) {
        renderColumnSelector();
        renderFilters();
        renderProjects();
    }

    if (isResearch) {
        renderResearch();
    }

    if (isHPC) {
        renderHPCAreas();
        renderAffiliations();
        renderProjects({ hpcOnly: true });
        renderResearch({ hpcOnly: true });
    }

    // Initialize terminal if present
    initTerminal();
});