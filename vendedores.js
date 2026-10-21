/* =========================================================
   NUVEM · Programa de vendedores
   Menú móvil, calculadora de comisión y formulario por correo
   ========================================================= */
(() => {
  'use strict';

  /* Las solicitudes llegan por correo a través de FormSubmit (formsubmit.co).
     La primera solicitud envía a este correo un mensaje de activación: hay que
     abrirlo y confirmar una sola vez. Después, FormSubmit da un código que puede
     reemplazar el correo en esta dirección para no mostrarlo en el código. */
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/vemendez@nuvem.com.do';
  const PROJECT_COMMISSION = 0.10; // proyectos de un solo pago

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú ---------- */
  const nav = document.getElementById('nav');
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
  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Calculadora ----------
     Cada cliente paga una mensualidad (m) y/o un proyecto de un solo pago (o).
     Comisión por empresa = una mensualidad completa (m) + 10 % del proyecto (o).
     Se cobra una sola vez, a los 15 días del primer pago del cliente. */
  const fmt = (v) => 'RD$ ' + Math.round(v).toLocaleString('en-US');
  const service = document.getElementById('calcService');
  const count = document.getElementById('calcCount');
  const countOut = document.getElementById('calcCountOut');
  const perEl = document.getElementById('calcFirst');
  const monthEl = document.getElementById('calcMonth12');
  const quarterEl = document.getElementById('calcYear');

  const updateCalc = () => {
    if (!service || !count) return;
    const [m, o] = service.value.split('|').map(Number);
    const n = Number(count.value);
    if (countOut) countOut.textContent = String(n);
    const per = m + o * PROJECT_COMMISSION;
    perEl.textContent = fmt(per);
    monthEl.textContent = fmt(per * n);
    quarterEl.textContent = fmt(per * n * 3);
  };
  service?.addEventListener('change', updateCalc);
  count?.addEventListener('input', updateCalc);
  updateCalc();

  /* ---------- Formulario → correo ---------- */
  const form = document.getElementById('applyForm');
  const note = document.getElementById('applyNote');
  const submitBtn = form?.querySelector('button[type="submit"]');

  const setNote = (text, kind) => {
    note.textContent = text;
    note.className = 'form-note' + (kind ? ' is-' + kind : '');
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const valid = el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
      el.classList.toggle('is-error', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      setNote('Completa los campos marcados para continuar.', 'error');
      return;
    }
    const d = Object.fromEntries(new FormData(form).entries());
    if (d._honey) return; // relleno por robots

    const payload = {
      _subject: `Nuevo vendedor: ${d.nombre} (${d.ciudad})`,
      _template: 'table',
      _captcha: 'false',
      'Nombre': d.nombre,
      'WhatsApp': d.whatsapp,
      email: d.correo,
      'Ciudad o provincia': d.ciudad,
      'A qué se dedica': d.ocupacion,
      'Empresas que podría presentar en 3 meses': d.empresas,
      'Tipo de empresas que conoce': d.notas || '—',
      'Fecha de la solicitud': new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' }),
    };

    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Enviando…';
    setNote('', '');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) === 'false') throw new Error(out.message || res.status);
      form.reset();
      setNote('¡Listo! Recibimos tu solicitud. Te contactamos en menos de 24 horas.', 'success');
    } catch (err) {
      setNote('No se pudo enviar. Inténtalo de nuevo o escríbenos a vemendez@nuvem.com.do.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();
