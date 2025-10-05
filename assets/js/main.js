(function () {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.querySelector('.nav-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu?.classList.toggle('show');
    });
  }
  navMenu?.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.classList.contains('nav-link')) {
      navMenu.classList.remove('show');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // Theme toggle (persist)
  const storedTheme = localStorage.getItem('theme') || 'dark';
  if (storedTheme === 'light') {
    root.setAttribute('data-theme', 'light');
  }
  themeToggle?.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });

  // Smooth scroll active state highlighting
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const idx = sections.indexOf(entry.target);
      if (idx >= 0) {
        const link = links[idx];
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('is-current'));
          link.classList.add('is-current');
        }
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(s => observer.observe(s));

  // Reveal on scroll animations
  const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-up, .hero-content, .hero-visual'));
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Parallax shapes subtle move
  const parallaxShapes = Array.from(document.querySelectorAll('.shape'));
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    parallaxShapes.forEach((el, i) => {
      const depth = (i + 1) * 2;
      el.style.transform = `translate(${x / depth}px, ${y / depth}px)`;
    });
  });

  // Interactive skill bars
  const skillBars = Array.from(document.querySelectorAll('.skill-bar'));
  skillBars.forEach((bar) => {
    const fill = document.createElement('div');
    fill.className = 'fill';
    bar.appendChild(fill);
  });
  const skillsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const val = Number(bar.getAttribute('data-value')) || 0;
        bar.style.setProperty('--val', String(val));
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.35 });
  skillBars.forEach(b => skillsObserver.observe(b));

  // Achievements counter
  const counters = Array.from(document.querySelectorAll('.metric-value'));
  const animateCount = (el, to) => {
    const durationMs = 1200;
    const start = performance.now();
    const from = 0;
    const step = (ts) => {
      const p = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const to = Number(entry.target.getAttribute('data-count')) || 0;
        animateCount(entry.target, to);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  // Project modals
  const openButtons = Array.from(document.querySelectorAll('[data-open-modal]'));
  const closeButtons = Array.from(document.querySelectorAll('[data-close-modal]'));
  const getModalById = (id) => document.getElementById(`modal-${id}`);
  const openModal = (modal) => {
    modal?.setAttribute('aria-hidden', 'false');
    modal?.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = (modal) => {
    modal?.setAttribute('aria-hidden', 'true');
    modal?.setAttribute('aria-modal', 'false');
    document.body.style.overflow = '';
  };
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-modal');
      const modal = getModalById(id);
      openModal(modal);
    });
  });
  closeButtons.forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal[aria-hidden="false"]').forEach(m => closeModal(m));
    }
  });
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains('modal')) {
      closeModal(target);
    }
  });

  // Contact form (client-side validation only)
  const form = document.getElementById('contactForm');
  const statusEl = form?.querySelector('.form-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    let valid = true;
    const setError = (el, msg) => { const err = el.parentElement.querySelector('.error'); err.textContent = msg || ''; };
    setError(form.name, ''); setError(form.email, ''); setError(form.message, '');

    if (!name) { setError(form.name, 'Please enter your name'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(form.email, 'Please enter a valid email'); valid = false; }
    if (!message) { setError(form.message, 'Please enter a message'); valid = false; }

    if (!valid) return;

    // Simulate submission
    statusEl.textContent = 'Sending...';
    setTimeout(() => {
      statusEl.textContent = 'Thanks! Your message has been sent.';
      form.reset();
    }, 900);
  });
})();

