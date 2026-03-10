#!/usr/bin/env python3
"""
Upload User Manual to Google Docs
Based on google-docs-converter.md skill
"""

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
import os
import sys
from pathlib import Path
import json

# Scopes required for Google Drive API
SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
]

class GoogleDocsUploader:
    def __init__(self, credentials_path: str = None):
        """Initialize uploader with Google credentials"""
        self.credentials_path = credentials_path or 'credentials.json'
        self.token_path = 'token.json'
        self.creds = None
        self.service = None

    def authenticate(self):
        """Authenticate with Google Drive API"""
        print("🔐 Autenticando con Google Drive API...")

        # Check if we have saved credentials
        if os.path.exists(self.token_path):
            print("   📝 Usando token guardado...")
            self.creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)

        # If credentials are invalid or don't exist, get new ones
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                print("   🔄 Refrescando token...")
                self.creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    print(f"\n❌ Error: No se encontró {self.credentials_path}")
                    print("\n📋 Para obtener credenciales:")
                    print("1. Ve a https://console.cloud.google.com/")
                    print("2. Crea un proyecto nuevo (o usa uno existente)")
                    print("3. Habilita Google Drive API")
                    print("4. Crea credenciales OAuth 2.0 (Desktop app)")
                    print("5. Descarga el archivo JSON como 'credentials.json'")
                    print(f"6. Colócalo en: {os.path.abspath(self.credentials_path)}")
                    sys.exit(1)

                print("   🌐 Abriendo navegador para autenticación...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                self.creds = flow.run_local_server(port=0)

            # Save credentials for next run
            with open(self.token_path, 'w') as token:
                token.write(self.creds.to_json())
            print("   ✅ Credenciales guardadas")

        self.service = build('drive', 'v3', credentials=self.creds)
        print("   ✅ Autenticado exitosamente")

    def create_folder(self, folder_name: str, parent_id: str = None) -> str:
        """Create a folder in Google Drive"""
        try:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }

            if parent_id:
                file_metadata['parents'] = [parent_id]

            folder = self.service.files().create(
                body=file_metadata,
                fields='id, name'
            ).execute()

            print(f"   📁 Carpeta creada: {folder.get('name')} (ID: {folder.get('id')})")
            return folder.get('id')

        except HttpError as error:
            print(f"   ❌ Error creando carpeta: {error}")
            return None

    def upload_docx_as_gdocs(
        self,
        docx_path: str,
        title: str,
        folder_id: str = None
    ) -> dict:
        """Upload DOCX and convert to Google Docs format"""
        try:
            print(f"📤 Subiendo: {title}")

            # Verify file exists
            if not os.path.exists(docx_path):
                print(f"   ❌ Error: Archivo no encontrado: {docx_path}")
                return None

            file_size = os.path.getsize(docx_path)
            print(f"   📦 Tamaño: {file_size:,} bytes ({file_size/1024:.1f} KB)")

            # Prepare metadata
            file_metadata = {
                'name': title,
                'mimeType': 'application/vnd.google-apps.document'  # Convert to GDocs
            }

            if folder_id:
                file_metadata['parents'] = [folder_id]

            # Upload file
            media = MediaFileUpload(
                docx_path,
                mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                resumable=True
            )

            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, webContentLink, mimeType'
            ).execute()

            print(f"   ✅ Subido exitosamente")
            print(f"   🔗 URL: {file.get('webViewLink')}")
            print(f"   📄 ID: {file.get('id')}")

            return file

        except HttpError as error:
            print(f"   ❌ Error subiendo archivo: {error}")
            return None

    def set_permissions(
        self,
        file_id: str,
        email: str = None,
        role: str = 'reader',
        type: str = 'anyone'
    ):
        """Set sharing permissions for a file"""
        try:
            permission = {
                'type': type,  # 'user', 'group', 'domain', 'anyone'
                'role': role   # 'reader', 'commenter', 'writer'
            }

            if email and type == 'user':
                permission['emailAddress'] = email

            self.service.permissions().create(
                fileId=file_id,
                body=permission,
                fields='id'
            ).execute()

            if email:
                print(f"   ✅ Compartido con {email} ({role})")
            else:
                print(f"   ✅ Permisos configurados: {type} - {role}")

        except HttpError as error:
            print(f"   ❌ Error configurando permisos: {error}")

    def get_or_create_folder_structure(self) -> str:
        """Create folder structure: Anclora Nexus / Documentación / Manuales de Usuario"""
        print("📁 Configurando estructura de carpetas...")

        try:
            # Search for existing "Anclora Nexus" folder
            query = "name='Anclora Nexus' and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            files = results.get('files', [])

            if files:
                anclora_folder_id = files[0]['id']
                print(f"   ✓ Encontrada carpeta 'Anclora Nexus'")
            else:
                anclora_folder_id = self.create_folder('Anclora Nexus')

            # Search for "Documentación" folder
            query = f"name='Documentación' and '{anclora_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            files = results.get('files', [])

            if files:
                doc_folder_id = files[0]['id']
                print(f"   ✓ Encontrada carpeta 'Documentación'")
            else:
                doc_folder_id = self.create_folder('Documentación', anclora_folder_id)

            # Search for "Manuales de Usuario" folder
            query = f"name='Manuales de Usuario' and '{doc_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            files = results.get('files', [])

            if files:
                manual_folder_id = files[0]['id']
                print(f"   ✓ Encontrada carpeta 'Manuales de Usuario'")
            else:
                manual_folder_id = self.create_folder('Manuales de Usuario', doc_folder_id)

            return manual_folder_id

        except HttpError as error:
            print(f"   ❌ Error configurando carpetas: {error}")
            return None


