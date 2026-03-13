// =============================================
//  ELEVIA CLINIC — main.js
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ---- MOBILE DRAWER ----
  const hamburger    = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay= document.getElementById('drawerOverlay');
  const drawerClose  = document.getElementById('drawerClose');

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // Close drawer on nav link click
  document.querySelectorAll('.drawer-nav a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // ---- SCROLL ANIMATIONS (Intersection Observer) ----
  const animateEls = document.querySelectorAll('[data-animate]');
  if (animateEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings in the same parent
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 80}ms`;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animateEls.forEach(el => observer.observe(el));
  }

  // ---- SERVICES ACCORDION ----
  document.querySelectorAll('.service-header').forEach(header => {
    header.addEventListener('click', () => toggleService(header));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleService(header);
      }
    });
  });

  function toggleService(header) {
    const item = header.closest('.service-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.service-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.service-header').setAttribute('aria-expanded', 'false');
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      item.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
    }
  }

  // ---- TESTIMONIALS CAROUSEL ----
  const track  = document.getElementById('testimonialTrack');
  const dotsEl = document.getElementById('tDots');
  const tPrev  = document.getElementById('tPrev');
  const tNext  = document.getElementById('tNext');

  if (track) {
    const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
    let current = 0;
    let autoTimer;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl?.appendChild(dot);
    });

    function goTo(index) {
      slides[current].classList.remove('active');
      dotsEl?.querySelectorAll('.t-dot')[current]?.classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dotsEl?.querySelectorAll('.t-dot')[current]?.classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    tPrev?.addEventListener('click', () => { prev(); resetTimer(); });
    tNext?.addEventListener('click', () => { next(); resetTimer(); });

    function resetTimer() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 5500);
    }

    // Init
    slides[0]?.classList.add('active');
    autoTimer = setInterval(next, 5500);

    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', resetTimer);
  }

  // ---- COUNT-UP ANIMATION ----
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);

      if (target >= 10000) {
        el.textContent = value.toLocaleString() + suffix;
      } else {
        el.textContent = value + suffix;
      }

      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- BOOKING FORM ----
  const bookingForm = document.getElementById('bookingForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError   = document.getElementById('formError');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formSuccess.style.display = 'none';
      formError.style.display   = 'none';

      // Clear previous errors
      bookingForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      let valid = true;
      const required = bookingForm.querySelectorAll('[required]');

      required.forEach(field => {
        const val = field.value.trim();
        if (!val) {
          field.classList.add('error');
          valid = false;
        }
        if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          field.classList.add('error');
          valid = false;
        }
      });

      if (!valid) {
        formError.style.display = 'block';
        return;
      }

      // Simulate form submission
      const btn = bookingForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        formSuccess.style.display = 'block';
        bookingForm.reset();
        btn.textContent = 'Request Appointment';
        btn.disabled = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });

    // Clear error on input
    bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  }

  // ---- CONTACT FORM (contact page) ----
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactSuccess && (contactSuccess.style.display = 'none');
      contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      let valid = true;
      contactForm.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) { field.classList.add('error'); valid = false; }
        if (field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('error'); valid = false;
        }
      });

      if (!valid) return;

      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        if (contactSuccess) contactSuccess.style.display = 'block';
        contactForm.reset();
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 1200);
    });
  }

  // ---- SMOOTH SCROLL for # links ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
