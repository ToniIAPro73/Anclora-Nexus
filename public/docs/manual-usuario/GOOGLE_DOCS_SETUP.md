# Google Docs Setup Guide - Anclora Nexus Manual

Esta guía explica cómo configurar las credenciales de Google Drive API para subir el manual de usuario a Google Docs.

---

## ⚠️ Importante

Este proceso solo necesita hacerse **una vez**. Las credenciales se guardarán localmente y podrás reutilizarlas en futuras ejecuciones.

---

## Paso 1: Crear Proyecto en Google Cloud Console

### 1.1 Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google (preferiblemente cuenta de Anclora)

### 1.2 Crear Nuevo Proyecto

1. Haz clic en el selector de proyectos (esquina superior izquierda)
2. Haz clic en **"Nuevo proyecto"**
3. Nombre del proyecto: `Anclora Nexus Documentation`
4. Haz clic en **"Crear"**
5. Espera a que se cree el proyecto (~30 segundos)
6. Selecciona el proyecto recién creado

---

## Paso 2: Habilitar Google Drive API

### 2.1 Navegar a APIs

1. En el menú lateral, ve a: **"APIs y servicios" → "Biblioteca"**
2. O usa el buscador superior y escribe: `Google Drive API`

### 2.2 Activar la API

1. Haz clic en **"Google Drive API"**
2. Haz clic en **"Habilitar"**
3. Espera a que se active (~10 segundos)

---

## Paso 3: Crear Credenciales OAuth 2.0

### 3.1 Pantalla de Consentimiento OAuth

1. Ve a: **"APIs y servicios" → "Pantalla de consentimiento de OAuth"**
2. Selecciona: **"Uso externo"** (o "Interno" si tu cuenta es de Google Workspace)
3. Haz clic en **"Crear"**

4. Completa la información:
   - **Nombre de la aplicación:** `Anclora Nexus Documentation Uploader`
   - **Correo de asistencia:** tu email
   - **Logotipo:** (opcional, puedes omitir)
   - **Dominio de aplicación:** (opcional, puedes omitir)
   - **Correo del desarrollador:** tu email

5. Haz clic en **"Guardar y continuar"**

6. **Permisos (Scopes):**
   - Haz clic en **"Añadir o quitar permisos"**
   - Busca: `https://www.googleapis.com/auth/drive.file`
   - Marca las casillas:
     - ✅ `.../auth/drive.file` (Ver, editar, crear y eliminar solo los archivos de Drive que uses con esta aplicación)
     - ✅ `.../auth/drive` (Ver, editar, crear y eliminar todos tus archivos de Google Drive)
   - Haz clic en **"Actualizar"**
   - Haz clic en **"Guardar y continuar"**

7. **Usuarios de prueba:**
   - Haz clic en **"Añadir usuarios"**
   - Añade tu email (el que usarás para subir los archivos)
   - Haz clic en **"Guardar y continuar"**

8. **Resumen:**
   - Revisa la información
   - Haz clic en **"Volver al panel"**

### 3.2 Crear Credenciales

1. Ve a: **"APIs y servicios" → "Credenciales"**
2. Haz clic en **"+ Crear credenciales"** (arriba)
3. Selecciona: **"ID de cliente de OAuth"**

4. Configuración:
   - **Tipo de aplicación:** Selecciona **"Aplicación de escritorio"**
   - **Nombre:** `Anclora Nexus Manual Uploader`

5. Haz clic en **"Crear"**

6. Aparecerá un modal con tu ID de cliente y secreto:
   - Haz clic en **"Descargar JSON"**
   - Se descargará un archivo con nombre tipo: `client_secret_XXXXX.apps.googleusercontent.com.json`

---

## Paso 4: Configurar Credenciales en el Proyecto

### 4.1 Renombrar Archivo

1. Renombra el archivo descargado a: `credentials.json`

### 4.2 Colocar en el Proyecto

1. Copia `credentials.json` a la raíz del proyecto Anclora Nexus:
   ```bash
   cp ~/Downloads/credentials.json /home/dev/proyectos/anclora-nexus/credentials.json
   ```

2. Verifica que esté en el lugar correcto:
   ```bash
   ls -la /home/dev/proyectos/anclora-nexus/credentials.json
   ```

### 4.3 Añadir a .gitignore

⚠️ **IMPORTANTE:** No subir credenciales a Git

1. Verifica que `.gitignore` incluya:
   ```
   credentials.json
   token.json
   ```

2. Si no está, añádelo:
   ```bash
   echo "credentials.json" >> .gitignore
   echo "token.json" >> .gitignore
   ```

---

## Paso 5: Ejecutar Upload por Primera Vez

### 5.1 Ejecutar Script

```bash
cd /home/dev/proyectos/anclora-nexus
python3 scripts/upload-to-google-docs.py
```

### 5.2 Proceso de Autenticación

1. El script detectará que es la primera vez
2. Se abrirá automáticamente tu navegador
3. Te pedirá que inicies sesión con tu cuenta de Google
4. Verás una advertencia: **"Esta aplicación no está verificada"**
   - Haz clic en **"Opciones avanzadas"** (abajo)
   - Haz clic en **"Ir a Anclora Nexus Documentation Uploader (no seguro)"**
