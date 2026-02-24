import { getConfig, MemoryPayload } from './config';
import { storeMemory } from './api';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function saveMemoryCommand(filePath: string) {
    try {
        const conf = getConfig();
        if (!fs.existsSync(filePath)) {
            console.error(`File ${filePath} does not exist.`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const payload: MemoryPayload = JSON.parse(fileContent);

        console.log("Encrypting and signing memory...");
        const result: any = await storeMemory(conf, payload);

        console.log(`✓ Memory saved successfully!`);
        console.log(`Short ID: ${result.short_id}`);
        console.log(`URL:      ${result.short_url}`);

        if (result.qr_code && result.short_id) {
            const b64 = result.qr_code.replace(/^data:image\/png;base64,/, '');
            const dir = path.join(os.homedir(), '.memorypalace', 'memories');
            fs.mkdirSync(dir, { recursive: true });
            const qrPath = path.join(dir, `${result.short_id}-qr.png`);
            fs.writeFileSync(qrPath, Buffer.from(b64, 'base64'));
            console.log(`QR Code:  ${qrPath}`);
        }

    } catch (e: any) {
        console.error("Save failed:", e.message);
        process.exit(1);
    }
}
