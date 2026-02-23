import crypto from 'crypto';

export interface CryptoKeys {
    privateKeyBuffer: Buffer;
    publicKeyHex: string;
}

// Generate Ed25519 keypair from 32 random bytes (palace_key)
export function generateKeys(): { palace_key: string; public_key: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

    // We export to der to get the raw bytes, then to hex
    const pubDer = publicKey.export({ type: 'spki', format: 'der' });
    const privDer = privateKey.export({ type: 'pkcs8', format: 'der' });

    return {
        palace_key: privDer.toString('hex'),
        public_key: pubDer.toString('hex')
    };
}

function getPrivateKey(palaceKeyHex: string): crypto.KeyObject {
    return crypto.createPrivateKey({
        key: Buffer.from(palaceKeyHex, 'hex'),
        format: 'der',
        type: 'pkcs8'
    });
}

function getPublicKey(publicKeyHex: string): crypto.KeyObject {
    return crypto.createPublicKey({
        key: Buffer.from(publicKeyHex, 'hex'),
        format: 'der',
        type: 'spki'
    });
}

// Sign a payload 
export function signPayload(palaceKeyHex: string, payload: any): string {
    const canonicalMessage = JSON.stringify(payload, Object.keys(payload).sort());
    const privateKey = getPrivateKey(palaceKeyHex);
    const signature = crypto.sign(null, Buffer.from(canonicalMessage), privateKey);
    return signature.toString('hex');
}

// Verify a signature
export function verifySignature(publicKeyHex: string, signatureHex: string, payload: any): boolean {
    const canonicalMessage = JSON.stringify(payload, Object.keys(payload).sort());
    const publicKey = getPublicKey(publicKeyHex);
    return crypto.verify(null, Buffer.from(canonicalMessage), publicKey, Buffer.from(signatureHex, 'hex'));
}

// Derive AES key
function deriveEncryptionKey(palaceKeyHex: string, palaceId: string): Buffer {
    const raw = crypto.hkdfSync('sha256', Buffer.from(palaceKeyHex, 'hex'), Buffer.from(palaceId), Buffer.from('memory_palace_encryption'), 32);
    return Buffer.from(raw);
}

// Encrypt payload (AES-256-GCM)
export function encryptPayload(palaceKeyHex: string, palaceId: string, payload: any): { ciphertext: string, iv: string, authTag: string } {
    const key = deriveEncryptionKey(palaceKeyHex, palaceId);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const plaintext = JSON.stringify(payload);
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');

    return { ciphertext, iv: iv.toString('base64'), authTag };
}

// Decrypt payload
export function decryptPayload(palaceKeyHex: string, palaceId: string, ciphertextB64: string, ivB64: string, authTagB64: string): any {
    const key = deriveEncryptionKey(palaceKeyHex, palaceId);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

    let plaintext = decipher.update(ciphertextB64, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return JSON.parse(plaintext);
}