5. Verás los permisos solicitados:
   - Ver, editar, crear y eliminar archivos de Google Drive
6. Haz clic en **"Permitir"**
7. Verás un mensaje: **"The authentication flow has completed"**
8. Cierra la ventana del navegador

### 5.3 Token Guardado

El script habrá creado un archivo `token.json` con tus credenciales guardadas.

**En futuras ejecuciones:**
- No se abrirá el navegador
- Usará el `token.json` guardado
- La autenticación será automática

---

## Paso 6: Verificar Upload

### 6.1 Resultado Esperado

El script mostrará:

```
============================================================
📤 UPLOAD MANUAL DE USUARIO A GOOGLE DOCS
============================================================

🔐 Autenticando con Google Drive API...
   ✅ Autenticado exitosamente

📁 Configurando estructura de carpetas...
   📁 Carpeta creada: Anclora Nexus
   📁 Carpeta creada: Documentación
   📁 Carpeta creada: Manuales de Usuario

📤 Subiendo manual a Google Docs...

📤 Subiendo: Anclora Nexus - Manual de Usuario (ES) v1.2.3
   📦 Tamaño: 1,502,264 bytes (1467.1 KB)
   ✅ Subido exitosamente
   🔗 URL: https://docs.google.com/document/d/XXXXXX/edit
   📄 ID: XXXXXX

🔒 Configurando permisos...
   ✅ Permisos configurados: anyone - reader

💾 URLs guardadas en: public/docs/manual-usuario/GOOGLE_DOCS_URLS.md

============================================================
✅ UPLOAD COMPLETADO
============================================================

📊 Resumen:
   • Manual ES: ✅ Subido
   • Carpeta: Anclora Nexus / Documentación / Manuales de Usuario
   • Permisos: Público (cualquiera con enlace)

🔗 Acceso directo:
   https://docs.google.com/document/d/XXXXXX/edit
```

### 6.2 Acceder al Documento

1. Copia la URL mostrada en el output
2. Pégala en tu navegador
3. Verás el manual de usuario en Google Docs con:
   - Logo en la portada
   - Tabla de contenidos
   - Todo el contenido formateado
   - Branding Anclora (colores Navy y Gold)

---

## Troubleshooting

### Error: "credentials.json not found"

**Causa:** El archivo de credenciales no está en la ruta correcta.

**Solución:**
```bash
ls -la /home/dev/proyectos/anclora-nexus/credentials.json
```
Si no existe, repite el Paso 4.

---

### Error: "The file token.json has been revoked"

**Causa:** El token de autenticación ha sido revocado.

**Solución:**
```bash
rm token.json
python3 scripts/upload-to-google-docs.py
```
Volverá a abrir el navegador para reautenticar.

---

### Error: "Access Not Configured"

**Causa:** Google Drive API no está habilitada.

**Solución:** Repite el Paso 2.

---

### Error: "Invalid Credentials"

**Causa:** El archivo `credentials.json` está corrupto o es incorrecto.

**Solución:**
1. Borra el archivo actual: `rm credentials.json`
2. Repite el Paso 3 para descargar nuevas credenciales
3. Repite el Paso 4 para colocarlas en el proyecto

---

## Estructura en Google Drive

Después del upload, tendrás esta estructura:

```
Mi unidad (Google Drive)
└── Anclora Nexus/
    └── Documentación/
        └── Manuales de Usuario/
            └── Anclora Nexus - Manual de Usuario (ES) v1.2.3
```

---

## Permisos y Compartir

### Permisos por Defecto

- **Público:** Cualquiera con el enlace puede **ver**
- **Propietario:** La cuenta que subió el archivo puede **editar**

### Compartir con Permisos Adicionales

Para dar acceso de edición o comentarios:

1. Abre el documento en Google Docs
2. Haz clic en **"Compartir"** (esquina superior derecha)
3. Añade emails y selecciona permisos:
   - **Viewer (Lector):** Solo puede ver
   - **Commenter (Comentador):** Puede añadir comentarios
   - **Editor:** Puede editar el contenido

---

## Regenerar el Manual

Si actualizas el manual y quieres subirlo de nuevo:

```bash
# 1. Regenerar manual local
python3 scripts/generate-user-manual.py

# 2. Subir versión actualizada a Google Docs
python3 scripts/upload-to-google-docs.py
```

**Nota:** Esto **sobrescribirá** el documento existente en Google Drive.

---

## Seguridad

### ⚠️ Importante

- **NO** subas `credentials.json` a Git
- **NO** subas `token.json` a Git
- **NO** compartas estos archivos públicamente

### Revocación de Acceso

Si necesitas revocar el acceso:

1. Ve a: https://myaccount.google.com/permissions
2. Encuentra: "Anclora Nexus Documentation Uploader"
3. Haz clic en **"Quitar acceso"**
4. Borra los archivos locales:
   ```bash
   rm credentials.json token.json
   ```

---

## Costos

- **Google Drive API:** Gratis (incluye 15 GB de almacenamiento)
- **Google Cloud Project:** Gratis (para uso personal/interno)
- **No hay cargos** por subir documentos

---

## Referencias

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Última actualización:** 2026-03-10
**Versión del script:** upload-to-google-docs.py v1.0
