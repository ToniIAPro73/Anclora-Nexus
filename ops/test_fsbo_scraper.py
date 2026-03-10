"""
Test script: verifica que Firecrawl puede scrapeaar Idealista FSBO.
Ejecutar: python ops/test_fsbo_scraper.py
"""
import asyncio
from dotenv import load_dotenv
load_dotenv(r"C:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\.env")

import sys
sys.path.insert(0, r"C:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus")

from backend.services.firecrawl_service import scrape_zone

async def main():
    print("Probando zona: santa_ponca ...")
    result = await scrape_zone("santa_ponca")
    print(f"URL scrapeada: {result.get('source_url')}")
    print(f"Listings encontrados: {result.get('listings_found', 0)}")
    print(f"Signals extraidas: {result.get('signals_extracted', 0)}")
    print(f"Creditos usados: {result.get('credits_used', 0)}")
    if result.get("error"):
        print(f"ERROR: {result['error']}")
    signals = result.get("signals", [])
    if signals:
        print("\n--- Primer signal ---")
        s = signals[0]
        print(f"  URL:     {s.get('anuncio_url')}")
        print(f"  Precio:  {s.get('precio_publicado')}")
        print(f"  Zona:    {s.get('zona')}")
        print(f"  Tipo:    {s.get('tipo_propiedad')}")
        print(f"  DOM:     {s.get('dias_en_mercado')}")
        print(f"  Senales: {s.get('senales_motivacion')}")
    else:
        print("\nSin signals — Idealista probablemente bloqueó el scraping.")
        print("Raw result:", result)

asyncio.run(main())
