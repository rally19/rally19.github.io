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
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.hero-image',
    { scale: 0.8, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 1, delay: 0.3 }
  )
    .fromTo('.hero-greeting',
      { x: -30, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.6 }, '-=0.5'
    )
    .fromTo('.hero-name',
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.7 }, '-=0.3'
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
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.15 }, '-=0.2'
    )
    .fromTo('.hero-stat',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.1 }, '-=0.2'
    );
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
  gsap.set(cards, { y: 40, autoAlpha: 0 });

  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    onEnter: batch => {
      gsap.to(batch, {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          // Cleanup after animation
          gsap.set(batch, { clearProps: 'transform' });
        }
      });
    }
  });
}

// --- Timeline items ---
function animateTimeline() {
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.fromTo(item,
      { x: -30, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          gsap.set(item, { clearProps: 'transform' });
        }
      }
    );
  });
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
  initScrollProgress();
  initMobileNav();
  animateNav();
  animateFooter();

  // Page-specific
  if (document.querySelector('.hero')) animateHero();
  if (document.querySelector('.gs-hidden, .gs-hidden-left, .gs-hidden-right')) animateSections();
  if (document.querySelector('.stagger-group')) animateCards();
  if (document.querySelector('.timeline-item')) animateTimeline();
  if (document.querySelector('.skills-tags')) animateSkillTags();
});
