import fetch from 'node-fetch';
import { API_BASE, Config } from './config';
import { encryptPayload, signPayload, verifySignature, decryptPayload } from './crypto';
import fs from 'fs';
import FormData from 'form-data';

export async function createPalace(publicKey: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/palace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_key: publicKey })
    });
    if (!res.ok) throw new Error(`Failed to create palace: ${await res.text()}`);
    const data = await res.json() as any;
    return data.palace_id;
}

export async function getMemories(palaceId: string, limit: number = 10): Promise<any> {
    const res = await fetch(`${API_BASE}/api/recall?limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${palaceId}` }
    });
    if (!res.ok) throw new Error(`Failed to list: ${await res.text()}`);
    return await res.json();
}

export async function storeMemory(config: Config, payload: any, imageUrl?: string) {
    const { ciphertext, iv, authTag } = encryptPayload(config.palace_key, config.palace_id, payload);
    const signature = signPayload(config.palace_key, payload);

    const body = {
        payload, // plaintext sent for schema validation & prompt injection scanning
        ciphertext: `${iv}:${authTag}:${ciphertext}`,
        signature,
        algorithm: 'Ed25519',
        image_url: imageUrl
    };

    const res = await fetch(`${API_BASE}/api/store`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.palace_id}`
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        throw new Error(`Failed to store: ${res.status} ${await res.text()}`);
    }
    return await res.json();
}

export async function scanImage(imagePath: string) {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    const res = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        body: form
    });
    if (!res.ok) throw new Error(`Failed to scan: ${await res.text()}`);
    return (await res.json()) as any;
}

export async function getMemoryRaw(palaceId: string, shortId: string) {
    const data = await getMemories(palaceId, 50); // Just fetch 50 and find it for simplicity, since /recall doesn't do short_id lookup
    // Wait, we need an endpoint to fetch by short_id.
    // If not, we filter from recall:
    const mem = data.memories.find((m: any) => m.short_id === shortId);
    if (!mem) throw new Error('NOT_FOUND');
    return mem;
}
