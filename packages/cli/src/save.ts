import { getConfig, MemoryPayload } from './config';
import { storeMemory } from './api';
import fs from 'fs';

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

    } catch (e: any) {
        console.error("Save failed:", e.message);
        process.exit(1);
    }
}
