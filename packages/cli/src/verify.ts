import { getConfig } from './config';
import { getMemoryRaw } from './api';
import { decryptPayload, verifySignature } from './crypto';

export async function verifyMemory(shortId: string) {
    try {
        const conf = getConfig();
        const raw = await getMemoryRaw(conf.palace_id, shortId);

        let ivB64, ciphertextB64, authTagB64;
        const parts = raw.ciphertext.split(':');

        if (parts.length === 3) {
            ivB64 = parts[0];
            authTagB64 = parts[1];
            ciphertextB64 = parts[2];
        } else {
            console.log(`TAMPERED (Invalid structural ciphertext)`);
            return "TAMPERED";
        }

        const payload = decryptPayload(conf.palace_key, conf.palace_id, ciphertextB64, ivB64, authTagB64);

        if (raw.signature) {
            const isValid = verifySignature(conf.public_key, raw.signature, payload);
            if (isValid) {
                console.log("VALID");
                return "VALID";
            }
        }

        console.log("TAMPERED");
        return "TAMPERED";
    } catch (e: any) {
        if (e.message === 'NOT_FOUND') {
            console.log("NOT_FOUND");
            return "NOT_FOUND";
        }
        console.error(`Verification error:`, e.message);
        process.exit(1);
    }
}
