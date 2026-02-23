import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
    palace_id: string;
    palace_key: string;
    public_key: string;
    gemini_key?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.memorypalace');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Memory payload schema based on spec
export interface MemoryPayload {
    session_name: string;
    agent: string;
    status: string;
    outcome: "succeeded" | "failed" | "partial" | "in_progress";
    built: string[];
    decisions: string[];
    next_steps: string[];
    files: string[];
    blockers: string[];
    conversation_context: string;
    repo?: string;
    branch?: string;
    roster: any[];
    metadata: Record<string, string>;
}

export function getConfig(): Config {
    if (!fs.existsSync(CONFIG_FILE)) {
        throw new Error('Config not found. Please run `npx @memorypalace/cli init`.');
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
}

export function saveConfig(config: Config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function getGeminiKey(): string | undefined {
    try {
        const conf = getConfig();
        if (conf.gemini_key) return conf.gemini_key;
    } catch (e) { }
    return process.env.GEMINI_API_KEY;
}

export const API_BASE = process.env.MP_API_BASE || 'https://m.cuer.ai';
