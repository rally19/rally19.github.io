/* app.js - Enhanced Interactive Cursor & Magnetic Buttons */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for smooth scrolling
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.lenis = lenis;

        // Sync Lenis with GSAP ScrollTrigger
        if (window.ScrollTrigger) {
            lenis.on('scroll', window.ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0, 0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }
    // 1. Setup Custom Cursor Setup
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (!cursorDot || !cursorOutline) return;

    if (!cursorDot || !cursorOutline) return;

    // Listen for mouse movement
    document.addEventListener('mousemove', (e) => {
        // Dot follows instantly (CSS adds delay natively)
        cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;

        // Ring follows instantly (no delay)
        cursorOutline.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    // 2. Add hover states to interactive elements
    window.initInteractiveElements = function () {
        const interactiveElements = document.querySelectorAll('a, button, .custom-cursor-target');

        interactiveElements.forEach(el => {
            if (el.dataset.cursorInitialized) return;
            el.dataset.cursorInitialized = 'true';

            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('active');
                cursorOutline.classList.add('active');

                // Handle custom text or icons inside cursor outline
                const cursorText = el.getAttribute('data-cursor-text');
                if (cursorText) {
                    cursorDot.innerHTML = cursorText;
                    cursorDot.classList.add('has-text');
                } else if (el.tagName.toLowerCase() === 'a' && el.getAttribute('target') === '_blank') {
                    // Show external link icon for target="_blank"
                    cursorDot.innerHTML = '<i class="fas fa-external-link-alt" style="font-size: 1.2rem;"></i>';
                    cursorDot.classList.add('has-text');
                }
            });

            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorOutline.classList.remove('active');

                // Reset custom cursor text and icons
                if (el.hasAttribute('data-cursor-text') || (el.tagName.toLowerCase() === 'a' && el.getAttribute('target') === '_blank')) {
                    cursorDot.innerHTML = '';
                    cursorDot.classList.remove('has-text');
                }
            });
        });

        // 3. Magnetic effect for primary buttons and nav-cta
        const magneticElements = document.querySelectorAll('.btn, .nav-cta');

        magneticElements.forEach(elem => {
            if (elem.dataset.magneticInitialized) return;
            elem.dataset.magneticInitialized = 'true';

            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move item slightly towards cursor
                elem.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = `translate(0px, 0px)`;
            });
        });
    };

    // Run on initial load
    window.initInteractiveElements();

    // 4. Initialize 3D Vanilla Tilt on cards
    if (typeof VanillaTilt !== 'undefined') {
        const isIndex = document.body.classList.contains('index-page');
        const selector = isIndex ? '.project-card' : '.card, .project-card';
        const cards = document.querySelectorAll(selector);
        if (cards.length > 0) {
            VanillaTilt.init(cards, {
                max: 5,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
                scale: 1.02
            });
        }
    }

    // 5. Cursor Spotlight 
    const spotlight = document.createElement('div');
    spotlight.classList.add('cursor-spotlight');
    document.body.appendChild(spotlight);

    document.addEventListener('mousemove', (e) => {
        spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    // 6. Terminal Splash Screen (Applies to all pages)
    // Skip splash if already seen this session
    if (!sessionStorage.getItem('splashSeen')) {
        // Lock scrolling during splash
        document.documentElement.classList.add('no-scroll');
        if (lenis) lenis.stop();

        const splash = document.createElement('div');
        splash.classList.add('terminal-splash');
        splash.innerHTML = `
            <div class="terminal-text-container">
                <span class="terminal-text"></span><span class="terminal-cursor"></span>
            </div>
        `;
        document.body.appendChild(splash);

        const textElem = splash.querySelector('.terminal-text');
        const messages = [
            "Initializing connection...",
            "Loading assets...",
            "System ready...",
            "Welcome, to my portofolio."
        ];

        let messageIndex = 0;
        let charIndex = 0;

        function typeText() {
            if (messageIndex < messages.length) {
                if (charIndex < messages[messageIndex].length) {
                    textElem.innerHTML += messages[messageIndex].charAt(charIndex);
                    charIndex++;
                    setTimeout(typeText, Math.random() * 15 + 5); // typing speed
                } else {
                    textElem.innerHTML += '<br><br>';
                    messageIndex++;
                    charIndex = 0;
                    setTimeout(typeText, 300); // delay between lines
                }
            } else {
                // Finished typing
                setTimeout(() => {
                    splash.classList.add('glitch-out');
                    sessionStorage.setItem('splashSeen', 'true');

                    // Wait for glitch animation (600ms) to finish
                    setTimeout(() => {
                        splash.remove();
                        document.documentElement.classList.remove('no-scroll');
                        if (lenis) lenis.start();
                        document.dispatchEvent(new Event('splashFinished')); // Notify animations
                    }, 600);
                }, 500);
            }
        }

        // Start typing
        setTimeout(typeText, 500);
    }

    // 7. Page Transitions (Inline Main Fade)
    const mainContent = document.querySelector('main');

    if (mainContent) {
        mainContent.classList.remove('fade-out');
    }

    // Hijack internal links for fade out
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only intercept standard left clicks without modifier keys
            if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

            const href = link.getAttribute('href');
            // Ignore if no href, hash link, javascript, mailto, tel
            if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            // Ignore if it opens in a new tab or is a download link
            if (link.target === '_blank' || link.hasAttribute('download')) return;
            // Ignore external links
            if (href.startsWith('http') && !link.href.includes(window.location.hostname)) return;

            e.preventDefault();

            // 1. Actual scroll to top
            if (window.lenis) {
                window.lenis.scrollTo(0, {
                    duration: 0.8,
                    easing: (t) => t * t
                });
            }

            // 2. Animate scrollbar progress & thumb
            if (window.gsap) {
                gsap.to(document.documentElement, {
                    '--scroll-percent': '0%',
                    '--thumb-y': '100%',
                    duration: 0.8,
                    ease: 'power2.inOut'
                });

                // 3. Animate Navbar out
                if (document.querySelector('.nav')) {
                    gsap.to('.nav', {
                        y: -64,
                        autoAlpha: 0,
                        filter: 'blur(10px)',
                        duration: 0.5,
                        ease: 'power2.inOut'
                    });
                }

                // 4. Animate Background out
                if (document.getElementById('bg-canvas')) {
                    gsap.to('#bg-canvas', {
                        autoAlpha: 0,
                        filter: 'blur(10px)',
                        duration: 0.5,
                        ease: 'power2.inOut'
                    });
                }

                // 5. Fade out main content
                if (mainContent) {
                    mainContent.classList.add('fade-out');
                }
            }

            setTimeout(() => {
                window.location.href = href;
            }, 800); // Wait for scroll and animations
        });
    });
});
