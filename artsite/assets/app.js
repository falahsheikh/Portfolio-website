// ============================================================
// ENGINE — you shouldn't need to edit this file.
// Your content (albums, writing, GIFs) lives in config.js.
// ============================================================

// Resolve a config path like './gifs/x.gif' to an absolute URL against the
// page. GIF paths are written relative to art.html but get read back through
// CSS variables in styles.css (a different folder); absolute URLs make them
// resolve the same from either place.
const assetUrl = (path) => new URL(path, document.baseURI).href;

// Apply header GIF
const headerGifEl = document.querySelector('.header-gif');
headerGifEl.style.setProperty('--header-gif', `url("${assetUrl(CONFIG.headerGif)}")`);
headerGifEl.style.backgroundImage = `url("${assetUrl(CONFIG.headerGif)}")`;

// Process albums and add auto-numbering
const albums = CONFIG.albums.map((album, index) => {
    const processedAlbum = {
        id: album.title.toLowerCase().replace(/\s+/g, '-'),
        number: String(index + 1).padStart(2, '0'),
        title: album.title,
        gif: album.gif || CONFIG.defaultGif,
        folder: album.folder,
        writings: album.writings || [],
        images: album.images // Use pre-defined images if provided
    };
    return processedAlbum;
});

// --- modal + navigation state ---
let currentAlbumId = '';
let currentIndex = 0;
let currentItems = [];
let zoomLevel = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

// Setup about button click listener - TOGGLE functionality
document.getElementById('about-btn').addEventListener('click', function(event) {
    event.stopPropagation();
    const popup = document.getElementById('about-popup');
    popup.classList.toggle('show');
});

// Close popup when clicking outside
document.addEventListener('click', function(event) {
    const popup = document.getElementById('about-popup');
    const aboutBtn = document.getElementById('about-btn');
    
    if (popup && !aboutBtn.contains(event.target)) {
        popup.classList.remove('show');
    }
});

async function init() {
    // Auto-load images for any album that points at a folder
    // (skip if the album already lists its images explicitly).
    for (let album of albums) {
        if (album.folder && !album.images) {
            album.images = await loadImagesFromFolder(album);
        }
        album.images = album.images || [];
    }

    // Count writing and images together -- everything is a "work".
    albums.forEach(album => {
        const total = album.images.length + album.writings.length;
        album.count = `${total} ${total === 1 ? 'work' : 'works'}`;
    });
    
    generateIndexView();
    generateAlbumViews();
    setupEventListeners();
}

// Image file types we treat as artwork.
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const isImageFile = (name) => IMAGE_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));

// Are we previewing locally rather than on the published site?
function isLocalPreview() {
    return location.protocol === 'file:' ||
           ['localhost', '127.0.0.1', ''].includes(location.hostname);
}

// Shape a list of file names into the { path, filename } objects the gallery uses.
function toImageEntries(folder, names) {
    return [...new Set(names)]
        .filter(isImageFile)
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({ path: `${folder}/${name}`, filename: name }));
}

// Auto-discover every image in an album's folder, so adding art is just a matter of
// dropping files into the folder and pushing -- no need to list paths by hand.
async function loadImagesFromFolder(album) {
    // Local preview: dev servers like `python -m http.server` expose a directory
    // listing we can read straight from the folder.
    if (isLocalPreview()) {
        const local = await listFolderViaDirectoryIndex(album.folder);
        if (local.length) return toImageEntries(album.folder, local);
    }

    // Live site: GitHub Pages has no directory listing, so ask the GitHub API what
    // files live in the folder (cached, so we stay well under the rate limit).
    try {
        const names = await listFolderViaGitHub(album.folder);
        if (names.length) return toImageEntries(album.folder, names);
    } catch (error) {
        console.warn(`Could not auto-load images for "${album.title}":`, error.message);
    }

    return [];
}

// Parse a server-generated directory listing (used during local preview only).
async function listFolderViaDirectoryIndex(folder) {
    try {
        const response = await fetch(folder);
        if (!response.ok) return [];
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        return Array.from(doc.querySelectorAll('a'))
            .map(a => a.getAttribute('href'))
            .filter(Boolean)
            .map(href => decodeURIComponent(href.split('?')[0].split('/').pop()))
            .filter(isImageFile);
    } catch (error) {
        return [];
    }
}

