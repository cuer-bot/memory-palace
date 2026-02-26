import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { getConfig, API_BASE } from './config';

const MEMORIES_DIR = path.join(process.cwd(), '.palace', 'memories');

export async function attachImage(shortId: string, imagePath: string) {
    // Resolve source
    const src = path.resolve(imagePath);
    if (!fs.existsSync(src)) {
        console.error(`✗ Image not found: ${src}`);
        process.exit(1);
    }

    // Ensure .palace/memories/ exists
    if (!fs.existsSync(MEMORIES_DIR)) {
        fs.mkdirSync(MEMORIES_DIR, { recursive: true });
    }

    // Copy to .palace/memories/<short_id>.png
    const dest = path.join(MEMORIES_DIR, `${shortId}.png`);
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied to ${dest}`);

    // Upload to hosted gallery via /api/upload
    let config;
    try {
        config = getConfig();
    } catch {
        console.warn('⚠ No config found — skipping upload. Run `mempalace init` to set up.');
        return;
    }

    const authToken = config.palace_id;
    const form = new FormData();
    form.append('image', fs.createReadStream(dest), { filename: `${shortId}.png`, contentType: 'image/png' });
    form.append('short_id', shortId);

    console.log(`  Uploading to ${API_BASE}/api/upload ...`);
    const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            ...form.getHeaders(),
        },
        body: form,
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`✗ Upload failed (${res.status}): ${text}`);
        console.log(`  Image saved locally at ${dest} — upload manually when ready.`);
        return;
    }

    const data = await res.json() as any;
    console.log(`✓ Uploaded: ${data.image_url}`);
    console.log(`  Capsule:   ${API_BASE}/q/${shortId}`);
    console.log(`  QR:        ${API_BASE}/q/${shortId}/qr`);
}
