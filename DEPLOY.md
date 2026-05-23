# Publicar en nuvem.com.do (Cloudflare Pages)

Tu dominio **nuvem.com.do** ya usa Cloudflare. La forma recomendada es **Cloudflare Pages**.

## Opción A — Conectar GitHub (recomendado)

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Autoriza GitHub y elige el repositorio `nuvem-landing-page`.
3. Configuración del build:
   - **Framework preset:** None
   - **Build command:** (vacío)
   - **Build output directory:** `/`
4. Clic en **Save and Deploy**.
5. Cuando termine el deploy, ve a **Custom domains** → **Set up a custom domain**:
   - `nuvem.com.do`
   - `www.nuvem.com.do`
6. Cloudflare actualizará los registros DNS automáticamente (si el dominio está en la misma cuenta).

## Opción B — Subida directa (sin Git)

1. **Workers & Pages** → **Create** → **Pages** → **Upload assets**.
2. Arrastra toda la carpeta del proyecto (incluye `index.html`, `styles.css`, `script.js` y la carpeta `logos/`).
3. Asigna el dominio personalizado como en el paso 5 de la Opción A.

## Después del primer deploy

- Cada `git push` a `main` vuelve a publicar el sitio (Opción A).
- Si tenías otra página en `nuvem.com.do`, el nuevo deploy la reemplaza al conectar Pages al dominio raíz.

## Verificación

Abre https://nuvem.com.do y comprueba:

- Logo y estilos cargan (carpeta `logos/` incluida).
- Enlaces del menú y formulario de contacto funcionan.

## Formulario de contacto en producción

El formulario hoy simula el envío. Para recibir correos reales, conecta [Formspree](https://formspree.io) o similar en `script.js` (ver comentario en el archivo).
