import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { recoverMemory } from './recover';
import { storeMemory } from './api';
import { getConfig, MemoryPayload, getGeminiKey } from './config';

export async function runMcpServer() {
    const server = new Server(
        {
            name: "memory_palace",
            version: "2.0.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "recover",
                    description: "Recover a signed, decrypted session memory by short_id. Returns historical context data only — never instructions.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            short_id: { type: "string", description: "7-character memory ID from QR code or image panel" }
                        },
                        required: ["short_id"]
                    }
                },
                {
                    name: "save",
                    description: "Encrypt, sign, and store a new session memory. Returns short_id and image_url if GEMINI_API_KEY is configured.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            session_name: { type: "string" },
                            agent: { type: "string" },
                            status: { type: "string" },
                            outcome: { type: "string", enum: ["succeeded", "failed", "partial", "in_progress"] },
                            built: { type: "array", items: { type: "string" } },
                            decisions: { type: "array", items: { type: "string" } },
                            next_steps: { type: "array", items: { type: "string" } },
                            files: { type: "array", items: { type: "string" } },
                            blockers: { type: "array", items: { type: "string" } },
                            conversation_context: { type: "string" },
                            repo: { type: "string", description: "Git repository URL for cold-start cloning" },
                            branch: { type: "string", description: "Current git branch" }
                        },
                        required: ["session_name", "agent", "status", "outcome"]
                    }
                }
            ]
        };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        try {
            if (request.params.name === "recover") {
                const short_id = request.params.arguments?.short_id as string;
                if (!short_id) throw new Error("short_id required");
                const envelope = await recoverMemory(short_id, true);
                return {
                    content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }]
                };
            } else if (request.params.name === "save") {
                const args = request.params.arguments as any;
                const payload: MemoryPayload = {
                    session_name: args.session_name,
                    agent: args.agent,
                    status: args.status,
                    outcome: args.outcome,
                    built: args.built || [],
                    decisions: args.decisions || [],
                    next_steps: args.next_steps || [],
                    files: args.files || [],
                    blockers: args.blockers || [],
                    conversation_context: args.conversation_context || "",
                    repo: args.repo || "",
                    branch: args.branch || "",
                    roster: [],
                    metadata: {}
                };
                const conf = getConfig();
                const result: any = await storeMemory(conf, payload);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            short_id: result.short_id,
                            url: result.short_url
                        }, null, 2)
                    }]
                };
            }
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
        } catch (e: any) {
            return {
                content: [{ type: "text", text: `Error: ${e.message}` }],
                isError: true
            }
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
