# Skill: Google Docs Converter

**ID:** `google-docs-converter`
**Version:** 1.0
**Status:** Specification
**Category:** Documentation / Integration
**Owner:** ANCLORA-UMG-001

---

## Purpose

Conversión automática del Manual de Usuario desde formato DOCX a Google Docs, permitiendo colaboración online, comentarios y control de versiones en Google Workspace.

---

## Capabilities

- **DOCX → Google Docs:** Upload y conversión automática
- **Permission Management:** Configuración de permisos (view, comment, edit)
- **Folder Organization:** Organización en Google Drive folders
- **Version Control:** Mantenimiento de historial de versiones
- **Link Generation:** URLs directos para compartir

---

## Technical Specification

### Dependencies

```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### Google API Setup

```python
# Requires:
# 1. Google Cloud Project with Drive API enabled
# 2. OAuth 2.0 credentials (client_secret.json)
# 3. Service account or user auth

SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
]
```

### Core Function

```python
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

class GoogleDocsConverter:
    def __init__(self, credentials_path: str):
        self.creds = self.authenticate(credentials_path)
        self.service = build('drive', 'v3', credentials=self.creds)

    def upload_docx_as_gdocs(
        self,
        docx_path: str,
        title: str,
        folder_id: str = None
    ) -> dict:
        """Upload DOCX and convert to Google Docs format"""
        file_metadata = {
            'name': title,
            'mimeType': 'application/vnd.google-apps.document'
        }

        if folder_id:
            file_metadata['parents'] = [folder_id]

        media = MediaFileUpload(
            docx_path,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            resumable=True
        )

        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink, webContentLink'
        ).execute()

        print(f"✅ Google Doc created: {file.get('webViewLink')}")
        return file

    def set_permissions(self, file_id: str, email: str, role: str = 'reader'):
        """Set sharing permissions"""
        permission = {
            'type': 'user',
            'role': role,  # reader, commenter, writer
            'emailAddress': email
        }

        self.service.permissions().create(
            fileId=file_id,
            body=permission,
            fields='id'
        ).execute()
```

---

## Usage

```python
# Script: scripts/upload-to-google-docs.py

converter = GoogleDocsConverter('credentials.json')

# Upload manual
result = converter.upload_docx_as_gdocs(
    docx_path='public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx',
    title='Anclora Nexus - User Manual v1.2.3',
    folder_id='FOLDER_ID_FROM_GOOGLE_DRIVE'
)

# Share with team
converter.set_permissions(result['id'], 'team@anclora.com', 'commenter')

print(f"🔗 View URL: {result['webViewLink']}")
```

---

## Output

- Google Docs URL (view)
- Edit URL (if permissions allow)
- File ID for API access
- Folder location in Drive

---

## Future Enhancements

- Automated sync on manual updates
- Two-way sync (edits in GDocs → markdown)
- Comment extraction for manual improvements

---

**Status:** Specification complete, implementation pending Google Cloud setup

**Last Updated:** 2026-03-10
