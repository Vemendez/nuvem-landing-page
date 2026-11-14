/* =========================================================
   NUVEM · Tablero de demostración (Lumina, empresa ficticia)
   HTML + CSS + JavaScript, sin bibliotecas externas.
   Todos los datos son ilustrativos y se generan aquí mismo.
   ========================================================= */
(() => {
  const root = document.querySelector('[data-dash]');
  if (!root) return;

  /* ---------- Datos ilustrativos ---------- */
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const N = 24;                                   // nov 2024 … oct 2026
  const mes = (i) => { const t = 10 + i; return { y: 2024 + Math.floor(t / 12), m: t % 12 }; };
  const etiquetaMes = (i) => { const { y, m } = mes(i); return `${MESES[m]} ${y}`; };

  let semilla = 11;
  const azar = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };

  const ESTACION = [0.92, 0.9, 1.0, 0.97, 1.02, 0.98, 0.96, 1.0, 0.97, 1.03, 1.06, 1.22];
  const SUCURSALES = { sd: { nombre: 'Santo Domingo', base: 8.1 }, sti: { nombre: 'Santiago', base: 4.4 } };
  const porSucursal = {};
  for (const k of Object.keys(SUCURSALES)) {
    porSucursal[k] = [];
    for (let i = 0; i < N; i++) {
      const ing = SUCURSALES[k].base * Math.pow(1.11, i / 12) * ESTACION[mes(i).m] * (0.96 + azar() * 0.08);
      const costo = ing * (0.575 + azar() * 0.03);
      const gastos = ing * 0.17 + SUCURSALES[k].base * 0.07 * (0.95 + azar() * 0.1);
      porSucursal[k].push({ ing, costo, gastos });
    }
  }
  const empresa = porSucursal.sd.map((a, i) => {
    const b = porSucursal.sti[i];
    return { ing: a.ing + b.ing, costo: a.costo + b.costo, gastos: a.gastos + b.gastos };
  });

  // Efectivo, inversiones y deuda: siempre de toda la empresa.
  const DEPRECIACION = 0.32, INTERESES = 0.18, CUOTA = 0.45, ISR = 0.75;
  const CAPEX = { 3: 1.8, 8: 0.9, 15: 3.4, 20: 1.2 };
  const PRESTAMO_NUEVO = { 15: 3.0 };
  const DIVIDENDOS = { 4: 5.0, 16: 6.0 };
  const caja = [], operacion = [], inversion = [], financiamiento = [], deuda = [], capexAcum = [];
  let saldo = 6.0, debe = 26, acum = 0;
  for (let i = 0; i < N; i++) {
    const e = empresa[i];
    const ebitda = e.ing - e.costo - e.gastos;
    const op = ebitda - INTERESES - ISR - (azar() - 0.35) * 0.9;
    const inv = -(CAPEX[i] || 0);
    const nuevo = PRESTAMO_NUEVO[i] || 0;
    const fin = -CUOTA + nuevo - (DIVIDENDOS[i] || 0);
    debe += nuevo - CUOTA;
    acum += CAPEX[i] || 0;
    saldo += op + inv + fin;
    operacion.push(op); inversion.push(inv); financiamiento.push(fin);
    caja.push(saldo); deuda.push(debe); capexAcum.push(acum);
  }
  const cajaAntes = (i) => (i === 0 ? 6.0 : caja[i - 1]);

  /* ---------- Formato ---------- */
  const nf1 = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const rd = (v) => `${v < 0 ? '−' : ''}RD$ ${nf1.format(Math.abs(v))} M`;
  const signo = (v) => `${v < 0 ? '−' : '+'}${nf1.format(Math.abs(v))}`;
  const pct = (v) => `${nf1.format(v * 100)} %`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const suma = (arr, f) => arr.reduce((t, x) => t + f(x), 0);

  /* ---------- Estado y filtros ---------- */
  const selPeriodo = root.querySelector('#dash-periodo');
  const selSucursal = root.querySelector('#dash-sucursal');
  const ventana = () => {
    const p = selPeriodo.value;
    if (p === 'ytd') return { s: 14, e: N - 1, nombre: 'enero–octubre 2026' };
    if (p === '3') return { s: N - 3, e: N - 1, nombre: 'agosto–octubre 2026' };
    return { s: N - 12, e: N - 1, nombre: 'nov 2025 – oct 2026' };
  };
  const serie = () => (selSucursal.value === 'todas' ? empresa : porSucursal[selSucursal.value]);
  const rango = (s, e) => Array.from({ length: e - s + 1 }, (_, k) => s + k);

  /* ---------- Piezas comunes ---------- */
  const SVG = 'http://www.w3.org/2000/svg';
  const techo = (v) => {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= v) return k * p;
    return 10 * p;
  };
  const barraArriba = (x, y, w, h, r = 4) => {
    r = Math.max(0, Math.min(r, w / 2, h));
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  };

  function tooltip(cont) {
    let tip = cont.querySelector('.dash-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'dash-tip';
      tip.hidden = true;
      cont.appendChild(tip);
    }
    return {
      mostrar(x, html) {
        tip.innerHTML = html;
        tip.hidden = false;
        const w = tip.offsetWidth, W = cont.clientWidth;
        tip.style.left = `${Math.max(0, Math.min(W - w, x - w / 2))}px`;
      },
      ocultar() { tip.hidden = true; },
    };
  }

  function tablaDatos(titulo, cabeza, filas) {
    return `<details class="dash-datos"><summary>Ver los datos de «${esc(titulo)}»</summary>
      <div class="dash-datos__wrap"><table><thead><tr>${cabeza.map((c, k) => `<th scope="col"${k ? ' class="num"' : ''}>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${filas.map((f) => `<tr>${f.map((c, k) => (k ? `<td class="num">${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }

  function eje(svg, W, H, m, max) {
    const redondo = (x) => { const p = Math.pow(10, Math.floor(Math.log10(x))); return [1, 2, 2.5, 5, 10].some((k) => Math.abs(x / p - k) < 1e-9); };
    const ticks = [5, 4, 3, 6].find((t) => redondo(max / t)) || 4;
    for (let t = 0; t <= ticks; t++) {
      const v = (max / ticks) * t;
      const y = m.t + (H - m.t - m.b) * (1 - v / max);
      const l = document.createElementNS(SVG, 'line');
      l.setAttribute('x1', m.l); l.setAttribute('x2', W - m.r);
      l.setAttribute('y1', y); l.setAttribute('y2', y);
      l.setAttribute('class', t === 0 ? 'dash-base' : 'dash-grid');
      svg.appendChild(l);
      const tx = document.createElementNS(SVG, 'text');
      tx.setAttribute('x', m.l - 8); tx.setAttribute('y', y + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('class', 'dash-tick');
      tx.textContent = nf1.format(v).replace(/[.,]0$/, '');
      svg.appendChild(tx);
    }
  }

  function nuevoSvg(cont, W, H, etiqueta) {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', etiqueta);
    cont.querySelector('svg')?.remove();
    cont.prepend(svg);
    return svg;
  }

  /* ---------- Gráfico: ingresos y gastos por mes (barras agrupadas) ---------- */
  function graficoMeses(cont, idx, datos) {
    const W = Math.max(280, cont.clientWidth), H = 250, m = { t: 14, r: 6, b: 30, l: 40 };
    const series = [
      { nombre: 'Ingresos', cls: 's1', v: idx.map((i) => datos[i].ing) },
      { nombre: 'Costos y gastos', cls: 's2', v: idx.map((i) => datos[i].costo + datos[i].gastos) },
    ];
    const max = techo(Math.max(...series.flatMap((s) => s.v)));
    const svg = nuevoSvg(cont, W, H, 'Ingresos y costos más gastos por mes, en millones de pesos');
    eje(svg, W, H, m, max);
    const gw = (W - m.l - m.r) / idx.length;
    const bw = Math.min(24, (gw * 0.72 - 2) / 2);
    const alto = H - m.t - m.b;
    const tip = tooltip(cont);
    const grupos = [];
    idx.forEach((i, k) => {
      const g = document.createElementNS(SVG, 'g');
      const x0 = m.l + gw * k + (gw - (bw * 2 + 2)) / 2;
      series.forEach((s, j) => {
        const h = (s.v[k] / max) * alto;
        const p = document.createElementNS(SVG, 'path');
        p.setAttribute('d', barraArriba(x0 + j * (bw + 2), m.t + alto - h, bw, h));
        p.setAttribute('class', `dash-mark ${s.cls}`);
        g.appendChild(p);
      });
      const paso = gw < 34 ? 2 : 1;
      if ((idx.length - 1 - k) % paso === 0) {
        const tx = document.createElementNS(SVG, 'text');
        tx.setAttribute('x', m.l + gw * k + gw / 2); tx.setAttribute('y', H - 10);
        tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('class', 'dash-tick');
        tx.textContent = MESES[mes(i).m];
        g.appendChild(tx);
      }
      const hit = document.createElementNS(SVG, 'rect');
      hit.setAttribute('x', m.l + gw * k); hit.setAttribute('y', m.t);
      hit.setAttribute('width', gw); hit.setAttribute('height', alto);
      hit.setAttribute('class', 'dash-hit'); hit.setAttribute('tabindex', '0');
      const res = series[0].v[k] - series[1].v[k];
      hit.setAttribute('aria-label', `${etiquetaMes(i)}: ingresos ${rd(series[0].v[k])}, costos y gastos ${rd(series[1].v[k])}, resultado ${rd(res)}`);
      const on = () => {
        grupos.forEach((o) => o.classList.toggle('dim', o !== g));
        tip.mostrar(m.l + gw * k + gw / 2, `<strong>${etiquetaMes(i)}</strong>
          <span><i class="dash-key s1"></i>Ingresos <b>${rd(series[0].v[k])}</b></span>
          <span><i class="dash-key s2"></i>Costos y gastos <b>${rd(series[1].v[k])}</b></span>
          <span>Resultado <b>${rd(res)}</b></span>`);
      };
      const off = () => { grupos.forEach((o) => o.classList.remove('dim')); tip.ocultar(); };
      hit.addEventListener('pointerenter', on); hit.addEventListener('focus', on);
      hit.addEventListener('pointerdown', on);
      hit.addEventListener('pointerleave', () => { if (document.activeElement !== hit) off(); });
      hit.addEventListener('blur', off);
      g.appendChild(hit);
      svg.appendChild(g);
      grupos.push(g);
    });
  }

  /* ---------- Gráfico: efectivo al cierre de cada mes (línea) ---------- */
  function graficoCaja(cont, idx) {
    const W = Math.max(280, cont.clientWidth), H = 220, m = { t: 14, r: 12, b: 30, l: 40 };
    const v = idx.map((i) => caja[i]);
    const max = techo(Math.max(...v));
    const svg = nuevoSvg(cont, W, H, 'Efectivo al cierre de cada mes, en millones de pesos');
    eje(svg, W, H, m, max);
    const alto = H - m.t - m.b;
    const xs = idx.map((_, k) => (idx.length === 1 ? (m.l + W - m.r) / 2 : m.l + ((W - m.l - m.r) * k) / (idx.length - 1)));
    const ys = v.map((x) => m.t + alto * (1 - x / max));
    const linea = document.createElementNS(SVG, 'polyline');
    linea.setAttribute('points', xs.map((x, k) => `${x},${ys[k]}`).join(' '));
    linea.setAttribute('class', 'dash-line s1');
    svg.appendChild(linea);
    const paso = (W - m.l - m.r) / idx.length < 34 ? 2 : 1;
    idx.forEach((i, k) => {
      if ((idx.length - 1 - k) % paso) return;
      const tx = document.createElementNS(SVG, 'text');
      tx.setAttribute('x', xs[k]); tx.setAttribute('y', H - 10);
      tx.setAttribute('text-anchor', k === 0 && idx.length > 1 ? 'start' : k === idx.length - 1 && idx.length > 1 ? 'end' : 'middle');
      tx.setAttribute('class', 'dash-tick');
      tx.textContent = MESES[mes(i).m];
      svg.appendChild(tx);
    });
    // Último valor rotulado directamente.
    const ult = idx.length - 1;
    const dot = document.createElementNS(SVG, 'circle');
    dot.setAttribute('cx', xs[ult]); dot.setAttribute('cy', ys[ult]); dot.setAttribute('r', 4.5);
    dot.setAttribute('class', 'dash-dot s1');
    svg.appendChild(dot);

    const cruz = document.createElementNS(SVG, 'line');
    cruz.setAttribute('y1', m.t); cruz.setAttribute('y2', m.t + alto);
    cruz.setAttribute('class', 'dash-cross'); cruz.style.display = 'none';
    svg.appendChild(cruz);
    const foco = document.createElementNS(SVG, 'circle');
    foco.setAttribute('r', 5); foco.setAttribute('class', 'dash-dot s1'); foco.style.display = 'none';
    svg.appendChild(foco);
    const tip = tooltip(cont);
    let actual = ult;
    const ver = (k) => {
      actual = k;
      cruz.setAttribute('x1', xs[k]); cruz.setAttribute('x2', xs[k]); cruz.style.display = '';
      foco.setAttribute('cx', xs[k]); foco.setAttribute('cy', ys[k]); foco.style.display = '';
      tip.mostrar(xs[k], `<strong>${etiquetaMes(idx[k])}</strong><span>Efectivo al cierre <b>${rd(v[k])}</b></span>`);
    };
    const quitar = () => { cruz.style.display = 'none'; foco.style.display = 'none'; tip.ocultar(); };
    const hit = document.createElementNS(SVG, 'rect');
    hit.setAttribute('x', m.l); hit.setAttribute('y', m.t);
    hit.setAttribute('width', W - m.l - m.r); hit.setAttribute('height', alto);
    hit.setAttribute('class', 'dash-hit'); hit.setAttribute('tabindex', '0');
    hit.setAttribute('aria-label', `Efectivo al cierre de cada mes. Último: ${etiquetaMes(idx[ult])}, ${rd(v[ult])}. Use las flechas para recorrer los meses.`);
    const alPuntero = (ev) => {
      const r = svg.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * W;
      let mejor = 0;
      xs.forEach((xx, k) => { if (Math.abs(xx - x) < Math.abs(xs[mejor] - x)) mejor = k; });
      ver(mejor);
    };
    hit.addEventListener('pointermove', alPuntero);
    hit.addEventListener('pointerdown', alPuntero);
    hit.addEventListener('pointerleave', () => { if (document.activeElement !== hit) quitar(); });
    hit.addEventListener('focus', () => ver(actual));
    hit.addEventListener('blur', quitar);
    hit.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        ver(Math.max(0, Math.min(idx.length - 1, actual + (ev.key === 'ArrowRight' ? 1 : -1))));
      }
    });
    svg.appendChild(hit);
  }

  /* ---------- Gráfico: de dónde vino y a dónde fue el efectivo (cascada) ---------- */
  function graficoCascada(cont, pasos) {
    const W = Math.max(280, cont.clientWidth), H = 250, m = { t: 22, r: 6, b: 44, l: 40 };
    let corre = 0;
    const barras = pasos.map((p) => {
      if (p.total) { corre = p.v; return { ...p, a: 0, b: p.v }; }
      const a = corre; corre += p.v; return { ...p, a, b: corre };
    });
    const max = techo(Math.max(...barras.map((b) => Math.max(b.a, b.b))));
    const svg = nuevoSvg(cont, W, H, 'Movimiento del efectivo del período, en millones de pesos');
    eje(svg, W, H, m, max);
    const alto = H - m.t - m.b;
    const gw = (W - m.l - m.r) / barras.length;
    const bw = Math.min(56, gw * 0.62);
    const y = (v) => m.t + alto * (1 - v / max);
    const tip = tooltip(cont);
    barras.forEach((b, k) => {
      const x = m.l + gw * k + (gw - bw) / 2;
      const top = y(Math.max(b.a, b.b)), h = Math.max(1, Math.abs(y(b.a) - y(b.b)));
      const r = document.createElementNS(SVG, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', top); r.setAttribute('width', bw); r.setAttribute('height', h);
      r.setAttribute('rx', 3);
      r.setAttribute('class', `dash-mark ${b.total ? 'tot' : b.v >= 0 ? 's1' : 's2'}`);
      svg.appendChild(r);
      const val = document.createElementNS(SVG, 'text');
      val.setAttribute('x', x + bw / 2); val.setAttribute('y', top - 6);
      val.setAttribute('text-anchor', 'middle'); val.setAttribute('class', 'dash-val');
      val.textContent = b.total ? nf1.format(b.v) : signo(b.v);
      svg.appendChild(val);
      const lineas = gw < 76 ? [b.corto] : b.nombre.split(' ');
      lineas.forEach((t, n) => {
        const tx = document.createElementNS(SVG, 'text');
        tx.setAttribute('x', m.l + gw * k + gw / 2); tx.setAttribute('y', H - 26 + n * 14);
        tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('class', 'dash-tick');
        tx.textContent = t;
        svg.appendChild(tx);
      });
      if (k < barras.length - 1 && !barras[k + 1].total) {
        const c = document.createElementNS(SVG, 'line');
        c.setAttribute('x1', x + bw); c.setAttribute('x2', x + gw);
        c.setAttribute('y1', y(b.b)); c.setAttribute('y2', y(b.b));
        c.setAttribute('class', 'dash-link');
        svg.appendChild(c);
      }
      const hit = document.createElementNS(SVG, 'rect');
      hit.setAttribute('x', m.l + gw * k); hit.setAttribute('y', m.t);
      hit.setAttribute('width', gw); hit.setAttribute('height', alto);
      hit.setAttribute('class', 'dash-hit'); hit.setAttribute('tabindex', '0');
      hit.setAttribute('aria-label', `${b.nombre}: ${b.total ? rd(b.v) : signo(b.v) + ' millones'}`);
      const on = () => tip.mostrar(m.l + gw * k + gw / 2, `<strong>${esc(b.nombre)}</strong><span>${b.total ? 'Saldo' : b.v >= 0 ? 'Entró' : 'Salió'} <b>${rd(Math.abs(b.v))}</b></span>`);
      hit.addEventListener('pointerenter', on); hit.addEventListener('focus', on);
      hit.addEventListener('pointerdown', on);
      hit.addEventListener('pointerleave', () => { if (document.activeElement !== hit) tip.ocultar(); });
      hit.addEventListener('blur', tip.ocultar);
      svg.appendChild(hit);
    });
  }

  /* ---------- Pintar ---------- */
  const kpiCont = root.querySelector('#dash-kpis');
  const panelRes = root.querySelector('#panel-res');
  const panelBal = root.querySelector('#panel-bal');
  const panelCaja = root.querySelector('#panel-caja');
  const aviso = root.querySelector('#dash-aviso');

  function delta(actual, antes, enPuntos) {
    const d = enPuntos ? (actual - antes) * 100 : (actual / antes - 1) * 100;
    const sube = d >= 0;
    const txt = `${sube ? '▲' : '▼'} ${nf1.format(Math.abs(d))} ${enPuntos ? 'pts' : '%'}`;
    return `<span class="${sube ? 'sube' : 'baja'}">${txt}</span>`;
  }

  function pintarKpis(w, d) {
    const idx = rango(w.s, w.e), ant = rango(w.s - 12, w.e - 12);
    const tot = (ix) => {
      const ing = suma(ix, (i) => d[i].ing), costo = suma(ix, (i) => d[i].costo), gastos = suma(ix, (i) => d[i].gastos);
      return { ing, margen: (ing - costo) / ing, ebitda: ing - costo - gastos };
    };
    const a = tot(idx), b = tot(ant);
    const kpis = [
      ['Ingresos', rd(a.ing), delta(a.ing, b.ing)],
      ['Margen bruto', pct(a.margen), delta(a.margen, b.margen, true)],
      ['EBITDA', rd(a.ebitda), delta(a.ebitda, b.ebitda)],
      ['Efectivo al cierre', rd(caja[w.e]), delta(caja[w.e], caja[w.e - 12])],
    ];
    kpiCont.innerHTML = kpis.map(([k, v, dd]) => `<div class="dash-kpi"><p class="dash-kpi__k">${k}</p><p class="dash-kpi__v">${v}</p><p class="dash-kpi__d">${dd} <span>vs. un año antes</span></p></div>`).join('');
  }

  function pintarResultados(w, d) {
    const idx = rango(w.s, w.e);
    const ing = suma(idx, (i) => d[i].ing), costo = suma(idx, (i) => d[i].costo), gastos = suma(idx, (i) => d[i].gastos);
    const parte = d === empresa ? 1 : ing / suma(idx, (i) => empresa[i].ing);
    const dep = DEPRECIACION * idx.length * parte, intr = INTERESES * idx.length * parte;
    const filas = [
      ['Ingresos', ing], ['Costo de ventas', -costo], ['Utilidad bruta', ing - costo, 'sub'],
      ['Gastos operativos', -gastos], ['EBITDA', ing - costo - gastos, 'sub'],
      ['Depreciación', -dep], ['Intereses', -intr], ['Utilidad antes de impuestos', ing - costo - gastos - dep - intr, 'tot'],
    ];
    panelRes.innerHTML = `<div class="dash__grid">
      <section class="dash-card" aria-labelledby="t-meses">
        <h3 id="t-meses">Ingresos y gastos por mes</h3>
        <p class="dash-card__sub">Millones de pesos · ${w.nombre}</p>
        <ul class="dash-leg" role="list"><li><i class="dash-key s1"></i>Ingresos</li><li><i class="dash-key s2"></i>Costos y gastos</li></ul>
        <div class="dash-chart" id="g-meses"></div>
        ${tablaDatos('Ingresos y gastos por mes', ['Mes', 'Ingresos', 'Costos y gastos', 'Resultado'], idx.map((i) => [etiquetaMes(i), rd(d[i].ing), rd(d[i].costo + d[i].gastos), rd(d[i].ing - d[i].costo - d[i].gastos)]))}
      </section>
      <section class="dash-card" aria-labelledby="t-pyg">
        <h3 id="t-pyg">Estado de resultados</h3>
        <p class="dash-card__sub">${w.nombre}${d === empresa ? '' : ' · depreciación e intereses repartidos por ventas'}</p>
        <table class="dash-pl"><thead><tr><th scope="col">Partida</th><th scope="col" class="num">RD$ M</th><th scope="col" class="num">% ventas</th></tr></thead>
        <tbody>${filas.map(([n, v, c]) => `<tr${c ? ` class="${c}"` : ''}><th scope="row">${n}</th><td class="num">${(v < 0 ? '−' : '') + nf1.format(Math.abs(v))}</td><td class="num">${(v < 0 ? '−' : '') + nf1.format(Math.abs(v / ing) * 100)}</td></tr>`).join('')}</tbody></table>
      </section>
    </div>`;
    graficoMeses(panelRes.querySelector('#g-meses'), idx, d);
  }

  function pintarBalance(w) {
    const e = w.e;
    const ef = caja[e], cxc = empresa[e].ing * 1.35, inv = empresa[e].costo * 1.25;
    const af = 34 + capexAcum[e] - DEPRECIACION * (e + 1);
    const cxp = empresa[e].costo * 1.1, cp = CUOTA * 12, lp = deuda[e] - cp;
    const activos = ef + cxc + inv + af, pasivos = cxp + cp + lp, patrimonio = activos - pasivos;
    const grupos = [
      { titulo: 'Activos', cls: 's1', total: activos, filas: [['Efectivo', ef], ['Cuentas por cobrar', cxc], ['Inventario', inv], ['Activo fijo neto', af]] },
      { titulo: 'Pasivos y patrimonio', cls: 's2', total: activos, filas: [['Cuentas por pagar', cxp], ['Préstamos a corto plazo', cp], ['Préstamos a largo plazo', lp], ['Patrimonio', patrimonio]] },
    ];
    const max = Math.max(...grupos.flatMap((g) => g.filas.map((f) => f[1])));
    const ratios = [
      ['Liquidez corriente', `${nf1.format((ef + cxc + inv) / (cxp + cp))} veces`, 'Activo corriente entre pasivo corriente'],
      ['Prueba ácida', `${nf1.format((ef + cxc) / (cxp + cp))} veces`, 'Sin contar inventario'],
      ['Endeudamiento', pct(pasivos / activos), 'Pasivos entre activos'],
      ['Días de cobro', `${Math.round((cxc / empresa[e].ing) * 30)} días`, 'Cuentas por cobrar entre ventas del mes'],
    ];
    panelBal.innerHTML = `<div class="dash__grid">
      <section class="dash-card" aria-labelledby="t-bal">
        <h3 id="t-bal">Balance general al cierre de ${etiquetaMes(e)}</h3>
        <p class="dash-card__sub">Millones de pesos · toda la empresa</p>
        ${grupos.map((g) => `<div class="dash-hgroup"><p class="dash-hgroup__t"><span><i class="dash-key ${g.cls}"></i>${g.titulo}</span><b>${rd(g.total)}</b></p>
          <ul class="dash-hbars" role="list">${g.filas.map(([n, v]) => `<li><span class="dash-hbars__n">${n}</span><span class="dash-hbars__track"><span class="dash-hbars__bar ${g.cls}" style="width:${Math.max(1, (v / max) * 100).toFixed(1)}%"></span></span><span class="dash-hbars__v">${nf1.format(v)}</span></li>`).join('')}</ul></div>`).join('')}
      </section>
      <section class="dash-card" aria-labelledby="t-ratios">
        <h3 id="t-ratios">Indicadores</h3>
        <p class="dash-card__sub">Al cierre de ${etiquetaMes(e)}</p>
        <dl class="dash-ratios">${ratios.map(([k, v, n]) => `<div><dt>${k}</dt><dd><strong>${v}</strong><span>${n}</span></dd></div>`).join('')}</dl>
      </section>
    </div>`;
  }

  function pintarCaja(w) {
    const idx = rango(w.s, w.e);
    const op = suma(idx, (i) => operacion[i]), inv = suma(idx, (i) => inversion[i]), fin = suma(idx, (i) => financiamiento[i]);
    const pasos = [
      { nombre: 'Saldo inicial', corto: 'Inicial', v: cajaAntes(w.s), total: true },
      { nombre: 'Operación', corto: 'Operac.', v: op },
      { nombre: 'Inversión', corto: 'Invers.', v: inv },
      { nombre: 'Financiamiento', corto: 'Financ.', v: fin },
      { nombre: 'Saldo final', corto: 'Final', v: caja[w.e], total: true },
    ];
    panelCaja.innerHTML = `<div class="dash__grid">
      <section class="dash-card" aria-labelledby="t-casc">
        <h3 id="t-casc">De dónde vino y a dónde fue el efectivo</h3>
        <p class="dash-card__sub">Millones de pesos · ${w.nombre} · toda la empresa</p>
        <ul class="dash-leg" role="list"><li><i class="dash-key tot"></i>Saldo</li><li><i class="dash-key s1"></i>Entró</li><li><i class="dash-key s2"></i>Salió</li></ul>
        <div class="dash-chart" id="g-casc"></div>
        ${tablaDatos('Movimiento del efectivo', ['Concepto', 'RD$ M'], pasos.map((p) => [p.nombre, p.total ? nf1.format(p.v) : signo(p.v)]))}
      </section>
      <section class="dash-card" aria-labelledby="t-caja">
        <h3 id="t-caja">Efectivo al cierre de cada mes</h3>
        <p class="dash-card__sub">Millones de pesos · toda la empresa</p>
        <div class="dash-chart" id="g-caja"></div>
        ${tablaDatos('Efectivo al cierre de cada mes', ['Mes', 'Efectivo'], idx.map((i) => [etiquetaMes(i), rd(caja[i])]))}
      </section>
    </div>`;
    graficoCascada(panelCaja.querySelector('#g-casc'), pasos);
    graficoCaja(panelCaja.querySelector('#g-caja'), idx);
  }

  function pintar() {
    const w = ventana(), d = serie();
    const sucursal = selSucursal.value !== 'todas';
    aviso.hidden = !sucursal;
    if (sucursal) aviso.textContent = `Resultados de la sucursal ${SUCURSALES[selSucursal.value].nombre}. El balance y el efectivo son de toda la empresa.`;
    pintarKpis(w, d);
    const activa = root.querySelector('[role="tab"][aria-selected="true"]').getAttribute('aria-controls');
    if (activa === 'panel-res') pintarResultados(w, d);
    if (activa === 'panel-bal') pintarBalance(w);
    if (activa === 'panel-caja') pintarCaja(w);
  }

  /* ---------- Pestañas (patrón ARIA) ---------- */
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const elegir = (tab, enfocar) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      root.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (enfocar) tab.focus();
    pintar();
  };
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => elegir(t));
    t.addEventListener('keydown', (ev) => {
      let n = null;
      if (ev.key === 'ArrowRight') n = (k + 1) % tabs.length;
      if (ev.key === 'ArrowLeft') n = (k - 1 + tabs.length) % tabs.length;
      if (ev.key === 'Home') n = 0;
      if (ev.key === 'End') n = tabs.length - 1;
      if (n !== null) { ev.preventDefault(); elegir(tabs[n], true); }
    });
  });

  selPeriodo.addEventListener('change', pintar);
  selSucursal.addEventListener('change', pintar);

  // Redibujar los gráficos cuando cambia el ancho (giro del teléfono, ventana).
  let ancho = root.clientWidth, espera = 0;
  new ResizeObserver(() => {
    if (Math.abs(root.clientWidth - ancho) < 8) return;
    ancho = root.clientWidth;
    clearTimeout(espera);
    espera = setTimeout(pintar, 120);
  }).observe(root);

  root.classList.add('is-ready');
  pintar();
})();
