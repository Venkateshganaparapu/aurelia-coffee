document.addEventListener('DOMContentLoaded', () => {
  // 1. Entrance Screen Dismissal (1.2s minimum)
  const entrance = document.getElementById('entranceScreen');
  const startAt = performance.now();
  window.addEventListener('load', () => {
    const elapsed = performance.now() - startAt;
    const delay = Math.max(0, 1200 - elapsed);
    setTimeout(() => {
      entrance.classList.add('loaded');
      setTimeout(() => entrance.remove(), 700);
    }, delay);
  });
  // Safety timeout
  setTimeout(() => {
    if (entrance && !entrance.classList.contains('loaded')) {
      entrance.classList.add('loaded');
    }
  }, 2500);

  // 2. Initialize Lenis Smooth Scrolling
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis;
  if (!isReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 3. Navigation Bar Scroll Appearance & Light/Dark Theme Switching
  const mainNav = document.getElementById('mainNav');
  const lightChapters = document.querySelectorAll('.light-chapter');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    mainNav.classList.toggle('scrolled', y > 40);

    // Check if navbar is currently over a light chapter
    let isOverLight = false;
    lightChapters.forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 60 && r.bottom >= 60) {
        isOverLight = true;
      }
    });
    mainNav.classList.toggle('light-nav', isOverLight);
  }, { passive: true });

  // Mobile Menu
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (burgerBtn && mobileDrawer) {
    burgerBtn.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.m-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth Anchor Links via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -30 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 4. HERO ENTRANCE ANIMATIONS & SCROLL PARALLAX
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !isReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Entrance: staggered reveal after entrance screen fades
    const heroBgVideo = document.getElementById('heroBgVideo');
    const heroBgImg   = document.getElementById('heroBgImg');
    const heroKicker  = document.getElementById('heroKicker');
    const heroHeadline= document.getElementById('heroHeadline');
    const heroSub     = document.getElementById('heroSub');
    const heroActions = document.getElementById('heroActions');
    const heroMeta    = document.getElementById('heroMeta');
    const scrollCue   = document.getElementById('heroScrollCue');

    // Delay entrance until the entrance screen has faded (~1.3s)
    const enterTl = gsap.timeline({ delay: 1.4 });
    enterTl
      .to(heroBgImg, { opacity: 1, duration: 0 }, 0) // ensure img visible
      .to(heroKicker, {
        opacity: 1, y: 0, duration: 0.7,
        ease: 'power3.out'
      }, 0)
      .fromTo(heroHeadline,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' },
      0.15)
      .fromTo(heroSub,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      0.42)
      .fromTo(heroActions,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      0.62)
      .to(heroMeta, {
        opacity: 1, duration: 0.8, ease: 'power2.out'
      }, 0.7)
      .to(scrollCue, {
        opacity: 1, duration: 0.6, ease: 'power2.out'
      }, 0.95);

    // Scroll parallax: background drifts upward as user scrolls past hero
    gsap.to([heroBgVideo, heroBgImg], {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: '18%',
      ease: 'none'
    });

    // Hero content lifts slightly on scroll (text layer)
    gsap.to('#heroContent', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      y: '-8%',
      opacity: 0,
      ease: 'none'
    });

    // Parallax on editorial images
    gsap.to('.photo-portrait-offset', {
      scrollTrigger: {
        trigger: '.magazine-photos-layout',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: -40,
      ease: 'none'
    });

    gsap.to('.photo-aerial-main', {
      scrollTrigger: {
        trigger: '.magazine-photos-layout',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      },
      y: 20,
      ease: 'none'
    });
  }

  // 5. Interactive Craft Rows (Hover & Click State Sync)
  const craftRows = document.querySelectorAll('.craft-row');
  craftRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      craftRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    });
    row.addEventListener('click', () => {
      craftRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    });
  });

  // 6. Interactive Flavor Profile Tabs
  const flavorData = [
    {
      name: "Chikkamagaluru Arabica",
      notes: "Jasmine · Meyer Lemon · Wildflower Honey",
      desc: "Shaped by high elevation morning mist and slow bean maturation, delivering an expressive, tea-like floral cup with dazzling acidity.",
      roast: "Light Roast",
      alt: "1,000–1,400m",
      proc: "Fully Washed",
      brew: "V60 Pour-over, Chemex",
      scores: ["9 / 10", "8 / 10", "9 / 10", "6 / 10", "9 / 10"],
      widths: ["90%", "80%", "90%", "60%", "90%"]
    },
    {
      name: "Kodagu Estate",
      notes: "Caramel · Dutch Cocoa · Malabar Cardamom",
      desc: "Grown under native multi-canopy shade in Coorg, presenting deep toffee richness, warming spice aromatics, and a comforting cocoa finish.",
      roast: "Medium Roast",
      alt: "900–1,500m",
      proc: "Washed & Sun-Dried",
      brew: "South Indian Filter, French Press",
      scores: ["6 / 10", "5 / 10", "9 / 10", "8.5 / 10", "8 / 10"],
      widths: ["60%", "50%", "90%", "85%", "80%"]
    },
    {
      name: "Araku Valley Robusta",
      notes: "Dark Chocolate · Toasted Hazelnut · Organic Jaggery",
      desc: "An extraordinary specialty Robusta cultivated by tribal farmers in Andhra Pradesh, featuring profound dark chocolate syrup and zero harsh bitterness.",
      roast: "Medium Roast",
      alt: "900–1,200m",
      proc: "Naturals",
      brew: "Espresso, Moka Pot, Aeropress",
      scores: ["4 / 10", "3 / 10", "8.5 / 10", "9.5 / 10", "8.5 / 10"],
      widths: ["40%", "30%", "85%", "95%", "85%"]
    },
    {
      name: "Nilgiri Estate Reserve",
      notes: "Toasted Walnut · Brown Sugar · Dark Cocoa",
      desc: "A rich, balanced profile from the Blue Mountains of Tamil Nadu, marrying walnut praline nuances with sweet panela sugar and full body.",
      roast: "Medium-Dark Roast",
      alt: "1,200–1,600m",
      proc: "Pulp Sun-Dried Honey",
      brew: "Cold Brew, Espresso, Pour-over",
      scores: ["5 / 10", "4 / 10", "8 / 10", "9 / 10", "8 / 10"],
      widths: ["50%", "40%", "80%", "90%", "80%"]
    }
  ];

  const flavorBtns = document.querySelectorAll('.flavor-tab-btn');
  const fTitle = document.getElementById('fMetaTitle');
  const fSub = document.getElementById('fMetaSub');
  const fDesc = document.getElementById('fMetaDesc');
  const fRoast = document.getElementById('fMetaRoast');
  const fAlt = document.getElementById('fMetaAlt');
  const fProc = document.getElementById('fMetaProc');
  const fBrew = document.getElementById('fMetaBrew');

  flavorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      flavorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const idx = parseInt(btn.dataset.flavor, 10);
      const item = flavorData[idx];

      fTitle.textContent = item.name;
      fSub.textContent = item.notes;
      fDesc.textContent = item.desc;
      fRoast.textContent = item.roast;
      fAlt.textContent = item.alt;
      fProc.textContent = item.proc;
      fBrew.textContent = item.brew;

      for (let i = 0; i < 5; i++) {
        document.getElementById(`barLabel${i}`).textContent = item.scores[i];
        document.getElementById(`barFill${i}`).style.width = item.widths[i];
      }
    });
  });

});