// List a folder through the GitHub Contents API. Results are cached in localStorage
// so repeat visits and quick refreshes don't exhaust the 60 requests/hour limit.
// Tip: append ?refresh to the URL to force a re-read after pushing new images.
async function listFolderViaGitHub(folder) {
    const { owner, name, branch, basePath } = CONFIG.repo;
    const base = basePath ? basePath.replace(/\/+$/, '') + '/' : '';
    const repoPath = base + folder.replace(/^\.\//, '');
    const cacheKey = `artsite:imgs:${owner}/${name}@${branch}:${repoPath}`;
    const ttlMs = 10 * 60 * 1000; // 10 minutes
    const bypassCache = /[?&](refresh|nocache)(=|&|$)/.test(location.search);

    if (!bypassCache) {
        const cached = readImageCache(cacheKey);
        if (cached && Date.now() - cached.ts < ttlMs) return cached.files;
    }

    const url = `https://api.github.com/repos/${owner}/${name}/contents/${repoPath}?ref=${branch}`;
    try {
        const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
        if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
        const files = (await res.json())
            .filter(item => item.type === 'file')
            .map(item => item.name);
        writeImageCache(cacheKey, { ts: Date.now(), files });
        return files;
    } catch (error) {
        // Rate limited or offline: fall back to the last cached list, even if stale.
        const cached = readImageCache(cacheKey);
        if (cached) return cached.files;
        throw error;
    }
}

function readImageCache(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (error) { return null; }
}

function writeImageCache(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { /* storage unavailable -- caching is optional */ }
}

function enterSite() {
    document.getElementById('intro-page').classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('intro-page').style.display = 'none';
        document.getElementById('main-content').classList.add('visible');
    }, 800);
}

function generateIndexView() {
    const indexView = document.getElementById('index-view');
    let indexHTML = '<div class="index">';

    albums.forEach((album) => {
        indexHTML += `
            <div class="index-item" data-album-id="${album.id}" onclick="showAlbum('${album.id}')" style="--album-gif: url('${assetUrl(album.gif)}')">
                <div class="index-info">
                    <div class="index-number">${album.number}</div>
                    <div class="index-title">${album.title}</div>
                    <div class="index-count">${album.count}</div>
                </div>
            </div>
        `;
    });

    indexHTML += '</div>';
    indexView.innerHTML = indexHTML;
}

// Turn a writing's plain text into HTML: a blank line starts a new
// paragraph, a single line break becomes <br>. If the text already
// contains HTML block tags, it's left untouched.
function formatText(text) {
    const str = String(text || '').replace(/\r\n?/g, '\n').trim();
    if (!str) return '';
    if (/<(p|div|br|h[1-6]|ul|ol|li|blockquote)\b/i.test(str)) return str;
    return str
        .split(/\n[ \t]*\n/)
        .map(block => block.split('\n').map(line => line.trim()).filter(Boolean).join('<br>'))
        .filter(Boolean)
        .map(block => `<p>${block}</p>`)
        .join('');
}

function generateAlbumViews() {
    const container = document.getElementById('album-views');
    albums.forEach(album => {
        container.innerHTML += generateAlbumView(album);
    });
}

// One album view that can show writing, images, or both.
function generateAlbumView(album) {
    const writingsHTML = album.writings.length
        ? `<div class="writings"${album.images.length ? ' style="margin-bottom: 3rem;"' : ''}>${album.writings.map((writing, idx) => {
                const fullText = formatText(writing.fullText || writing.text);
                return `
                    <div class="writing" data-album="${album.id}">
                        <div class="writing-number">${String(idx + 1).padStart(3, '0')}</div>
                        <div class="writing-title">${writing.title || ''}</div>
                        <div class="writing-meta">${writing.type || ''}</div>
                        <div class="writing-excerpt">${writing.text || ''}</div>
                        <div class="full-text" style="display:none;">${fullText}</div>
                    </div>
                `;
            }).join('')}</div>`
        : '';

    const worksHTML = album.images.length
        ? `<div class="works">${album.images.map((imgObj) => `
                <div class="work" data-album="${album.id}" data-img="${imgObj.path}">
                    <img src="${imgObj.path}" alt="">
                </div>
            `).join('')}</div>`
        : '';

    return `
        <div id="album-${album.id}" class="view">
            <div class="view-header">
                <div class="view-title">${album.number} — ${album.title}</div>
                <div class="view-actions">
                    <div class="view-info">${album.count}</div>
                    <button class="back-btn" onclick="showView('index')">← back</button>
                </div>
            </div>
            ${writingsHTML}
            ${worksHTML}
        </div>
    `;
}

