from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from typing import Iterable, List
from zipfile import ZIP_DEFLATED, ZipFile

from backend.services.email_delivery_service import EmailAttachment

XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

GUEST_HEADERS = [
    "Nombre",
    "1. Apellido",
    "2. Apellido",
    "Fecha de nacimiento",
    "Nationality",
    "Tipo de documento de identidad",
    "Número de documento",
    "Soporte de documento",
    "Correo electrónico",
    "Número de teléfono",
    "Dirección de residencia",
    "Código municipio",
    "Fecha de llegada",
    "Fecha de salida",
    "Parentesco",
]

BASE_METADATA_ROWS = [
    ["CODIGO ESTABLECIMIENTO", "0000000000"],
    ["Alojamiento Sintético Anclora"],
    ["Calle Ejemplo 123"],
    ["Madrid 28013"],
    ["Madrid"],
    ["ESP"],
    ["REFERENCIA", "SAMPLE-2026-0001"],
    ["FECHA DE ENTRADA", "2026-08-12"],
    ["HORA", "16:00"],
    ["FECHA DE SALIDA", "2026-08-15"],
    ["HORA", "11:00"],
    ["FECHA DE CONTRATO", "2026-07-20"],
    ["TIPO DE PAGO", "Tarjeta"],
    ["IBAN", "ES9121000418450200051332"],
    [],
]

VALID_GUEST_ROWS = [
    [
        "Ana",
        "Demo",
        "Ejemplo",
        "1990-04-18",
        "ESP",
        "NIF",
        "00000000T",
        "ABC123456",
        "ana.demo@example.com",
        "600000001",
        "Calle Ejemplo 123, Madrid 28013",
        "28079",
        "2026-08-12",
        "2026-08-15",
        "TI",
    ],
    [
        "Bruno",
        "Prueba",
        "Sintético",
        "1988-11-02",
        "ITA",
        "PAS",
        "X1234567",
        "",
        "bruno.prueba@example.com",
        "600000002",
        "Via Esempio 4, Roma 00100",
        "",
        "2026-08-12",
        "2026-08-15",
        "OT",
    ],
]

FIXABLE_GUEST_ROWS = VALID_GUEST_ROWS + [
    [
        "Carla",
        "Ficticia",
        "Subsanable",
        "1995-05-09",
        "ESP",
        "NIF",
        "11111111H",
        "",
        "carla.ficticia@example.com",
        "600000003",
        "Calle Muestra 45, Madrid 28013",
        "28079",
        "2026-08-12",
        "2026-08-15",
        "OT",
    ],
]


def _metadata_rows(guest_count: int) -> List[List[object]]:
    return BASE_METADATA_ROWS[:12] + [["NUMERO DE PERSONAS", str(guest_count)]] + BASE_METADATA_ROWS[12:]


def _xml_escape(value: object) -> str:
    return (
        str(value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _column_name(index: int) -> str:
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def _sheet_xml(rows: Iterable[List[object]]) -> str:
    row_xml = []
    for row_index, row in enumerate(rows, start=1):
        cells = []
        for column_index, value in enumerate(row, start=1):
            if value is None or value == "":
                continue
            cell_ref = f"{_column_name(column_index)}{row_index}"
            cells.append(
                f'<c r="{cell_ref}" t="inlineStr"><is><t>{_xml_escape(value)}</t></is></c>'
            )
        row_xml.append(f'<row r="{row_index}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<sheetData>{"".join(row_xml)}</sheetData>'
        "</worksheet>"
    )


def _build_xlsx(rows: List[List[object]]) -> bytes:
    output = BytesIO()
    created = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            "</Types>",
        )
        archive.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            "</Relationships>",
        )
        archive.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="Muestra SyncXML" sheetId="1" r:id="rId1"/></sheets>'
            "</workbook>",
        )
        archive.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            "</Relationships>",
        )
        archive.writestr("xl/worksheets/sheet1.xml", _sheet_xml(rows))
        archive.writestr(
            "docProps/core.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
            'xmlns:dc="http://purl.org/dc/elements/1.1/" '
            'xmlns:dcterms="http://purl.org/dc/terms/" '
            'xmlns:dcmitype="http://purl.org/dc/dcmitype/" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            "<dc:creator>Anclora SyncXML</dc:creator>"
            "<dc:title>Muestra sintética Anclora SyncXML</dc:title>"
            f'<dcterms:created xsi:type="dcterms:W3CDTF">{created}</dcterms:created>'
            f'<dcterms:modified xsi:type="dcterms:W3CDTF">{created}</dcterms:modified>'
            "</cp:coreProperties>",
        )
        archive.writestr(
            "docProps/app.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
            'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
            "<Application>Anclora Nexus</Application>"
            "</Properties>",
        )
    return output.getvalue()


def build_syncxml_sample_attachments() -> List[EmailAttachment]:
    valid_rows = _metadata_rows(len(VALID_GUEST_ROWS)) + [GUEST_HEADERS] + VALID_GUEST_ROWS
    fixable_rows = _metadata_rows(len(FIXABLE_GUEST_ROWS)) + [GUEST_HEADERS] + FIXABLE_GUEST_ROWS
    return [
        {
            "filename": "anclora-syncxml-muestra-correcta.xlsx",
            "content": _build_xlsx(valid_rows),
            "content_type": XLSX_CONTENT_TYPE,
        },
        {
            "filename": "anclora-syncxml-muestra-subsanable.xlsx",
            "content": _build_xlsx(fixable_rows),
            "content_type": XLSX_CONTENT_TYPE,
        },
    ]
