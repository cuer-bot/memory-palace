const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const url = require('url');

const REPO_ROOT = __dirname;
const PORT = 3005;

// The magical 1x1 transparent PNG for browser feedback
const TRANSPARENT_PNG = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c6360000200000500017a5eab3f0000000049454e44ae426082',
    'hex'
);

function log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] [SPECTRA] ${msg}`);
}

function safePath(p) {
    if (!p) throw new Error('Missing file path');
    const normalized = path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, '');
    return normalized;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Helper to send image response
    const sendImg = () => {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        res.end(TRANSPARENT_PNG);
    };

    // Helper to send text response
    const sendText = (txt) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(txt);
    };

    // Helper to send error
    const sendError = (err) => {
        log(`❌ Error: ${err.message}`);
        res.writeHead(500);
        res.end(err.message);
    };

    if (req.method === 'GET') {
        try {
            if (pathname === '/read') {
                const file = safePath(query.file);
                const fullPath = path.join(REPO_ROOT, file);
                if (fs.existsSync(fullPath)) {
                    sendText(fs.readFileSync(fullPath, 'utf8'));
                } else {
                    res.writeHead(404);
                    res.end(`File not found: ${file}`);
                }
            } 
            else if (pathname === '/status') {
                // Returns current git status
                const status = execSync('git status --porcelain', { cwd: REPO_ROOT }).toString();
                log('Checked git status');
                sendText(status || 'Clean working tree');
            }
            else if (pathname === '/patch') {
                const file = safePath(query.file);
                if (!query.data) throw new Error('Missing diff data');
                const diff = Buffer.from(query.data, 'base64').toString('utf8');
                
                // Write patch file
                const patchFile = 'cuer_temp.patch';
                fs.writeFileSync(patchFile, diff);
                
                // Try applying
                try {
                    // Try to apply directly
                    execFileSync('patch', ['-u', file, '-i', patchFile], { cwd: REPO_ROOT });
                    log(`💠 Patched: ${file}`);
                } catch (e) {
                    // If it failed, maybe it's a new file? Check content
                    if (diff.includes('--- /dev/null')) {
                        // Extract content from diff manually? No, that's brittle.
                        // Let's assume the user will 'write' new files via a different mechanism if patch fails?
                        // Actually, for this version, let's keep it simple: strict patching.
                        throw e;
                    }
                    throw e;
                } finally {
                    if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
                }
                sendImg();
            }
            else if (pathname === '/stage') {
                const file = safePath(query.file);
                execFileSync('git', ['add', file], { cwd: REPO_ROOT });
                log(`🔹 Staged: ${file}`);
                sendImg();
            }
            else if (pathname === '/commit') {
                const msg = query.message || 'SPECTRA: Automated update';
                try {
                    execFileSync('git', ['commit', '-m', msg], { cwd: REPO_ROOT });
                    log(`✅ Committed: "${msg}"`);
                } catch (e) {
                    // Ignore empty commit errors
                    if (!e.message.includes('nothing to commit')) throw e;
                }
                sendImg();
            }
            else if (pathname === '/push') {
                log('🚀 Pushing to origin...');
                execSync('git push origin HEAD', { cwd: REPO_ROOT });
                log('☁️ Push complete.');
                sendImg();
            }
            else {
                res.writeHead(404);
                res.end('Unknown endpoint');
            }
        } catch (e) {
            sendError(e);
        }
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n❖ OPTICAL DAEMON v3 (PRECISION) ONLINE ❖`);
    console.log(`Listening on http://127.0.0.1:${PORT}`);
    console.log(`Endpoints: /read, /status, /patch, /stage, /commit, /push`);
});