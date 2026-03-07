document.addEventListener('DOMContentLoaded', () => {
    const projectContainer = document.getElementById('project-container');

    if (!projectContainer) return;

    let projectData = [];

    // Fetch the JSON data
    fetch('project.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            projectData = data.projects;
            renderProjects();
            updateSEOJson();
        })
        .catch(error => {
            console.error('Error fetching project data:', error);
            projectContainer.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">Error loading project data.</p>';
        });

    function updateSEOJson() {
        const seoScript = document.getElementById('seo-json-ld');
        if (!seoScript) return;

        const seoData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": projectData.map(project => {
                const languages = project.tags.map(tag => tag.text).join(", ");

                // Strip HTML tags from description (like <code>)
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = project.description;
                const plainDescription = tempDiv.textContent || tempDiv.innerText || "";

                return {
                    "@type": "SoftwareSourceCode",
                    "name": project.title,
                    "programmingLanguage": languages,
                    "description": plainDescription
                };
            })
        };

        seoScript.textContent = JSON.stringify(seoData, null, 2);
    }

    function getIconForLink(type, text) {
        if (type === 'github-source') return 'fab fa-github';
        if (type === 'download') return 'fas fa-download';
        if (type === 'visit-site') {
            if (text.includes('Live Demo')) return 'fas fa-external-link-alt';
            if (text.includes('Visit Live')) return 'fas fa-rocket';
            return 'fas fa-globe';
        }
        return 'fas fa-link';
    }

    function getBtnClassForLink(type) {
        if (type === 'github-source') return 'btn btn-dark';
        if (type === 'download' || type === 'visit-site') return 'btn btn-primary';
        return 'btn btn-primary';
    }

    function renderProjects() {
        projectContainer.innerHTML = '';

        if (projectData.length === 0) {
            projectContainer.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">No projects found.</p>';
            return;
        }

        projectData.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'giant-project gs-hidden';

            // Generate images HTML
            let sliderTrackHtml = '';
            let sliderNavHtml = '';
            project.images.forEach((img, index) => {
                sliderTrackHtml += `<img src="${img}" alt="${project.title} ${index + 1}" class="slider-image">`;
                sliderNavHtml += `<div class="slider-dot ${index === 0 ? 'active' : ''}" onclick="setSlider('proj-slider${project.id}', ${index})"></div>`;
            });

            // Generate Tags HTML
            let tagsHtml = '';
            project.tags.forEach(tag => {
                tagsHtml += `<span class="tag tag-${tag.color}">${tag.text}</span>`;
            });

            // Generate Links HTML
            let linksHtml = '';
            if (project.links && project.links.length > 0) {
                // If there are exactly 3 links (like Company Profile), we can mimic the specific layout
                // Or we can just use a flex wrap container for all.
                // Looking at Company Profile, it had a secondary div for the 2 github links.
                // Let's use a generic flex wrapper which works well for all.
                project.links.forEach(link => {
                    const iconClass = getIconForLink(link.type, link.text);
                    const btnClass = getBtnClassForLink(link.type);
                    // Use btn-sm if it's a secondary link (e.g., github source when there's already a visit-site link)
                    // but for simplicity, we can just use the regular btn or match the exact class structure from HTML.
                    // For company profile's github repos, it used 'btn btn-sm btn-dark'. We can apply btn-sm if it's a github link and not the first link.
                    const isSecondary = project.links.length > 2 && link.type === 'github-source';
                    const finalBtnClass = isSecondary ? 'btn btn-sm btn-dark' : btnClass;

                    linksHtml += `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="${finalBtnClass} custom-cursor-target">
                            <i class="${iconClass}"></i> ${link.text}
                        </a>
                    `;
                });
            }

            // Provide a wrapper for links if there are multiple, using flex to lay them out nicely.
            let linksContainerHtml = '';
            if (project.id === 3 && project.links && project.links.length === 3) {
                // Specific Company Profile layout match to preserve EXACT original HTML tree structure.
                linksContainerHtml = `
                    <div class="project-card-links">
                        <a href="${project.links[0].url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary custom-cursor-target">
                            <i class="${getIconForLink(project.links[0].type, project.links[0].text)}"></i> ${project.links[0].text}
                        </a>
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <a href="${project.links[1].url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-dark custom-cursor-target">
                                <i class="${getIconForLink(project.links[1].type, project.links[1].text)}"></i> ${project.links[1].text}
                            </a>
                            <a href="${project.links[2].url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-dark custom-cursor-target">
                                <i class="${getIconForLink(project.links[2].type, project.links[2].text)}"></i> ${project.links[2].text}
                            </a>
                        </div>
                    </div>
                `;
            } else {
                let linkStyles = (project.links && project.links.length > 1) ? 'style="display: flex; gap: 0.5rem; flex-wrap: wrap;"' : '';
                linksContainerHtml = `<div class="project-card-links" ${linkStyles}>
                    ${linksHtml}
                </div>`;
            }

            projectEl.innerHTML = `
                <div class="giant-project-bg" style="background-image: url('${project.images[0]}');" data-speed="0.5"></div>
                <div class="giant-project-content">
                    <div class="giant-project-slider-wrapper slider-container custom-cursor-target">
                        <div class="slider-track" id="proj-slider${project.id}">
                            ${sliderTrackHtml}
                        </div>
                        ${project.images.length > 1 ? `
                        <div class="slider-click-zone left custom-cursor-target" data-cursor-text="←"
                            onclick="moveSlider('proj-slider${project.id}', -1)"></div>
                        <div class="slider-click-zone right custom-cursor-target" data-cursor-text="→"
                            onclick="moveSlider('proj-slider${project.id}', 1)"></div>
                        <div class="slider-nav" id="proj-nav${project.id}">
                            ${sliderNavHtml}
                        </div>
                        ` : ''}
                    </div>
                    <div class="giant-project-text">
                        <p class="section-label" style="text-align: left; margin-bottom: 0.5rem;">${project.label}</p>
                        <h2 class="giant-title">${project.title}</h2>
                        <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem; font-size: 1.1rem;">
                            ${project.description}
                        </p>
                        <div class="project-card-tags" style="margin-bottom: 2rem;">
                            ${tagsHtml}
                        </div>
                        ${linksContainerHtml}
                    </div>
                </div>
            `;

            projectContainer.appendChild(projectEl);
        });

        // Delay to ensure DOM is updated before ScrollTrigger recalculates
        setTimeout(() => {
            if (typeof window.animateParallax === 'function') {
                window.animateParallax();
            }
            if (typeof window.animateSections === 'function') {
                window.animateSections();
            }
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }

            // Re-bind cursor events if needed
            if (typeof initCustomCursor === 'function') {
                initCustomCursor();
            }
        }, 50);
    }
});
