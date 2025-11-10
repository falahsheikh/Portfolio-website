// Code by Falah Sheikh
// Last update: 11/9/2025

// Google Analytics Configuration
// For local development: Create a config.js file with: window.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
// For production: Set this in your hosting platform's environment variables
const GA_MEASUREMENT_ID = 'G-GJVRHMC2LR';
// Initialize Google Analytics
(function() {
    // Only initialize if a valid ID is provided
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID') {
        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
        
        // Initialize dataLayer and gtag function
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
    }
})();

// Load and parse the centralized data
const siteData = JSON.parse(document.getElementById('siteData').textContent);

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateDefaultView();
    populateRetroView();
    initializeTheme();
    setupEventListeners();
});

// POPULATE DEFAULT VIEW
function populateDefaultView() {
    const data = siteData;
    
    // Profile
    document.getElementById('default-name').textContent = data.profile.name;
    document.getElementById('default-image').src = data.profile.image;
    document.getElementById('default-image').alt = data.profile.name;
    
    const bioShort = document.getElementById('default-bio-short');
    bioShort.innerHTML = '';
    data.profile.bioShort.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        bioShort.appendChild(p);
    });
    
    // Bio Long
    const bioLong = document.getElementById('default-bio-long');
    bioLong.innerHTML = '';
    data.profile.bioLong.forEach(para => {
        const p = document.createElement('p');
        p.textContent = para;
        bioLong.appendChild(p);
    });
    
    // Links
    const linksList = document.getElementById('default-links');
    linksList.innerHTML = '';
    data.links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.text;
        if (link.url.startsWith('http')) {
            a.target = '_blank';
        }
        li.appendChild(a);
        linksList.appendChild(li);
    });
    
    // Awards
    const awardsList = document.getElementById('default-awards');
    awardsList.innerHTML = '';
    data.awards.forEach(award => {
        const li = document.createElement('li');
        li.textContent = `${award.name} (${award.amount})`;
        awardsList.appendChild(li);
    });
    
    // Affiliation
    const affiliationList = document.getElementById('default-affiliation');
    affiliationList.innerHTML = `
        <li>University of Calgary</li>
        <li>DANSA Lab</li>
        <li>Research Focus: ${data.profile.focusAreas}</li>
    `;
    
    // Publications
    const pubsContainer = document.getElementById('publicationsContainer');
    pubsContainer.innerHTML = '';
    data.publications.forEach(pub => {
        const card = document.createElement('div');
        card.className = 'featured-card-link';
        
        const authorsText = pub.authors.map(author => {
            if (author === 'Falah Sheikh' || author === 'Falah Sheikh*') {
                return `<strong>${author}</strong>`;
            }
            return author;
        }).join(', ');
        
        card.innerHTML = `
            <div class="featured-card">
                <div class="card-content">
                    <h3>${pub.title}</h3>
                    <p class="card-publication">${pub.venue}, ${pub.year}</p>
                    <p class="card-preview">${authorsText}</p>
                    <div class="card-links">
                        <a href="#" class="card-link abstract-link" data-abstract="${pub.abstract}">Abstract</a>
                        <a href="${pub.url}" target="_blank" class="card-link">Paper</a>
                    </div>
                </div>
            </div>
        `;
        pubsContainer.appendChild(card);
    });
    
    // Current Research
    const currentResearch = document.getElementById('default-current-research');
    currentResearch.innerHTML = '';
    data.currentResearch.forEach(research => {
        const li = document.createElement('li');
        li.textContent = research;
        currentResearch.appendChild(li);
    });
    
    // Experience
    const experienceContainer = document.getElementById('default-experience');
    experienceContainer.innerHTML = '';
    data.experience.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const projectsList = exp.projects.map(p => `<li>${p}</li>`).join('');
        
        item.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="timeline-period">${exp.period}</div>
                <h3>${exp.title}</h3>
                <p class="timeline-org">${exp.organization}</p>
                <ul class="timeline-projects">${projectsList}</ul>
            </div>
        `;
        experienceContainer.appendChild(item);
    });
    
    // Presentations
    const presentationsContainer = document.getElementById('default-presentations');
    presentationsContainer.innerHTML = '';
    data.presentations.forEach((pres, index) => {
        const div = document.createElement('div');
        div.className = 'presentation-item';
        if (index > 0) {
            div.style.marginTop = '20px';
        }
        
        const authorsText = pres.authors.map(author => {
            if (author === 'Falah Sheikh') {
                return `<strong>${author}</strong>`;
            }
            return author;
        }).join(', ');
        
        div.innerHTML = `
            <h4>${pres.title}</h4>
            <p class="presentation-authors">${authorsText}</p>
            <p class="presentation-venue">${pres.venue}, ${pres.date}</p>
        `;
        presentationsContainer.appendChild(div);
    });
    
    // Footer
    document.getElementById('default-footer').textContent = `${data.profile.name} © 2025`;
}

// POPULATE RETRO VIEW
function populateRetroView() {
    const data = siteData;
    
    // Name
    document.getElementById('retro-name').textContent = data.profile.name;
    
    // Profile Table
    const profileTable = document.getElementById('profile-retro');
    profileTable.innerHTML = `
        <tr>
            <th colspan="2">Profile</th>
        </tr>
        <tr>
            <td width="30%"><strong>Affiliation:</strong></td>
            <td>${data.profile.affiliation}</td>
        </tr>
        <tr>
            <td><strong>Research Field:</strong></td>
            <td>${data.profile.researchField}</td>
        </tr>
        <tr>
            <td><strong>Focus Areas:</strong></td>
            <td>${data.profile.focusAreas}</td>
        </tr>
    `;
    
    // Timeline Table
    const timelineTable = document.getElementById('timeline-retro');
    const timelineRows = data.timeline.map(t => `
        <tr>
            <td>
                <div class="timeline-event">
                    <strong>${t.year}</strong> - ${t.event}
                </div>
            </td>
        </tr>
    `).join('');
    timelineTable.innerHTML = `
        <tr><th>Academic Timeline</th></tr>
        ${timelineRows}
    `;
    
    // Experience Table
    const experienceTable = document.getElementById('experience-retro');
    const experienceEntries = data.experience.map(exp => {
        const projectsList = exp.projects.map(p => `<li>${p}</li>`).join('');
        return `
            <div class="experience-entry">
                <strong>${exp.title} - ${exp.organization}</strong><br>
                ${exp.location}<br>
                <em>${exp.period}</em><br>
                <ul style="list-style-type:square; margin-left: 20px;">
                    ${projectsList}
                </ul>
            </div>
        `;
    }).join('');
    experienceTable.innerHTML = `
        <tr><th>Research Experience</th></tr>
        <tr><td><div class="experience-timeline">${experienceEntries}</div></td></tr>
    `;
    
    // Current Research Table
    const currentTable = document.getElementById('current-retro');
    const currentItems = data.currentResearch.map(r => `
        <li><strong>${r}</strong><br></li>
    `).join('');
    currentTable.innerHTML = `
        <thead><tr><th>Current Research</th></tr></thead>
        <tbody>
            <tr>
                <td>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        ${currentItems}
                    </ul>
                </td>
            </tr>
        </tbody>
    `;
    
    // Publications Table
    const publicationsTable = document.getElementById('publications-retro');
    const hasEqualContrib = data.publications.some(p => p.equalContribution);
    const footnote = hasEqualContrib ? '<div class="footnote"><b>*</b>: Equal contribution</div><div style="height: 5px;"></div>' : '';
    
    const pubEntries = data.publications.map(pub => {
        const authorsText = pub.authors.map(author => {
            if (author.includes('Falah Sheikh')) {
                return `<b>${author}</b>`;
            }
            return author;
        }).join(', ');
        
        return `
            <div class="publication">
                ${authorsText}.
                <i><strong>${pub.title}</strong></i>.
                ${pub.venue}, ${pub.year}
                <br>
                [<a href="#" class="abstract-link" data-abstract="${pub.abstract}">Abstract</a>] 
                <span>[</span><a href="${pub.url}" target="_blank">Link</a><span>]</span>
            </div>
        `;
    }).join('');
    
    publicationsTable.innerHTML = `
        <tr>
            <th>
                Publications
                <div class="search-bar">
                    <input type="text" id="searchInputRetro" placeholder="Search publications...">
                    <button onclick="searchPublicationsRetro()">Search</button>
                </div>
            </th>
        </tr>
        <tr>
            <td>
                <div id="publicationsListRetro">
                    ${footnote}
                    ${pubEntries}
                </div>
            </td>
        </tr>
    `;
    
    // Presentations Table
    const presentationsTable = document.getElementById('presentations-retro');
    const presItems = data.presentations.map((pres, index) => {
        const authorsText = pres.authors.map(author => {
            if (author === 'Falah Sheikh') {
                return `<strong>${author}</strong>`;
            }
            return author;
        }).join(', ');
        
        const marginTop = index > 0 ? ' style="margin-top: 20px;"' : '';
        
        return `
            <li${marginTop}>
                <div class="authors">${authorsText}</div>
                <div class="title">${pres.title}.</div>
                <div class="venue">
                    Poster presented by <strong>${pres.presenter}</strong> at the <em>${pres.venue}</em>, ${pres.date}.
                </div>
            </li>
        `;
    }).join('');
    
    presentationsTable.innerHTML = `
        <thead><tr><th>Presentations</th></tr></thead>
        <tbody>
            <tr>
                <td>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        ${presItems}
                    </ul>
                </td>
            </tr>
        </tbody>
    `;
    
    // Awards Table
    const awardsTable = document.getElementById('awards-retro');
    const awardItems = data.awards.map((award, index) => {
        const marginTop = index > 0 ? ' style="margin-top: 20px;"' : '';
        return `
        <li${marginTop}>
            <strong>${award.name}</strong><br>
            ${award.description}
        </li>
    `;
    }).join('');
    awardsTable.innerHTML = `
        <thead><tr><th>Awards</th></tr></thead>
        <tbody>
            <tr>
                <td>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        ${awardItems}
                    </ul>
                </td>
            </tr>
        </tbody>
    `;
    
    // Connections Table
    const connectionsTable = document.getElementById('connections-retro');
    const connectionEntries = data.links
        .filter(link => link.text !== 'GitHub') // Exclude GitHub as it's in Code Bases section
        .map(link => {
            if (link.email) {
                return `
                    <div class="connection-entry">
                        <div class="email-link-container">
                            <a href="${link.url}" class="email-link">
                                <span class="email-label">${link.text}: </span> &nbsp;${link.email}
                                <button class="copy-button" onclick="copyEmailRetro('${link.email}', this, event)">Copy</button>
                            </a>
                        </div>
                    </div>
                `;
            } else if (link.display) {
                return `
                    <div class="connection-entry">
                        <a href="${link.url}" class="connections-link" target="_blank">
                            <span class="orcid-label">${link.text}: </span> &nbsp;${link.display}
                        </a>
                    </div>
                `;
            } else if (link.url.startsWith('http')) {
                return `
                    <div class="connection-entry">
                        <a href="${link.url}" class="connections-link" target="_blank">
                            ${link.text}
                        </a>
                    </div>
                `;
            }
            return '';
        }).join('');
    connectionsTable.innerHTML = `
        <tr><th>Connect</th></tr>
        <tr><td>${connectionEntries}</td></tr>
    `;
    
    // Codebase Table
    const githubLink = data.links.find(l => l.text === 'GitHub');
    const codebaseTable = document.getElementById('codebase-retro');
    codebaseTable.innerHTML = `
        <tr><th>Code Bases</th></tr>
        <tr>
            <td>
                <a href="${githubLink.url}" class="connections-link" target="_blank">
                    GitHub
                </a>
            </td>
        </tr>
    `;
    
    // Footer
    document.getElementById('retro-footer').textContent = `${data.profile.name} © 2025`;
}

// THEME MANAGEMENT
let currentTheme = 'default';
const themes = ['default', 'default-dark', 'retro', 'retro-dark', 'retro-pink', 'retro-ms93'];

function toggleThemeDropdown() {
    const dropdown = document.getElementById('themeDropdown');
    dropdown.classList.toggle('show');
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.className = theme;
    
    if (theme === 'default-dark' || theme.startsWith('retro-')) {
        document.documentElement.className = theme;
    } else {
        document.documentElement.className = '';
    }
    
    const defaultContent = document.querySelector('.default-content');
    const retroContent = document.querySelector('.retro-content');
    
    if (theme === 'default' || theme === 'default-dark') {
        defaultContent.style.display = 'block';
        retroContent.style.display = 'none';
    } else {
        defaultContent.style.display = 'none';
        retroContent.style.display = 'block';
        setTimeout(checkNavbarVisibility, 100);
    }
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('themeDropdown').classList.remove('show');
    closeDesktopNavRetro();
    closeMobileNavRetro();
    
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {
        console.log("localStorage not available");
    }
}

function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && themes.includes(savedTheme)) {
            currentTheme = savedTheme;
            document.body.className = savedTheme;
            
            if (savedTheme === 'default-dark' || savedTheme.startsWith('retro-')) {
                document.documentElement.className = savedTheme;
            }
            
            const defaultContent = document.querySelector('.default-content');
            const retroContent = document.querySelector('.retro-content');
            
            if (savedTheme === 'default' || savedTheme === 'default-dark') {
                defaultContent.style.display = 'block';
                retroContent.style.display = 'none';
            } else {
                defaultContent.style.display = 'none';
                retroContent.style.display = 'block';
                setTimeout(checkNavbarVisibility, 100);
            }
        }
    } catch (e) {
        document.body.className = 'default';
    }
}

// EVENT LISTENERS
function setupEventListeners() {
    // Abstract modals
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('abstract-link')) {
            e.preventDefault();
            const isRetro = document.body.className.includes('retro');
            if (isRetro) {
                document.getElementById('abstractContentRetro').textContent = e.target.dataset.abstract;
                document.getElementById('abstractModalRetro').style.display = 'block';
            } else {
                document.getElementById('abstractContent').textContent = e.target.dataset.abstract;
                document.getElementById('abstractModal').style.display = 'flex';
            }
        }
    });
    
    // Theme switcher click outside
    document.addEventListener('click', function(event) {
        const themeSwitcher = document.querySelector('.theme-switcher');
        const floatingNav = document.getElementById('floatingNavRetro');
        
        if (themeSwitcher && !themeSwitcher.contains(event.target)) {
            document.getElementById('themeDropdown').classList.remove('show');
        }
        
        if (floatingNav && !floatingNav.contains(event.target)) {
            closeDesktopNavRetro();
            closeMobileNavRetro();
        }
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Default view search
    const searchInput = document.getElementById('searchInput');
    const publications = document.querySelectorAll('.featured-card-link');
    const searchNote = document.getElementById('searchNote');
    
    updateSearchNote();
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        let hasVisibleAsterisk = false;
        
        publications.forEach(publication => {
            const cardContent = publication.querySelector('.card-content');
            const title = cardContent.querySelector('h3').textContent.toLowerCase();
            const publicationInfo = cardContent.querySelector('.card-publication').textContent.toLowerCase();
            const authors = cardContent.querySelector('.card-preview').textContent.toLowerCase();
            
            const allText = title + ' ' + publicationInfo + ' ' + authors;
            
            if (searchTerm === '' || allText.includes(searchTerm)) {
                publication.style.display = 'block';
                if (authors.includes('*')) {
                    hasVisibleAsterisk = true;
                }
            } else {
                publication.style.display = 'none';
            }
        });
        
        if (hasVisibleAsterisk) {
            searchNote.classList.add('show');
        } else {
            searchNote.classList.remove('show');
        }
    });
}

function updateSearchNote() {
    const publications = document.querySelectorAll('.featured-card-link');
    const searchNote = document.getElementById('searchNote');
    let hasAsterisk = false;
    
    publications.forEach(publication => {
        const authors = publication.querySelector('.card-preview').textContent;
        if (authors.includes('*')) {
            hasAsterisk = true;
        }
    });
    
    if (hasAsterisk) {
        searchNote.classList.add('show');
    } else {
        searchNote.classList.remove('show');
    }
}

// MODAL FUNCTIONS
function closeModal() {
    document.getElementById('abstractModal').style.display = 'none';
}

function closeModalRetro() {
    document.getElementById('abstractModalRetro').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.id === 'abstractModal') {
        closeModal();
    }
    if (event.target.id === 'abstractModalRetro') {
        closeModalRetro();
    }
}

// RETRO SEARCH
function searchPublicationsRetro() {
    const input = document.getElementById('searchInputRetro').value.toLowerCase();
    const publicationsRetro = document.querySelectorAll('.publication');
    const publicationsList = document.getElementById('publicationsListRetro');
    const footnote = publicationsList.querySelector('.footnote');
    
    const existingNoResults = publicationsList.querySelector('.no-results');
    if (existingNoResults) {
        publicationsList.removeChild(existingNoResults);
    }
    
    const body = document.body;
    let borderColor = '#E0E0E0';
    if (body.classList.contains('retro-dark')) {
        borderColor = '#444444';
    } else if (body.classList.contains('retro-pink')) {
        borderColor = '#ff9999';
    } else if (body.classList.contains('retro-ms93')) {
        borderColor = '#808080';
    }
    
    const visiblePublications = [];
    let hasAsterisk = false;
    
    publicationsRetro.forEach(pub => {
        const text = pub.textContent.toLowerCase();
        if (text.includes(input)) {
            pub.style.display = '';
            visiblePublications.push(pub);
            if (pub.textContent.includes('*')) {
                hasAsterisk = true;
            }
        } else {
            pub.style.display = 'none';
        }
    });
    
    if (footnote) {
        footnote.style.display = hasAsterisk ? 'block' : 'none';
    }
    
    visiblePublications.forEach((pub, index) => {
        pub.style.marginBottom = '15px';
        pub.style.paddingBottom = '15px';
        pub.style.borderBottom = `1px solid ${borderColor}`;
        
        if (index === visiblePublications.length - 1) {
            pub.style.marginBottom = '0';
            pub.style.paddingBottom = '0';
            pub.style.borderBottom = 'none';
        }
    });
    
    if (visiblePublications.length === 0 && input.trim() !== '') {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No publications found matching your search.';
        publicationsList.appendChild(noResults);
    }
}

// EMAIL COPY FUNCTION
function copyEmailRetro(email, buttonElement, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    navigator.clipboard.writeText(email).then(function() {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        buttonElement.classList.add('copied');
        
        setTimeout(function() {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('copied');
        }, 1000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        buttonElement.classList.add('copied');
        
        setTimeout(function() {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('copied');
        }, 2000);
    });
}

// RETRO NAVIGATION
function toggleDesktopNavRetro() {
    const dropdown = document.getElementById('desktopNavDropdownRetro');
    const button = document.querySelector('.floating-nav .desktop-nav .nav-button');
    dropdown.classList.toggle('show');
    button.classList.toggle('active');
}

function closeDesktopNavRetro() {
    const dropdown = document.getElementById('desktopNavDropdownRetro');
    const button = document.querySelector('.floating-nav .desktop-nav .nav-button');
    if (dropdown && button) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
}

function toggleMobileNavRetro() {
    const dropdown = document.getElementById('mobileNavDropdownRetro');
    const button = document.querySelector('.floating-nav .mobile-nav .nav-button');
    dropdown.classList.toggle('show');
    button.classList.toggle('active');
}

function closeMobileNavRetro() {
    const dropdown = document.getElementById('mobileNavDropdownRetro');
    const button = document.querySelector('.floating-nav .mobile-nav .nav-button');
    if (dropdown && button) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
}

function checkNavbarVisibility() {
    const isRetroTheme = document.body.className.includes('retro');
    if (!isRetroTheme) return;
    
    if (window.innerWidth > 768) {
        const navbar = document.querySelector('.navbar');
        const desktopNav = document.querySelector('.desktop-nav');
        
        if (navbar && desktopNav) {
            const navbarRect = navbar.getBoundingClientRect();
            const isNavbarVisible = navbarRect.bottom > 0;
            
            if (!isNavbarVisible) {
                desktopNav.classList.add('show');
            } else {
                desktopNav.classList.remove('show');
                closeDesktopNavRetro();
            }
        }
    }
}

window.addEventListener('scroll', checkNavbarVisibility);
window.addEventListener('load', function() {
    setTimeout(checkNavbarVisibility, 100);
});
window.addEventListener('resize', function() {
    checkNavbarVisibility();
    closeDesktopNavRetro();
    closeMobileNavRetro();
});