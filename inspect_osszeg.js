import fs from 'fs';
import initWasm, { readParquet } from './node_modules/parquet-wasm/esm/parquet_wasm.js';
import { tableFromIPC } from 'apache-arrow';

async function main() {
    try {
        const wasmPath = './node_modules/parquet-wasm/esm/parquet_wasm_bg.wasm';
        const wasmBuffer = fs.readFileSync(wasmPath);
        await initWasm(wasmBuffer);

        const parquetPath = 'public/data/data.parquet';
        const buffer = fs.readFileSync(parquetPath);

        const wasmTable = readParquet(buffer);
        const ipcStream = wasmTable.intoIPCStream();
        const table = tableFromIPC(ipcStream);

        console.log('Parquet schema fields:', table.schema.fields.map(f => f.name));

        let nonNullCount = 0;
        let zeroCount = 0;
        let sampleValues = [];

        for (let i = 0; i < Math.min(table.numRows, 20); i++) {
            const row = table.get(i);
            const osszeg = row.osszeg;
            const tamogatas = row.tamogatas;

            sampleValues.push({ i, tamogatas: String(tamogatas), osszeg: String(osszeg) });

            if (osszeg !== null && osszeg !== undefined) nonNullCount++;
            if (osszeg === 0 || osszeg === '0') zeroCount++;
        }

        console.log('First 20 rows comparison:');
        console.table(sampleValues);

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
