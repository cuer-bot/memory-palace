import { getConfig, saveConfig, Config } from './config';
import { generateKeys } from './crypto';
import { createPalace } from './api';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function checkMcpConfig(binPath: string) {
    // Attempt to configure Claude Desktop MCP
    const claudeDir = path.join(os.homedir(), '.config', 'Claude');
    const claudeConfigPath = path.join(claudeDir, 'claude_desktop_config.json');
    if (fs.existsSync(claudeDir)) {
        let conf: any = { mcpServers: {} };
        if (fs.existsSync(claudeConfigPath)) {
            try {
                conf = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
            } catch (e) { }
        }
        if (!conf.mcpServers) conf.mcpServers = {};
        conf.mcpServers["memory_palace"] = {
            command: "node",
            args: [binPath, "mcp"]
        };
        fs.writeFileSync(claudeConfigPath, JSON.stringify(conf, null, 2));
        console.log(`✓ Configured Claude Desktop MCP at ${claudeConfigPath}`);
    } else {
        console.log(`ℹ Claude Desktop not found. To configure MCP manually, add:`);
        console.log(`
"mcpServers": {
  "memory_palace": {
    "command": "node",
    "args": ["${binPath}", "mcp"]
  }
}
`);
    }
}

export async function initCommand(options: { geminiKey?: string }) {
    try {
        let existingConfig: Partial<Config> = {};
        try {
            existingConfig = getConfig();
            console.log("Memory Palace is already initialized. Overwriting will generate new keys.");
        } catch (e) { /* expected if not initialized */ }

        console.log("Generating local cryptography keys...");
        const keys = generateKeys();

        console.log("Registering Palace with m.cuer.ai...");
        const palaceId = await createPalace(keys.public_key);

        const config: Config = {
            palace_id: palaceId,
            palace_key: keys.palace_key,
            public_key: keys.public_key,
        };

        if (options.geminiKey) {
            config.gemini_key = options.geminiKey;
        } else if (existingConfig.gemini_key) {
            config.gemini_key = existingConfig.gemini_key;
        }

        saveConfig(config);
        console.log(`✓ Palace initialized! Palace ID: ${palaceId}`);

        // Try to guess global installed bin path. Since we are local for now:
        const currentBinPath = path.resolve(__dirname, 'index.js');
        await checkMcpConfig(currentBinPath);

        console.log(`\nYou are now ready to store and retrieve signed memory context locally and across agents.`);
    } catch (e: any) {
        console.error("Initialization failed:", e.message);
        process.exit(1);
    }
}
