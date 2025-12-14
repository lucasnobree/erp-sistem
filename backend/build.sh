#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🔧 Instalando dependências..."
pip install -r requirements.txt

echo "📦 Recoletando archivos estáticos..."
python manage.py collectstatic --no-input

echo "🗄️ Executando migrações..."
python manage.py migrate

echo "✅ Build completado com sucesso!"