import re
import os

path = r'C:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\frontend\src\lib\store.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update initialize leads mapping
init_search = r'source: l\.source \|\| \'Direct\','
init_replace = """source: l.source || 'Direct',
            source_system: l.source_system,
            source_channel: l.source_channel,
            source_campaign: l.source_campaign,
            source_detail: l.source_detail,
            source_url: l.source_url,
            source_referrer: l.source_referrer,
            captured_at: l.captured_at,
            ingestion_mode: l.ingestion_mode,"""

content = content.replace(init_search, init_replace)

# Update some mock data
mock_search_1 = r"source: 'Web',\s+status: 'Qualified',"
mock_replace_1 = "source: 'Web',\n    source_system: 'cta_web',\n    source_channel: 'website',\n    source_detail: 'Formulario Villa',\n    status: 'Qualified',"

content = re.sub(mock_search_1, mock_replace_1, content)

mock_search_2 = r"source: 'LinkedIn',\s+status: 'Negotiating',"
mock_replace_2 = "source: 'LinkedIn',\n    source_system: 'social',\n    source_channel: 'linkedin',\n    source_detail: 'Inbound message',\n    status: 'Negotiating',"

content = re.sub(mock_search_2, mock_replace_2, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
