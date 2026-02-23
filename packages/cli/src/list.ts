import { getConfig } from './config';
import { getMemories } from './api';

export async function listMemories(limit: number = 10) {
    try {
        const conf = getConfig();
        const data = (await getMemories(conf.palace_id, limit)) as any;

        console.log(`Recent Memories for Palace ${conf.palace_id}:`);
        if (!data.memories || data.memories.length === 0) {
            console.log("  No memories found.");
            return;
        }

        data.memories.forEach((m: any) => {
            console.log(`- ${m.short_id} | Agent: ${m.agent || 'unknown'} | Date: ${new Date(m.created_at).toLocaleString()}`);
        });

    } catch (e: any) {
        console.error("List failed:", e.message);
        process.exit(1);
    }
}
