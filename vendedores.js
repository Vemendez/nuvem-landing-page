/* =========================================================
   NUVEM · Programa de vendedores
   Menú móvil, calculadora de comisión y formulario a WhatsApp
   ========================================================= */
(() => {
  'use strict';

  /* Número de WhatsApp que recibe las solicitudes (solo dígitos, con código país). */
  const WHATSAPP_NUMBER = '18493561320';
  const COMMISSION = 0.10;
  const MONTHS = 12;

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
     Cada cliente paga una mensualidad (m) y/o un pago único (o).
     Mes k (1..12): comisión = n·o·10 % + n·k·m·10 %.
     Desde el mes 12 se mantiene, porque salen los clientes de hace un año
     y entran los nuevos. */
  const fmt = (v) => 'RD$ ' + Math.round(v).toLocaleString('en-US');
  const service = document.getElementById('calcService');
  const count = document.getElementById('calcCount');
  const countOut = document.getElementById('calcCountOut');
  const firstEl = document.getElementById('calcFirst');
  const m12El = document.getElementById('calcMonth12');
  const yearTotalEl = document.getElementById('calcYear');

  const monthCommission = (k, n, m, o) => n * o * COMMISSION + n * Math.min(k, MONTHS) * m * COMMISSION;

  const updateCalc = () => {
    if (!service || !count) return;
    const [m, o] = service.value.split('|').map(Number);
    const n = Number(count.value);
    if (countOut) countOut.textContent = String(n);
    let year = 0;
    for (let k = 1; k <= MONTHS; k += 1) year += monthCommission(k, n, m, o);
    firstEl.textContent = fmt(monthCommission(1, n, m, o));
    m12El.textContent = fmt(monthCommission(12, n, m, o));
    yearTotalEl.textContent = fmt(year);
  };
  service?.addEventListener('change', updateCalc);
  count?.addEventListener('input', updateCalc);
  updateCalc();

  /* ---------- Formulario → WhatsApp ---------- */
  const form = document.getElementById('applyForm');
  const note = document.getElementById('applyNote');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const valid = el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
      el.classList.toggle('is-error', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = 'Completa los campos marcados para continuar.';
      note.className = 'form-note is-error';
      return;
    }
    const d = Object.fromEntries(new FormData(form).entries());
    const text = [
      'Hola Nuvem, quiero aplicar al programa de vendedores.',
      '',
      `Nombre: ${d.nombre}`,
      `WhatsApp: ${d.whatsapp}`,
      `Correo: ${d.correo}`,
      `Ciudad: ${d.ciudad}`,
      `A qué me dedico: ${d.ocupacion}`,
      `Empresas que podría presentar en 3 meses: ${d.empresas}`,
      d.notas ? `Empresas que conozco: ${d.notas}` : '',
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
    note.textContent = 'Se abrió WhatsApp con tus datos. Solo toca "Enviar".';
    note.className = 'form-note is-success';
  });
})();
