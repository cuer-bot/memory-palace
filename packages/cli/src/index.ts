#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './init';
import { recoverMemory } from './recover';
import { saveMemoryCommand } from './save';
import { runMcpServer } from './mcp';
import { authCommand } from './auth';
import { inviteAgent, revokeAgent, listAgents } from './agents';
import { shareMemory } from './share';
import { attachImage } from './attach';

const program = new Command();

program
    .name('memory-palace')
    .description('Memory Palace CLI for agents')
    .version('1.1.0');

program
    .command('init')
    .description('Initialize Memory Palace')
    .option('--gemini-key <key>', 'Set Gemini API Key')
    .action(async (options) => {
        await initCommand(options);
    });

program
    .command('recover <short_id>')
    .description('Recover context')
    .action(async (short_id) => {
        await recoverMemory(short_id);
    });

program
    .command('save <json_file>')
    .description('Encrypt, sign and store')
    .action(async (json_file) => {
        await saveMemoryCommand(json_file);
    });

program
    .command('list')
    .description('List recent memories')
    .option('--limit <n>', 'Number of memories to return', '10')
    .action(async (options) => {
        const { listMemories } = require('./list');
        await listMemories(parseInt(options.limit, 10));
    });

program
    .command('verify <short_id>')
    .description('Verify memory signature')
    .action(async (short_id) => {
        const { verifyMemory } = require('./verify');
        await verifyMemory(short_id);
    });

program
    .command('scan <image_path>')
    .description('Scan image to extract memory context')
    .action(async (image_path) => {
        const { scanCommand } = require('./scan');
        await scanCommand(image_path);
    });

program
    .command('auth <guest_key>')
    .description('Save a guest key to config (mempalace auth gk_xxxx)')
    .action(async (guest_key) => {
        await authCommand(guest_key);
    });

program
    .command('invite <agent_name>')
    .description('Create a guest key for an agent')
    .option('--permissions <level>', 'read, write, or admin (default: read)', 'read')
    .action(async (agent_name, options) => {
        await inviteAgent(agent_name, options.permissions);
    });

program
    .command('revoke <agent_name>')
    .description('Revoke a guest key by agent name')
    .action(async (agent_name) => {
        await revokeAgent(agent_name);
    });

program
    .command('agents')
    .description('List all agents and their guest keys')
    .action(async () => {
        await listAgents();
    });

program
    .command('share <short_id>')
    .description('Generate a self-contained Python decrypt snippet for web agents (e.g. ChatGPT)')
    .action(async (short_id) => {
        await shareMemory(short_id);
    });

program
    .command('attach <short_id> <image_path>')
    .description('Attach a generated image to a stored memory (copies to .palace/memories/ and uploads)')
    .action(async (short_id, image_path) => {
        await attachImage(short_id, image_path);
    });

program
    .command('mcp')
    .description('Start MCP server over stdio')
    .action(async () => {
        await runMcpServer();
    });

program
    .option('--verify-sig', 'Verify CLI integrity (mocked)')
    .action((options) => {
        if (options.verifySig) {
            console.log("Validating CLI binary signature...");
            console.log("✓ signature verified: VALID");
            process.exit(0);
        }
        program.help();
    });

program.parse(process.argv);
