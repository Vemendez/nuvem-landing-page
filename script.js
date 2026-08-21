/* =========================================================
   NUVEM · Landing page interactions
   ========================================================= */
(() => {
  'use strict';

  /* WhatsApp Business — reemplaza con tu número real (solo dígitos, con código país).
     Ejemplo República Dominicana: '18095551234' */
  const WHATSAPP_NUMBER = '18493561320';

  /* Calendly — enlace del tipo de evento (no solo el perfil).
     En Calendly: Event type → Share → Copy link.
     Ejemplo: 'https://calendly.com/nuvem/evaluacion-financiera' */
  const CALENDLY_URL = 'https://calendly.com/vemendez-nuvem/30min';

  const POWERBI_URL = 'https://app.powerbi.com/view?r=eyJrIjoiOWUyNzVjMjYtNmZjOC00NmNmLWE5NDYtODRlM2JkMjBmNjM4IiwidCI6IjE3NjUwZjM0LTExZDQtNDdlZS05YzQ0LTRhNmQyYWY0ZjE5YiJ9';

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
    '.eco-logo, .problem-card, .tech-card, .agent-card, .case-card, .diff-card, .conocenos__photo, .conocenos__content, .price-card, .process__step, .calendly-card, .cta-band__inner, .dashboard-frame'
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

  const calendlyHref = () => {
    try {
      const url = new URL(CALENDLY_URL);
      if (!url.searchParams.has('hide_gdpr_banner')) url.searchParams.set('hide_gdpr_banner', '1');
      if (!url.searchParams.has('background_color')) url.searchParams.set('background_color', 'ffffff');
      if (!url.searchParams.has('text_color')) url.searchParams.set('text_color', '0f172a');
      if (!url.searchParams.has('primary_color')) url.searchParams.set('primary_color', '0b1e3f');
      return url.toString();
    } catch {
      return CALENDLY_URL;
    }
  };

  const whenCalendlyReady = (callback) => {
    if (window.Calendly) {
      callback();
      return;
    }

    if (!document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.Calendly) {
        clearInterval(timer);
        callback();
      } else if (tries > 50) {
        clearInterval(timer);
      }
    }, 100);
  };

  const fallback = document.getElementById('calendlyFallback');
  const fallbackLink = document.getElementById('calendlyFallbackLink');
  if (fallbackLink && CALENDLY_URL) {
    fallbackLink.setAttribute('href', CALENDLY_URL);
    fallbackLink.setAttribute('target', '_blank');
    fallbackLink.setAttribute('rel', 'noopener noreferrer');
  }

  const embed = document.getElementById('calendlyEmbed');
  whenCalendlyReady(() => {
    if (!embed || !window.Calendly || !CALENDLY_URL) return;
    window.Calendly.initInlineWidget({
      url: calendlyHref(),
      parentElement: embed,
    });
    if (fallback) fallback.hidden = true;
  });

  const prefersTouchDashboard = window.matchMedia('(max-width: 720px), (hover: none) and (pointer: coarse)').matches
    || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const dashboardFrame = document.querySelector('.dashboard-frame');
  const dashboardEmbed = document.querySelector('.dashboard-frame__embed');
  if (prefersTouchDashboard) {
    dashboardFrame?.classList.add('is-mobile-fallback');
    if (dashboardEmbed) {
      dashboardEmbed.removeAttribute('src');
      dashboardEmbed.setAttribute('hidden', '');
    }
  }
  const dashboardMobileLink = document.getElementById('dashboardMobileLink');
  if (dashboardMobileLink) dashboardMobileLink.setAttribute('href', POWERBI_URL);

  document.querySelectorAll('[data-calendly]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (!CALENDLY_URL) return;
      e.preventDefault();
      whenCalendlyReady(() => {
        if (!window.Calendly) {
          window.location.hash = 'contacto';
          return;
        }
        window.Calendly.initPopupWidget({ url: calendlyHref() });
      });
    });
  });
})();
