# Paquete final — Albanés Pro (A1–C1)

Este paquete contiene:
- **/site** → todos los archivos para subir a GitHub Pages (reemplaza tu repo con este contenido).
- **/tools** → utilidades para ampliar vocabulario masivo (CSV → content.json).

## Cómo actualizar tu página en GitHub
1) Entra a tu repositorio (por ejemplo `aprende-albanes`).
2) Click en **Add file → Upload files**.
3) Arrastra todo el contenido de la carpeta **/site** (no la carpeta en sí, sino su contenido).
4) Pulsa **Commit changes**. En 1–2 minutos, tu web se actualizará.

## Ampliar vocabulario a 2000 entradas
1) Edita `tools/content_master_A1_500.csv` (o duplica y cambia `level` a B1/B2/C1).
2) Genera `content.json`:  
   ```bash
   python tools/csv_to_content.py tools/content_master_A1_500.csv site/i18n/content.json
   ```
3) Sube el nuevo `site/i18n/content.json` a GitHub (reemplaza el existente).

> Nota: La web funciona 100% con el contenido actual y está lista para móvil (PWA) y juegos/mini-tests. 
