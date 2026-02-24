/* app.js - Enhanced Interactive Cursor & Magnetic Buttons */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis for smooth scrolling
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

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
    // We select all links, buttons, and anything with class custom-cursor-target
    const interactiveElements = document.querySelectorAll('a, button, .custom-cursor-target');

    interactiveElements.forEach(el => {
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

    // 4. Initialize 3D Vanilla Tilt on cards
    if (typeof VanillaTilt !== 'undefined') {
        const cards = document.querySelectorAll('.card, .project-card');
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
        document.body.style.overflow = 'hidden';

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
                        document.body.style.overflow = ''; // Restore scrolling
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
            const href = link.getAttribute('href');
            // Check if it's an internal link and not a hash link or target="_blank"
            if (href && href.endsWith('.html') && link.getAttribute('target') !== '_blank') {
                e.preventDefault();

                if (mainContent) {
                    mainContent.classList.add('fade-out');
                } else {
                    document.body.style.transition = 'opacity 0.5s ease';
                    document.body.style.opacity = '0';
                }

                // Animate Navbar out
                if (window.gsap && document.querySelector('.nav')) {
                    gsap.to('.nav', {
                        y: -64,
                        autoAlpha: 0,
                        filter: 'blur(10px)',
                        duration: 0.5,
                        ease: 'power2.inOut'
                    });
                }

                // Animate Background out
                if (window.gsap && document.getElementById('bg-canvas')) {
                    gsap.to('#bg-canvas', {
                        autoAlpha: 0,
                        filter: 'blur(10px)',
                        duration: 0.5,
                        ease: 'power2.inOut'
                    });
                }

                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });
});
