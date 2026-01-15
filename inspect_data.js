import fs from 'fs';
import initWasm, { readParquet } from './node_modules/parquet-wasm/esm/parquet_wasm.js';
import { tableFromIPC } from 'apache-arrow';

async function main() {
    try {
        console.log("Loading WASM...");
        // Path to the WASM file corresponding to the ESM build
        const wasmPath = './node_modules/parquet-wasm/esm/parquet_wasm_bg.wasm';
        if (!fs.existsSync(wasmPath)) {
            console.error(`WASM file not found at ${wasmPath}`);
            return;
        }
        const wasmBuffer = fs.readFileSync(wasmPath);
        await initWasm(wasmBuffer);

        console.log("Reading parquet file...");
        const parquetPath = 'public/data/data.parquet';
        if (!fs.existsSync(parquetPath)) {
            console.error(`Parquet file not found at ${parquetPath}`);
            return;
        }
        const buffer = fs.readFileSync(parquetPath);
        console.log(`File read, size: ${buffer.length}`);

        console.log("Parsing parquet...");
        const wasmTable = readParquet(buffer);
        const ipcStream = wasmTable.intoIPCStream();
        const table = tableFromIPC(ipcStream);

        console.log('Parquet schema fields:', table.schema.fields.map(f => f.name));
        console.log('Total rows:', table.numRows);

        let count = 0;
        let allProRuris = [];
        let totalValue = 0;

        // Iterating manually
        for (let i = 0; i < table.numRows; i++) {
            const row = table.get(i);
            const name = row.szervezet_neve?.toString() || '';
            const tax = row.adoszama?.toString() || '';

            // Check for Pro Ruris
            if (name.includes('Pro Ruris') || tax === 'RO697565') {
                // Clone row to simple object to print
                const rowObj = {};
                // row is a proxy, access known fields manually
                rowObj.azonosito = row.azonosito?.toString();
                rowObj.szervezet_neve = name;
                rowObj.adoszama = tax;
                rowObj.tamogatas = row.tamogatas;
                rowObj.palyazati_dontes = row.palyazati_dontes?.toString();

                allProRuris.push(rowObj);
                count++;
                totalValue += parseHungarianNumber(row.tamogatas);
            }
        }

        console.log(`Found ${count} matches for "Pro Ruris" or "RO697565".`);
        console.log(`Total Value: ${totalValue}`);
        console.log(JSON.stringify(allProRuris, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

function parseHungarianNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Remove spaces and convert to number (Hungarian format: "2 886 200")
    const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
}

main();
