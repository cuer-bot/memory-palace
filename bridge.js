const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const REPO_ROOT = __dirname;
const PORT = 3005;
const PUSH_REMOTE = 'origin';

// 1x1 transparent PNG for browser feedback
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
    return path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, '');
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = reqUrl.pathname;
    const query = Object.fromEntries(reqUrl.searchParams);

    const sendImg = () => {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        res.end(TRANSPARENT_PNG);
    };

    const sendText = (txt) => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(txt);
    };

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
                const status = execSync('git status --porcelain', { cwd: REPO_ROOT }).toString();
                log('Checked git status');
                sendText(status || 'Clean working tree');
            }
            else if (pathname === '/patch') {
                const file = safePath(query.file);
                if (!query.data) throw new Error('Missing diff data');
                const diff = Buffer.from(query.data, 'base64').toString('utf8');
                const patchFile = path.join(REPO_ROOT, 'cuer_temp.patch');
                fs.writeFileSync(patchFile, diff);
                try {
                    execFileSync('patch', ['-u', file, '-i', 'cuer_temp.patch'], { cwd: REPO_ROOT });
                    log(`💠 Patched: ${file}`);
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
                    if (!e.message.includes('nothing to commit')) throw e;
                }
                sendImg();
            }
            else if (pathname === '/push') {
                const remote = query.remote || PUSH_REMOTE;
                log(`🚀 Pushing to ${remote}...`);
                execFileSync('git', ['push', remote, 'HEAD'], { cwd: REPO_ROOT });
                log('☁️ Push complete.');
                sendImg();
            }
            else if (pathname === '/reflect') {
                // Read a local file, write to REFLECTOR.txt, push to GitHub for AI Studio to read
                const file = safePath(query.file);
                const content = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
                fs.writeFileSync(path.join(REPO_ROOT, 'REFLECTOR.txt'), `// SPECTRA REFLECTION OF ${file}\n\n${content}`);
                execFileSync('git', ['add', 'REFLECTOR.txt'], { cwd: REPO_ROOT });
                try {
                    execFileSync('git', ['commit', '-m', `SPECTRA: Reflecting ${file}`], { cwd: REPO_ROOT });
                } catch (e) {
                    if (!e.message.includes('nothing to commit')) throw e;
                }
                execFileSync('git', ['push', PUSH_REMOTE, 'HEAD'], { cwd: REPO_ROOT });
                log(`📡 Reflected ${file} to GitHub.`);
                sendImg();
            }
            else if (pathname === '/capsule-reflect') {
                // Fetch a m.cuer.ai capsule via local curl, push to REFLECTOR.txt for AI Studio to read
                const id = query.id;
                if (!id || !/^[a-z0-9]+$/i.test(id)) throw new Error('Invalid capsule id');
                const capsuleUrl = `https://m.cuer.ai/q/${id}`;
                log(`📡 Fetching capsule ${id}...`);
                execFileSync('curl', ['-s', capsuleUrl, '-o', 'REFLECTOR.txt'], { cwd: REPO_ROOT });
                execFileSync('git', ['add', 'REFLECTOR.txt'], { cwd: REPO_ROOT });
                try {
                    execFileSync('git', ['commit', '-m', `SPECTRA: Reflecting capsule ${id}`], { cwd: REPO_ROOT });
                } catch (e) {
                    if (!e.message.includes('nothing to commit')) throw e;
                }
                execFileSync('git', ['push', PUSH_REMOTE, 'HEAD'], { cwd: REPO_ROOT });
                log(`☁️ Capsule ${id} reflected to GitHub.`);
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
    console.log(`\n❖ OPTICAL DAEMON v5 ONLINE ❖`);
    console.log(`Listening on http://127.0.0.1:${PORT}`);
    console.log(`Push remote: ${PUSH_REMOTE}`);
    console.log(`Endpoints: /read, /status, /patch, /stage, /commit, /push, /reflect, /capsule-reflect`);
});
