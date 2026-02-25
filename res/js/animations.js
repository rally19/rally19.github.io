/* ============================================
   GSAP Animations — Shared across all pages
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

// --- Scroll Progress Bar ---
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });
}

// --- Mobile Nav Toggle ---
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    }
  });
  // Close nav on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });
}

// --- Nav entrance ---
function animateNav() {
  gsap.fromTo('.nav',
    { y: -64, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: 'power3.out'
    }
  );
}

// --- Hero entrance ---
function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.2)' } });

  tl.fromTo('.hero-image',
    { scale: 0.8, autoAlpha: 0, rotationY: 15 },
    { scale: 1, autoAlpha: 1, rotationY: 0, duration: 1, delay: 0.3 }
  )
    .fromTo('.hero-greeting',
      { x: -30, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6 }, '-=0.5'
    )
    .fromTo('.hero-name',
      { y: 30, autoAlpha: 0, scale: 0.95 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, '-=0.3'
    )
    .fromTo('.hero-title',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5 }, '-=0.3'
    )
    .fromTo('.hero-typed-wrap',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5 }, '-=0.2'
    )
    .fromTo('.hero-actions .btn',
      { y: 20, autoAlpha: 0, scale: 0.9 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.5)' }, '-=0.2'
    )
    .fromTo('.hero-stat',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' }, '-=0.2'
    );

  // Parallax effect for hero
  gsap.to('.hero-image', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.hero-content', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });
}

// --- Section reveals on scroll ---
function animateSections() {
  // Animate all .gs-hidden elements
  gsap.utils.toArray('.gs-hidden').forEach(el => {
    gsap.fromTo(el,
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          gsap.set(el, { clearProps: 'transform' });
        }
      }
    );
  });

  // Animate .gs-hidden-left
  gsap.utils.toArray('.gs-hidden-left').forEach(el => {
    gsap.fromTo(el,
      { x: -40, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          gsap.set(el, { clearProps: 'transform' });
        }
      }
    );
  });

  // Animate .gs-hidden-right
  gsap.utils.toArray('.gs-hidden-right').forEach(el => {
    gsap.fromTo(el,
      { x: 40, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          gsap.set(el, { clearProps: 'transform' });
        }
      }
    );
  });
}

// --- Stagger cards (Batching for scroll reveal) ---
function animateCards() {
  // Select all stagger items
  const cards = gsap.utils.toArray('.stagger-item');

  // Set initial state
  gsap.set(cards, { y: 50, autoAlpha: 0, scale: 0.97 });

  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    onEnter: batch => {
      gsap.to(batch, {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        overwrite: true,
        onComplete: () => {
          // Cleanup after animation
          gsap.set(batch, { clearProps: 'transform' });
        }
      });
    }
  });
}

// --- Featured Projects GSAP Horizontal Pinned Scroll ---
function animatePinnedCarousel() {
  const container = document.querySelector('.gsap-pinned-carousel');
  const track = document.querySelector('.gsap-carousel-track');

  if (!container || !track) return;

  // Calculate the total scrollable distance based on the track's full width vs the window width
  function getScrollAmount() {
    let trackWidth = track.scrollWidth;
    let amount = trackWidth - window.innerWidth;
    // Ensure we don't scroll backwards or into whitespace if cards fit exactly
    return Math.max(0, amount);
  }

  const tween = gsap.to(track, {
    x: () => -getScrollAmount(), // Use getter to avoid stale values initially
    ease: "none"
  });

  ScrollTrigger.create({
    trigger: container,
    start: "top top",
    end: () => `+=${getScrollAmount()}`, // Positive scroll duration equal to track's scroll width
    pin: true,
    animation: tween,
    scrub: 1, // Smooth scrubbing
    invalidateOnRefresh: true
  });
}

// --- Image Slider Logic ---
window.setSlider = function (sliderId, index) {
  const track = document.getElementById(sliderId);
  if (!track) return;

  // Update transform based on index
  track.style.transform = `translateX(-${index * 100}%)`;
  track.dataset.currentIndex = index;

  // Update dots
  const navId = sliderId.replace('slider', 'nav');
  const nav = document.getElementById(navId);
  if (nav) {
    const dots = nav.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Sync the giant project background with a fade effect
  const giantProject = track.closest('.giant-project');
  if (giantProject) {
    const bg = giantProject.querySelector('.giant-project-bg');
    const activeImg = track.children[index];
    if (bg && activeImg && activeImg.src) {
      gsap.to(bg, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          bg.style.backgroundImage = `url('${activeImg.src}')`;
          // Clear inline opacity so it gracefully fades back to the CSS class value (0.15)
          gsap.to(bg, { clearProps: 'opacity', opacity: 0.15, duration: 0.3 });
        }
      });
    }
  }
};

window.moveSlider = function (sliderId, direction) {
  const track = document.getElementById(sliderId);
  if (!track) return;

  const images = track.querySelectorAll('.slider-image');
  const total = images.length;
  let current = parseInt(track.dataset.currentIndex || 0);

  // Calculate new index wrapping around
  current = (current + direction + total) % total;

  setSlider(sliderId, current);
};

// --- Image Slider Touch/Swipe Support ---
document.querySelectorAll('.slider-container').forEach(container => {
  let startX = 0;
  let currentX = 0;

  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    currentX = startX; // Reset currentX to prevent carry-over
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!startX || !currentX) return;
    let diffX = startX - currentX;

    // 50px threshold for a valid swipe
    if (Math.abs(diffX) > 50) {
      const track = container.querySelector('.slider-track');
      if (track && track.id) {
        if (diffX > 0) {
          window.moveSlider(track.id, 1); // Swiped left -> Next Image
        } else {
          window.moveSlider(track.id, -1); // Swiped right -> Previous Image
        }
      }
    }
    startX = 0;
    currentX = 0;
  });
});

// --- Mobile Overlay Toggle on Project Cards ---
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', (e) => {
    // Only apply toggle logic on mobile screens
    if (window.innerWidth <= 768) {
      // Prevent toggling if the user clicked on a button, link, or slider controls
      if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.slider-nav') || e.target.closest('.slider-click-zone')) {
        return;
      }

      // Toggle the active class that forces the text overlay to appear
      card.classList.toggle('mobile-overlay-active');
    }
  });
});


// --- Global Parallax ---
function animateParallax() {
  gsap.utils.toArray('.giant-project-bg').forEach(bg => {

    // Retrieve speed from data-speed attribute, default to 0.5
    const speed = bg.dataset.speed ? parseFloat(bg.dataset.speed) : 0.5;

    gsap.to(bg, {
      yPercent: 30 * speed, // Move down by 30% of its height
      ease: "none",
      scrollTrigger: {
        trigger: bg.parentElement,
        start: "top bottom", // Start when the top of the section hits the bottom of the viewport
        end: "bottom top",   // End when the bottom of the section hits the top of the viewport
        scrub: 1             // Smooth scrubbing
      }
    });
  });
}

// --- Timeline items & Sticky Image Swap ---
function animateTimeline() {
  const container = document.querySelector('.journey-image-container');

  gsap.utils.toArray('.timeline-trigger').forEach((item, i) => {
    // 1. Entrance animation removed to avoid conflict with pinning and visibility bugs

    // 2. Image Swap & Pin Focus mechanism
    if (container) {
      ScrollTrigger.create({
        trigger: item,
        start: () => window.innerWidth < 769 ? 'top 45%' : 'center center',   // On mobile, trigger slightly higher but still below image
        end: '+=40%',             // Pin the text item for 40% of viewport height scrub distance (shorter distance)
        pin: true,                // Physically lock the text in place while scrolling
        pinSpacing: true,         // Push the next item down automatically
        toggleClass: 'active-timeline',
        invalidateOnRefresh: true, // Re-calculate offsets if the user resizes their window or rotates their phone
        onEnter: () => swapTimelineImage(item.getAttribute('data-image')),
        onEnterBack: () => swapTimelineImage(item.getAttribute('data-image'))
      });
    }
  });

  // Crossfade helper function
  let currentImageSrc = '';
  function swapTimelineImage(newSrc) {
    if (!newSrc || !container) return;

    // Initial check: don't crossfade the very first time we scroll into the first item if it matches the hardcoded one
    if (currentImageSrc === '') {
      const initialImg = container.querySelector('.journey-dynamic-image');
      if (initialImg && initialImg.getAttribute('src') === newSrc) {
        currentImageSrc = newSrc;
        return;
      }
    }

    if (newSrc === currentImageSrc) return;
    currentImageSrc = newSrc;

    // Create the new image and layer it on top
    const newImg = document.createElement('img');
    newImg.src = newSrc;
    newImg.alt = "Journey Milestone";
    newImg.className = "journey-dynamic-image";
    newImg.style.opacity = 0; // Starts invisible

    container.appendChild(newImg);

    // Smoothly fade in the new image
    gsap.to(newImg, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });

    // Smoothly fade out the old images and delete them
    const oldImgs = container.querySelectorAll('.journey-dynamic-image:not(:last-child)');
    if (oldImgs.length > 0) {
      gsap.to(oldImgs, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          oldImgs.forEach(img => img.remove());
        }
      });
    }
  }
}

// --- Skill tags stagger ---
function animateSkillTags() {
  gsap.utils.toArray('.skills-tags').forEach(group => {
    const tags = group.querySelectorAll('.skill-tag');
    gsap.fromTo(tags,
      { scale: 0.8, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.04,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: group,
          start: 'top 95%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          gsap.set(tags, { clearProps: 'transform' });
        }
      }
    );
  });
}

// --- Footer entrance ---
function animateFooter() {
  gsap.fromTo('.footer',
    { y: 30, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 98%',
        toggleActions: 'play none none none'
      },
      onComplete: () => {
        gsap.set('.footer', { clearProps: 'transform' });
      }
    }
  );
}

// --- Init all ---
document.addEventListener('DOMContentLoaded', () => {
  function initAllAnimations() {
    initScrollProgress();
    initMobileNav();
    animateNav();
    animateFooter();

    // Page-specific
    if (document.querySelector('.hero')) animateHero();
    if (document.querySelector('.gs-hidden, .gs-hidden-left, .gs-hidden-right')) animateSections();
    if (document.querySelector('.gsap-pinned-carousel')) animatePinnedCarousel();
    if (document.querySelector('.giant-project')) animateParallax();
    if (document.querySelector('.stagger-group')) animateCards();
    if (document.querySelector('.timeline-item')) animateTimeline();
    if (document.querySelector('.skills-tags')) animateSkillTags();
  }

  // If the splash screen is currently active in the DOM, wait for it to finish and glitch out.
  // Otherwise, if it was skipped (already seen), run animations immediately.
  if (document.querySelector('.terminal-splash')) {
    document.addEventListener('splashFinished', initAllAnimations);
  } else {
    initAllAnimations();
  }
});
