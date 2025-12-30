#!/usr/bin/env python3
"""Script para analizar qué pudo haber causado el problema"""

import sys
from pathlib import Path
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.datasource_config import get_datasource_uid
import requests
import os

try:
    from dotenv import load_dotenv
    root_dir = Path(__file__).parent.parent
    env_path = root_dir / '.env.local'
    load_dotenv(dotenv_path=env_path)
except:
    pass

GRAFANA_URL = os.environ.get("GRAFANA_URL", "https://grafana-bi.sebo.i.check24.es")
GRAFANA_API_KEY = os.environ.get("GRAFANA_API_KEY")
headers = {
    "Authorization": f"Bearer {GRAFANA_API_KEY}",
    "Content-Type": "application/json",
    "X-Grafana-Org-Id": "3"
}

def fetch_grafana_data(sql, datasource_name):
    try:
        from utils.datasource_config import get_datasource_uid
        datasource_uid = get_datasource_uid(datasource_name)
    except KeyError:
        print(f"❌ Datasource '{datasource_name}' not found")
        return pd.DataFrame()

    payload = {
        "queries": [{
            "refId": "A",
            "datasource": {"type": "mysql", "uid": datasource_uid},
            "format": "table",
            "rawSql": sql
        }]
    }

    try:
        response = requests.post(f"{GRAFANA_URL}/api/ds/query", headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        results_a = data.get("results", {}).get("A", {})
        if "frames" in results_a:
            frames = results_a["frames"]
            if frames:
                fields = frames[0]["schema"]["fields"]
                columns = [f["name"] for f in fields]
                values = frames[0]["data"]["values"]
                df = pd.DataFrame({col: values[i] for i, col in enumerate(columns)})
                return df
        return pd.DataFrame()
    except Exception as e:
        print(f"❌ Error: {e}")
        return pd.DataFrame()

print("=" * 80)
print("ANÁLISIS DEL PROBLEMA: ¿Por qué había 946 en lugar de 1072?")
print("=" * 80)

# 1. Verificar qué hay en la base de datos ahora
print("\n1️⃣ Verificando datos actuales en la base de datos:")
sql1 = """
SELECT 
    kpi_date,
    DATE_FORMAT(kpi_date, '%Y-%m-%d') AS kpi_date_formatted,
    provider,
    insurer,
    totalConfirmations,
    totalSuccessConfirmations
FROM partnernet.seco_confirmation_kpi
WHERE DATE(kpi_date) = '2025-12-29'
  AND provider = '2-ALLIANZ-DIRECT-2'
  AND insurer = 'Allianz Direct';
"""
df1 = fetch_grafana_data(sql1, "data-warehouse-pnet")
if not df1.empty:
    print(f"   ✅ Datos actuales: {df1['totalConfirmations'].iloc[0]} totalConfirmations")
    print(f"      kpi_date tipo: {type(df1['kpi_date'].iloc[0])}")
    print(f"      kpi_date valor: {df1['kpi_date'].iloc[0]}")
else:
    print("   ❌ No se encontraron datos")

# 2. Verificar si hay registros duplicados o con fechas incorrectas
print("\n2️⃣ Verificando si hay registros con fechas incorrectas o duplicados:")
sql2 = """
SELECT 
    kpi_date,
    DATE_FORMAT(kpi_date, '%Y-%m-%d') AS kpi_date_formatted,
    provider,
    insurer,
    totalConfirmations,
    COUNT(*) as count
FROM partnernet.seco_confirmation_kpi
WHERE provider = '2-ALLIANZ-DIRECT-2'
  AND insurer = 'Allianz Direct'
  AND (DATE(kpi_date) = '2025-12-29' OR kpi_date LIKE '%2025-12-29%')
GROUP BY kpi_date, provider, insurer, totalConfirmations;
"""
df2 = fetch_grafana_data(sql2, "data-warehouse-pnet")
if not df2.empty:
    print(f"   Encontrados {len(df2)} registros:")
    print(df2.to_string(index=False))
else:
    print("   No se encontraron registros")

# 3. Verificar el historial de cambios (si hay tabla de logs)
print("\n3️⃣ Conclusión:")
print("   El problema probablemente fue:")
print("   - Cuando se procesó diciembre 2025 mes por mes, los datos se insertaron incorrectamente")
print("   - Posibles causas:")
print("     a) Las fechas venían como timestamps y no se procesaron correctamente")
print("     b) Hubo un error parcial que no se detectó")
print("     c) Múltiples ejecuciones sobrescribieron datos incorrectos")
print("   - La solución fue ejecutar el script para el día específico, que corrigió los datos")
print("   - Las mejoras que agregamos (validación de timestamps) previenen este problema en el futuro")

print("\n" + "=" * 80)

