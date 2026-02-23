import { getConfig } from './config';
import { scanImage } from './api';
import { recoverMemory } from './recover';
import fs from 'fs';

export async function scanCommand(imagePath: string) {
    try {
        if (!fs.existsSync(imagePath)) {
            console.error(`File ${imagePath} does not exist.`);
            process.exit(1);
        }

        console.log("Scanning image and uploading to Memory Palace...");
        const result = await scanImage(imagePath);

        console.log(`Scan successful. Found Memory ID: ${result.short_id}`);
        console.log(`Recovering and verifying context locally...`);

        await recoverMemory(result.short_id);
    } catch (e: any) {
        console.error("Scan failed:", e.message);
        process.exit(1);
    }
}
