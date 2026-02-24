@https://m.cuer.ai/memory-palace-skill.md

## Git — Commit & Push at Each Milestone

Two remotes are maintained in parallel:

| Remote | Repo | Auth |
|--------|------|------|
| `cuer-bot` | `github.com/cuer-bot/memory-palace` | cuer-bot token (available in shell) |
| `origin` | `github.com/Camaraterie/memory-palace` | Camaraterie token (push manually if 403) |

**Standard milestone push:**
```bash
git push cuer-bot master && git push origin master
```

If `origin` returns 403 (cuer-bot token rejected by Camaraterie repo), push `origin` manually with the Camaraterie account.
