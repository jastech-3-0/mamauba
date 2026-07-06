#!/bin/bash
# Analyze all PDF pages with VLM in parallel
set -e
cd /home/z/my-project/upload/imgs

OUTDIR=/home/z/my-project/upload/vlm_analysis
mkdir -p "$OUTDIR"

analyze() {
  local img="$1"
  local base=$(basename "$img" .jpg)
  local out="$OUTDIR/${base}.json"
  if [ -f "$out" ] && [ -s "$out" ]; then
    echo "[SKIP] $base"
    return
  fi
  echo "[RUN] $base"
  z-ai vision -p "Analiza este documento en español. Extrae TODA la información clave que aparezca: nombres, NIT, empresa, representantes legales, accionistas, capital, suscripción, pagos, actividad económica, fechas, montos, direcciones, teléfonos, y cualquier dato financiero/jurídico. Devuelve en formato markdown limpio, sin introducción. Sé EXHAUSTIVO Y LITERAL." -i "$img" -o "$out" 2>&1 | tail -3
  echo "[OK] $base"
}

export -f analyze
export OUTDIR

# Run in parallel batches of 3
ls *.jpg | xargs -P3 -I{} bash -c 'analyze "$@"' _ {}

echo "DONE"
ls -la "$OUTDIR"
