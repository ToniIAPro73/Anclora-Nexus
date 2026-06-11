import hashlib
import os

from backend.services.document_encryption_service import DocumentEncryptionService


def test_encrypt_decrypt_roundtrip() -> None:
    os.environ["NEXUS_DOCUMENT_ENCRYPTION_KEY"] = "00" * 32
    original = b"anclora confidential document bytes"

    payload, iv, auth_tag = DocumentEncryptionService.encrypt_file(original)
    decrypted = DocumentEncryptionService.decrypt_file(payload, iv, auth_tag)

    assert decrypted == original
    assert payload != original
    assert len(iv) == 12
    assert len(auth_tag) == 16


def test_sha256_known_bytes() -> None:
    content = b"abc"

    assert DocumentEncryptionService.sha256(content) == hashlib.sha256(content).hexdigest()
