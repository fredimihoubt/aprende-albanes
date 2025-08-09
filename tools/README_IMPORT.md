# Carga masiva de vocabulario — Albanés Pro

Este paquete incluye:
- `content_master_A1_500.csv`: 500 filas de ejemplo (A1) con columnas `level,type,category,sq,pl,es,img,note`.
- `csv_to_content.py`: script para convertir CSV → `content.json` compatible con la web v3.
  - Uso: `python csv_to_content.py content_master_A1_500.csv content.json`

**Nota importante:** muchas filas están marcadas como `PLACEHOLDER: revisar y reemplazar`. Son posiciones de relleno para que puedas completar rápidamente tu propio vocabulario fiable (SQ–PL–ES). Mantén al menos ~70% palabras y ~30% frases.

## Recomendación de reparto (meta 2000 palabras en 6 meses)
- A1: 500 entradas (básicos, saludos, comida, casa, transporte).
- B1: +500 (compras, emociones, planes, pasado simple).
- B2: +500 (trabajo, estudios, servicios, condicionales).
- C1: +500 (debate, cultura, política, expresiones).

Después de generar `content.json`, súbelo a tu repo dentro de la carpeta `i18n/` (reemplaza el existente). Actualiza la web y listo.
