/* =========================================================
   NUVEM · Landing page interactions
   ========================================================= */
(() => {
  'use strict';

  /* WhatsApp Business — reemplaza con tu número real (solo dígitos, con código país).
     Ejemplo República Dominicana: '18095551234' */
  const WHATSAPP_NUMBER = '18493561320';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else {
      const play = heroVideo.play();
      if (play && typeof play.catch === 'function') play.catch(() => {});
    }
  }

  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola NuVEM, quiero solicitar un diagnóstico financiero.')}`
    : '#contacto';

  ['whatsappCta', 'whatsappLink'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('href', whatsappHref);
    if (WHATSAPP_NUMBER) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      if (id === 'whatsappLink') el.textContent = '+1 (849) 356-1320';
    }
  });

  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  navLinks?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const revealTargets = document.querySelectorAll(
    '.eco-logo, .problem-card, .tech-card, .case-card, .diff-card, .conocenos__photo, .conocenos__content, .price-card, .process__step, .contact-form, .cta-band__inner, .tech-band'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

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

    ['name', 'company', 'email', 'system', 'volume', 'service', 'message'].forEach((field) => {
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

    // Simulación de envío. En producción: Formspree / EmailJS / backend.
    setTimeout(() => {
      setNote('¡Gracias! Recibimos su diagnóstico. Le contactaremos en menos de 24 horas.', 'success');
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar diagnóstico';
      }
    }, 800);
  });
})();
