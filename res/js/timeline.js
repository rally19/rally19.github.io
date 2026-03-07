document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.getElementById('timeline-container');
    const filterBtns = document.querySelectorAll('.timeline-filters .filter-btn');
    const sortBtn = document.getElementById('sort-timeline');

    let timelineData = [];

    // Retrieve saved state from sessionStorage or use defaults
    const savedFilters = sessionStorage.getItem('timelineFilters');
    let activeFilters = savedFilters ? new Set(JSON.parse(savedFilters)) : new Set(['All']);

    const savedSort = sessionStorage.getItem('timelineSort');
    let currentSort = savedSort || (sortBtn ? sortBtn.getAttribute('data-sort') : 'desc');

    // Initialize UI based on saved state
    if (activeFilters) {
        filterBtns.forEach(btn => {
            const val = btn.getAttribute('data-filter');
            if (activeFilters.has(val)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (sortBtn && savedSort) {
        if (savedSort === 'asc') {
            sortBtn.setAttribute('data-sort', 'asc');
            sortBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Oldest First';
        } else {
            sortBtn.setAttribute('data-sort', 'desc');
            sortBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Newest First';
        }
    }

    // Fetch the JSON data
    fetch('timeline.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            timelineData = data;
            renderTimeline();
        })
        .catch(error => {
            console.error('Error fetching timeline data:', error);
            timelineContainer.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">Error loading timeline data.</p>';
        });

    function renderTimeline() {
        // Filter
        let filteredData = timelineData.filter(item => {
            if (activeFilters.has('All')) return true;

            let match = false;
            // Check against each active filter explicitly
            activeFilters.forEach(filter => {
                if (filter === 'Award & Certifications') {
                    if (item.tag === 'Award' || item.tag === 'Certification' || item.tag === 'Award & Certifications') match = true;
                } else if (item.tag === filter) {
                    match = true;
                }
            });
            return match;
        });

        // Sort
        filteredData.sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (currentSort === 'asc') {
                return orderA - orderB; // Oldest first
            } else {
                return orderB - orderA; // Newest first
            }
        });

        // Generate HTML
        timelineContainer.innerHTML = '';

        if (filteredData.length === 0) {
            timelineContainer.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">No items found.</p>';
        } else {
            filteredData.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'timeline-item timeline-trigger';
                itemEl.setAttribute('data-image', item.image);

                let bulletsHtml = '<ul class="timeline-body">';
                if (item.bullets && item.bullets.length > 0) {
                    item.bullets.forEach(bullet => {
                        bulletsHtml += `<li>${bullet}</li>`;
                    });
                }
                bulletsHtml += '</ul>';

                itemEl.innerHTML = `
                    <div class="timeline-date">${item.date}</div>
                    <h3 class="timeline-title">${item.title} <span style="font-size: 0.9em; font-weight: normal; color: var(--accent);">(${item.tag})</span></h3>
                    <p class="timeline-subtitle">${item.subtitle}</p>
                    ${bulletsHtml}
                `;

                timelineContainer.appendChild(itemEl);
            });
        }

        // Delay to ensure DOM is updated before ScrollTrigger recalculates
        setTimeout(() => {
            if (typeof window.animateTimeline === 'function') {
                window.animateTimeline();
            }
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 50);
    }

    // Filter event listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            if (filterValue === 'All') {
                activeFilters.clear();
                activeFilters.add('All');
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                // If 'All' is currently active, deactivate it
                if (activeFilters.has('All')) {
                    activeFilters.delete('All');
                    document.querySelector('.filter-btn[data-filter="All"]')?.classList.remove('active');
                }

                // Toggle the clicked filter
                if (activeFilters.has(filterValue)) {
                    activeFilters.delete(filterValue);
                    btn.classList.remove('active');

                    // If no filters left, default back to 'All'
                    if (activeFilters.size === 0) {
                        activeFilters.add('All');
                        document.querySelector('.filter-btn[data-filter="All"]')?.classList.add('active');
                    }
                } else {
                    activeFilters.add(filterValue);
                    btn.classList.add('active');
                }
            }

            // Save filters state
            sessionStorage.setItem('timelineFilters', JSON.stringify(Array.from(activeFilters)));
            renderTimeline();
        });
    });

    // Sort event listener
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            if (currentSort === 'desc') {
                currentSort = 'asc';
                sortBtn.setAttribute('data-sort', 'asc');
                sortBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i> Oldest First';
            } else {
                currentSort = 'desc';
                sortBtn.setAttribute('data-sort', 'desc');
                sortBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Newest First';
            }

            // Save sort state
            sessionStorage.setItem('timelineSort', currentSort);
            renderTimeline();
        });
    }
});