function setupEventListeners() {
    document.querySelectorAll('.work').forEach((work) => {
        work.onclick = function() {
            currentAlbumId = this.dataset.album;
            currentItems = Array.from(document.querySelectorAll(`[data-album="${currentAlbumId}"].work`));
            currentIndex = currentItems.indexOf(this);
            showWork(currentIndex);
        };
    });

    document.querySelectorAll('.writing').forEach((writing) => {
        writing.onclick = function() {
            currentAlbumId = this.dataset.album;
            currentItems = Array.from(document.querySelectorAll(`[data-album="${currentAlbumId}"].writing`));
            currentIndex = currentItems.indexOf(this);
            showWriting(currentIndex);
        };
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
        if (document.getElementById('modal').classList.contains('active')) {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        }
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');
    window.scrollTo(0, 0);
}

function showAlbum(albumId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`album-${albumId}`).classList.add('active');
    window.scrollTo(0, 0);
}

function showWork(index) {
    const work = currentItems[index];
    const img = work.dataset.img;
    
    document.getElementById('modal-content').innerHTML = `
        <img src="${img}" alt="">
    `;
    
    updateNavButtons();
    resetZoom();
    setupImageZoom();
    document.getElementById('modal').classList.add('active');
    document.getElementById('about-btn').classList.add('hidden');
}

function showWriting(index) {
    const writing = currentItems[index];
    const title = writing.querySelector('.writing-title').textContent;
    const meta = writing.querySelector('.writing-meta').textContent;
    const fullText = writing.querySelector('.full-text').innerHTML;
    
    document.getElementById('modal-content').innerHTML = `
        <div class="modal-text">
            <h1>${title}</h1>
            <div class="meta">${meta}</div>
            ${fullText}
        </div>
    `;
    
    updateNavButtons();
    document.getElementById('zoom-controls').style.display = 'none';
    document.getElementById('modal').classList.add('active');
    document.getElementById('about-btn').classList.add('hidden');
}

function navigate(direction) {
    currentIndex = Math.max(0, Math.min(currentIndex + direction, currentItems.length - 1));
    
    const isWriting = currentItems[currentIndex].classList.contains('writing');
    if (isWriting) {
        showWriting(currentIndex);
    } else {
        showWork(currentIndex);
    }
}

function updateNavButtons() {
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').disabled = currentIndex === currentItems.length - 1;
}

function setupImageZoom() {
    const modalContent = document.getElementById('modal-content');
    const img = modalContent.querySelector('img');
    
    if (!img) {
        document.getElementById('zoom-controls').style.display = 'none';
        return;
    }
    
    document.getElementById('zoom-controls').style.display = 'flex';
    
    img.onclick = function(e) {
        if (zoomLevel === 1) {
            const rect = img.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            zoomLevel = 2;
            img.style.setProperty('--zoom-x', x + '%');
            img.style.setProperty('--zoom-y', y + '%');
            img.style.setProperty('--zoom-level', zoomLevel);
            img.classList.add('zoomed');
            updateZoomUI();
        } else {
            resetZoom();
        }
    };
    
    modalContent.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }, { passive: false });
    
    img.addEventListener('mousedown', function(e) {
        if (zoomLevel > 1) {
            isDragging = true;
            startX = e.pageX - modalContent.offsetLeft;
            startY = e.pageY - modalContent.offsetTop;
            scrollLeft = modalContent.scrollLeft;
            scrollTop = modalContent.scrollTop;
            img.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - modalContent.offsetLeft;
        const y = e.pageY - modalContent.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        modalContent.scrollLeft = scrollLeft - walkX;
        modalContent.scrollTop = scrollTop - walkY;
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        const img = document.querySelector('#modal-content img');
        if (img && zoomLevel > 1) {
            img.style.cursor = 'grab';
        }
    });
}

function zoomIn() {
    if (zoomLevel < 3) {
        zoomLevel += 0.25;
        applyZoom();
    }
}

function zoomOut() {
    if (zoomLevel > 0.5) {
        zoomLevel -= 0.25;
        applyZoom();
    }
}

function resetZoom() {
    zoomLevel = 1;
    const img = document.querySelector('#modal-content img');
    if (img) {
        img.style.setProperty('--zoom-level', 1);
        img.classList.remove('zoomed', 'zoomed-max');
        img.style.cursor = 'zoom-in';
    }
    updateZoomUI();
}

function applyZoom() {
    const img = document.querySelector('#modal-content img');
    if (img) {
        img.style.setProperty('--zoom-level', zoomLevel);
        
        if (zoomLevel !== 1) {
            img.classList.add('zoomed');
        } else {
            img.classList.remove('zoomed');
        }
        
        if (zoomLevel >= 3) {
            img.classList.add('zoomed-max');
        } else {
            img.classList.remove('zoomed-max');
        }
        
        if (zoomLevel > 1) {
            img.style.cursor = 'grab';
        } else if (zoomLevel < 1) {
            img.style.cursor = 'zoom-in';
        } else {
            img.style.cursor = 'zoom-in';
        }
    }
    updateZoomUI();
}

function updateZoomUI() {
    document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
    document.getElementById('zoom-in-btn').disabled = zoomLevel >= 3;
    document.getElementById('zoom-out-btn').disabled = zoomLevel <= 0.5;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('about-btn').classList.remove('hidden');
    resetZoom();
}

init();
