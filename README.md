# NuVEM · Landing Page

Sitio web institucional de **NuVEM** — firma de inteligencia financiera para PYMES en República Dominicana.

Página construida en **HTML, CSS y JavaScript puros**, sin frameworks ni build step. Liviana, rápida, accesible y 100% responsive.

---

## Estructura del proyecto

```
.
├── index.html      # Página principal (todas las secciones)
├── styles.css      # Sistema de diseño y estilos
├── script.js       # Interacciones (nav móvil, animaciones, formulario)
└── README.md       # Este archivo
```

## Secciones incluidas

1. **Navbar fijo** con menú responsive y CTA
2. **Hero** con titular, propuesta de valor, estadísticas y tarjetas flotantes
3. **Quiénes Somos** con pilares y tarjeta de promesa
4. **Servicios** (7 servicios completos como en el catálogo)
5. **Precios** con tabla de contabilidad mensual y tarifas CxC (Small / Mid / Enterprise)
6. **Proceso** de 4 pasos
7. **CTA Band** dorada
8. **Contacto** con datos y formulario
9. **Footer** completo

## Cómo previsualizar localmente

Solo abra `index.html` con doble clic en su navegador, o use cualquier servidor estático:

```bash
# Opción A: Python
python -m http.server 8080

# Opción B: Node (si tiene npx)
npx serve .
```

Luego visite `http://localhost:8080`.

## Cómo publicar (gratis)

Cualquier servicio de hosting estático sirve. Recomendados:

- **Netlify Drop** — arrastre la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `vercel deploy` o suba la carpeta
- **GitHub Pages** — suba a un repo y active Pages en la rama `main`
- **Cloudflare Pages** — conecte el repo

## Personalización rápida

| Qué cambiar              | Dónde                                              |
| ------------------------ | -------------------------------------------------- |
| Email de contacto        | `index.html` — buscar `hola@nuvem.do`              |
| Teléfono                 | `index.html` — buscar `+1 (809) 555-1234`          |
| Color principal (navy)   | `styles.css` — variable `--navy-800`               |
| Color de acento (dorado) | `styles.css` — variable `--gold-500`               |
| Tipografía               | `index.html` — `<link>` de Google Fonts + `--font-*` |
| Lista de servicios       | `index.html` — sección `#servicios`                |
| Precios                  | `index.html` — sección `#precios`                  |

## Conectar el formulario a un backend

El formulario actualmente simula el envío. Para recibir mensajes reales, edite `script.js` y reemplace el bloque `setTimeout(...)` por una llamada `fetch` a su servicio preferido:

- **Formspree** — `https://formspree.io/f/{ID}`
- **Web3Forms** — `https://api.web3forms.com/submit`
- **EmailJS** — SDK del lado del cliente
- **Su propio backend** — endpoint REST

Ejemplo con Formspree:

```js
const res = await fetch('https://formspree.io/f/TU_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: data
});
```

## SEO y dominio

Antes de publicar en producción, recomendado actualizar:

- Etiqueta `<title>` y `<meta name="description">` en `index.html`
- Open Graph / Twitter Cards (agregar `<meta property="og:*">`)
- Favicon real (reemplazar el SVG inline por `favicon.ico` y PNGs)
- Apuntar el dominio (`nuvem.do` u otro) al hosting elegido

---

© NuVEM · Inteligencia Financiera · República Dominicana
