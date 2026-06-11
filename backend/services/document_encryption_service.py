import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class DocumentEncryptionService:
    @staticmethod
    def encrypt_file(file_content: bytes) -> tuple[bytes, bytes, bytes]:
        key = bytes.fromhex(os.environ["NEXUS_DOCUMENT_ENCRYPTION_KEY"])
        aesgcm = AESGCM(key)
        iv = os.urandom(12)
        encrypted = aesgcm.encrypt(iv, file_content, None)
        auth_tag = encrypted[-16:]
        payload = encrypted[:-16]
        return payload, iv, auth_tag

    @staticmethod
    def decrypt_file(payload: bytes, iv: bytes, auth_tag: bytes) -> bytes:
        key = bytes.fromhex(os.environ["NEXUS_DOCUMENT_ENCRYPTION_KEY"])
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(iv, payload + auth_tag, None)

    @staticmethod
    def sha256(content: bytes) -> str:
        return hashlib.sha256(content).hexdigest()
