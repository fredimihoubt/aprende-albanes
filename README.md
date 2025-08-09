# Aprende Albanés (SQ–PL–ES) — con minijuegos

Web educativa ligera con vocabulario en paralelo (albanés–polaco–español), plan semanal de 3h, recompensas y minijuegos estilo “Sims” hechos con Phaser 3. PWA lista para instalar en móvil. 

## Estructura
- `index.html` — interfaz principal
- `styles.css` — estilos responsive
- `app.js` — lógica de vocabulario, plan, recompensas, flashcards y UI
- `i18n/phrases.json` — 20 palabras + 20 frases de ejemplo (SQ/PL/ES)
- `i18n/ui.json` — textos de interfaz (ES y PL)
- `games/game.js` — motor de minijuegos con Phaser (3 escenas)
- `img/` — imágenes y iconos PWA (añadir archivos)
- `manifest.webmanifest` — configuración PWA
- `sw.js` — Service Worker (offline básico)

## Probar localmente
1. Abre la carpeta y haz doble clic en `index.html` (funcionará, pero el modo offline y algunos juegos pueden requerir un servidor local).
2. Servidor local opcional (recomendado para pruebas completas):
   - **Python**: `python -m http.server 8000` y luego abre http://localhost:8000
   - **Node**: `npx serve .`

## Desplegar en GitHub Pages
1. Crea un repositorio nuevo en GitHub (p.ej. `aprende-albanes`).
2. Sube **todos** los archivos y carpetas (incluida `img/`).
3. En **Settings → Pages**:
   - **Source**: `Deploy from a branch`.
   - **Branch**: `main` y carpeta `/ (root)`.
   - Guarda. 
4. Espera 1–2 minutos. Tu sitio estará en: `https://TU_USUARIO.github.io/aprende-albanes/`.

## Personalizar
- Añade más vocabulario editando `i18n/phrases.json` o desde el botón “Añadir palabra/frase”.
- Cambia recompensas en `app.js` (`state.rewards`).
- Ajusta escenas o añade nuevas en `games/game.js`.
