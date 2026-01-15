import initWasm, { readParquet } from 'parquet-wasm';
import * as arrow from 'apache-arrow';
import { Project } from '@/types/project';

let wasmInitialized = false;

const BASE_URL = import.meta.env.BASE_URL;

function getAssetPath(path: string): string {
  // Remove leading slash if present to avoid double slashes when joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}${cleanPath}`;
}

async function initParquetWasm() {
  if (!wasmInitialized) {
    try {
      await initWasm(getAssetPath('parquet_wasm_bg.wasm'));
      wasmInitialized = true;
    } catch (error) {
      console.error('Failed to initialize parquet-wasm:', error);
      // Fallback to default init if path fails
      await initWasm();
      wasmInitialized = true;
    }
  }
}

function parseHungarianNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Remove spaces and convert to number (Hungarian format: "2 886 200")
  const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
}

function normalizeStatus(raw: string | undefined): string {
  if (!raw) return 'Ismeretlen';
  const lower = raw.toLowerCase().trim();

  if (lower === 'nyertes') return 'Nyertes';
  if (lower === 'nem támogatott') return 'Nem támogatott';
  if (lower === 'elutasított') return 'Elutasított';
  if (lower === 'érvénytelen') return 'Érvénytelen';
  if (lower === 'várólistás') return 'Várólistás';

  // Capitalize first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export async function loadParquetData(): Promise<Project[]> {
  try {
    await initParquetWasm();

    const response = await fetch(getAssetPath('data/data.parquet'));
    if (!response.ok) {
      throw new Error('Failed to fetch parquet file');
    }

    const arrayBuffer = await response.arrayBuffer();
    const parquetBytes = new Uint8Array(arrayBuffer);

    const wasmTable = readParquet(parquetBytes);
    const ipcStream = wasmTable.intoIPCStream();
    const table = arrow.tableFromIPC(ipcStream);

    console.log('Parquet schema fields:', table.schema.fields.map(f => f.name));
    console.log('Total rows in parquet:', table.numRows);

    const projects: Project[] = [];

    for (let i = 0; i < table.numRows; i++) {
      const row: Record<string, any> = {};

      for (const field of table.schema.fields) {
        const column = table.getChild(field.name);
        if (column) {
          row[field.name] = column.get(i);
        }
      }

      if (i < 3) {
        console.log(`Row ${i} raw data:`, row);
      }

      projects.push({
        azonosito: String(row.azonosito ?? `proj-${i}`),
        szervezet_neve: String(row.szervezet_neve ?? 'N/A'),
        adoszama: String(row.adoszama ?? 'N/A'),
        besorolas: String(row.besorolas ?? 'Egyéb'),
        szekhely_varos: String(row.szekhely_varos ?? 'N/A'),
        szekhely_orszag: String(row.szekhely_orszag ?? 'Magyarország'),
        szervezet_tipusa: String(row.szervezet_tipusa ?? 'N/A'),
        tamogatas: parseHungarianNumber(row.tamogatas),
        palyazati_dontes: normalizeStatus(String(row.palyazati_dontes ?? '')),
        palyazat_targya: String(row.palyat_targya ?? row.palyazat_targya ?? ''),
        megye: String(row.megye ?? ''),
        regio: String(row.regio ?? ''),
      });
    }

    console.log('Loaded projects count:', projects.length);
    return projects;
  } catch (error) {
    console.error('Error loading parquet data:', error);
    throw error;
  }
}

export async function loadGeoJsonData() {
  try {
    const response = await fetch(getAssetPath('data/varos.geojson'));
    if (!response.ok) {
      throw new Error('Failed to fetch GeoJSON');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    return null;
  }
}
