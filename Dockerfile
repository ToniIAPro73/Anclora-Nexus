# 1. Base ligera de Python
FROM python:3.11-slim

# 2. Directorio de trabajo
WORKDIR /app

# 3. Llave para que Python encuentre tus carpetas (Corrige el error de módulos)
ENV PYTHONPATH=/app

# 4. Copiar archivos al contenedor
COPY . /app

# 5. Instalar librerías (apuntando a la subcarpeta backend)
RUN pip install --no-cache-dir -r backend/requirements.txt || true

# 6. Ejecutar la aplicación usando la ruta correcta
CMD ["python", "backend/main.py"]