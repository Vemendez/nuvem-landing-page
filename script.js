/* =========================================================
   NUVEM · Landing page interactions
   ========================================================= */
(() => {
  'use strict';

  /* ----- Año dinámico en footer ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Navbar: sombra al hacer scroll ----- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Menú móvil ----- */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    nav?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  };

  burger?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----- Reveal on scroll ----- */
  const revealTargets = document.querySelectorAll(
    '.hero__copy, .hero__media, .services-intro__card, .about-split__media img, .quote-card, .pillar, .service, .price-card, .process__step, .contact-form, .cta-band__inner'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ----- Formulario de contacto ----- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  const setNote = (msg, type = '') => {
    if (!note) return;
    note.textContent = msg;
    note.classList.remove('is-success', 'is-error');
    if (type) note.classList.add(`is-${type}`);
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    let hasError = false;

    ['name', 'company', 'email', 'service'].forEach(field => {
      const input = form.elements.namedItem(field);
      if (!input) return;
      const val = (data.get(field) || '').toString().trim();
      const invalid = !val || (field === 'email' && !validateEmail(val));
      input.classList.toggle('is-error', invalid);
      if (invalid) hasError = true;
    });

    if (hasError) {
      setNote('Por favor complete los campos requeridos correctamente.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }

    // Simulación de envío. En producción, conectar a backend / Formspree / email service.
    setTimeout(() => {
      setNote('¡Gracias! Recibimos su solicitud. Le contactaremos en menos de 24 horas.', 'success');
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud';
      }
    }, 800);
  });
})();