def main():
    print("=" * 60)
    print("📤 UPLOAD MANUAL DE USUARIO A GOOGLE DOCS")
    print("=" * 60)
    print()

    # Paths
    base_dir = Path("/home/dev/proyectos/anclora-nexus")
    docx_path_es = base_dir / "public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx"
    credentials_path = base_dir / "credentials.json"

    # Check if DOCX exists
    if not docx_path_es.exists():
        print(f"❌ Error: Manual DOCX no encontrado")
        print(f"   Ruta esperada: {docx_path_es}")
        print(f"\n💡 Genera el manual primero con:")
        print(f"   python3 scripts/generate-user-manual.py")
        sys.exit(1)

    # Initialize uploader
    uploader = GoogleDocsUploader(str(credentials_path))

    # Authenticate
    uploader.authenticate()

    # Get or create folder structure
    folder_id = uploader.get_or_create_folder_structure()

    if not folder_id:
        print("\n❌ No se pudo crear estructura de carpetas")
        sys.exit(1)

    print()
    print("📤 Subiendo manual a Google Docs...")
    print()

    # Upload Spanish version
    result_es = uploader.upload_docx_as_gdocs(
        docx_path=str(docx_path_es),
        title="Anclora Nexus - Manual de Usuario (ES) v1.2.3",
        folder_id=folder_id
    )

    if not result_es:
        print("\n❌ Error subiendo manual")
        sys.exit(1)

    # Set permissions - anyone with link can view
    print("\n🔒 Configurando permisos...")
    uploader.set_permissions(
        file_id=result_es['id'],
        type='anyone',
        role='reader'
    )

    # Save URLs to file
    urls_file = base_dir / "public/docs/manual-usuario/GOOGLE_DOCS_URLS.md"
    with open(urls_file, 'w', encoding='utf-8') as f:
        f.write("# Google Docs URLs - Anclora Nexus Manual de Usuario\n\n")
        f.write(f"**Generado:** {Path(__file__).stem}\n")
        f.write(f"**Fecha:** {os.popen('date').read().strip()}\n\n")
        f.write("---\n\n")
        f.write("## Manual de Usuario (Español)\n\n")
        f.write(f"**Título:** {result_es['name']}\n\n")
        f.write(f"**URL (Ver):** {result_es['webViewLink']}\n\n")
        f.write(f"**ID:** {result_es['id']}\n\n")
        f.write("**Permisos:** Cualquiera con el enlace puede ver\n\n")
        f.write("---\n\n")
        f.write("## Notas\n\n")
        f.write("- El documento es editable por el propietario de la cuenta de Google utilizada para la subida\n")
        f.write("- Para compartir con permisos de edición o comentarios, usa Google Drive directamente\n")
        f.write("- El documento se sincroniza automáticamente con Google Drive\n")
        f.write("- Para actualizar el contenido, vuelve a ejecutar este script (sobrescribirá el archivo)\n")

    print(f"\n💾 URLs guardadas en: {urls_file}")

    print()
    print("=" * 60)
    print("✅ UPLOAD COMPLETADO")
    print("=" * 60)
    print()
    print("📊 Resumen:")
    print(f"   • Manual ES: ✅ Subido")
    print(f"   • Carpeta: Anclora Nexus / Documentación / Manuales de Usuario")
    print(f"   • Permisos: Público (cualquiera con enlace)")
    print()
    print("🔗 Acceso directo:")
    print(f"   {result_es['webViewLink']}")
    print()

if __name__ == "__main__":
    main()
