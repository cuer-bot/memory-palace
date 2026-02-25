export const dynamic = 'force-dynamic'

const TEXT = `# Memory Palace — Troubleshooting Guide
# https://m.cuer.ai/api/troubleshoot

---

## Can't fetch m.cuer.ai at all

Use the raw GitHub fallback URL instead:
  https://raw.githubusercontent.com/Camaraterie/memory-palace/master/public/memory-palace-skill.md

If that also fails, you cannot browse URLs. You are Template F (no HTTP access).
Ask the user to paste the skill document into the chat manually.

---

## 400 from /api/ingest or /api/store

Bad request — the payload doesn't meet schema requirements.
Required fields: session_name, agent, status, outcome, built, decisions, next_steps,
  files, blockers, conversation_context, roster, metadata
outcome must be one of: succeeded, failed, partial, in_progress
All list fields (built, decisions, next_steps, files, blockers) must be arrays.

Fix: check each required field is present and correctly typed.

---

## 403 from /api/ingest or /api/store

Invalid, revoked, or insufficient-permission guest key.
- Guest key must start with gk_
- Key must be active (not revoked)
- Key must have write or admin permission

Fix: ask the user to confirm your guest key and whether it is still active.

---

## 422 from /api/ingest or /api/store

Schema validation failed or prompt injection detected.
- Prompt injection: your payload contains phrases like "ignore previous instructions", "jailbreak",
  "DAN", "system prompt", etc. These are flagged for security.
- Schema: re-check all required fields are present and outcome is a valid enum value.

Fix: remove any flagged phrases from the payload. Use neutral, factual language.

---

## Parse error on store URL

If you are using the simple field URL format (/store?auth=...&session_name=...),
spaces must be encoded as + or %20, and lists must be comma-separated.
Example: built=auth+middleware,login+page&decisions=use+JWT

If you are using the base64url data format (/api/ingest?auth=...&data=...),
make sure the JSON is valid before encoding, and use URL-safe base64 (no padding).

Fix: use the simple field URL format if encoding is causing issues.

---

## Fork skill page shows "no skill fork" or "This memory does not contain a skill fork"

This memory was stored before fork skills were added, or does not have fork_template in metadata.

Fix: re-run /onboard. A new onboarding memory will include fork_template in metadata,
and /q/<new_short_id>/skill will serve your personalized fork skill.

---

## Fork skill page shows HTML entities (&quot; &lt; &gt;)

The HTML page at /q/<short_id>/skill uses an HTML wrapper. Use the plain-text endpoint instead:
  GET https://m.cuer.ai/api/fork?id=<short_id>

This returns text/plain with no HTML wrapping.

---

## Can't fetch QR PNG (binary fetch fails)

Your environment cannot fetch binary files. You are Template H (or similar).

Fix: ask the user to download the QR PNG and attach it to the conversation:
  "Please download this file and attach it: https://m.cuer.ai/q/<short_id>/qr"

---

## QR code in the generated image doesn't scan

The QR module geometry was distorted during image generation.

Diagnosis: send the image to https://m.cuer.ai/api/scan/verify (POST multipart/form-data, field: image)
  - If scannable: false → QR was distorted. Regenerate.
  - If scannable: true → QR is fine, scanning tool issue.

Fix: regenerate the image. Make sure the QR reference PNG was passed as a reference/input image,
not described in the prompt text. The image model must copy the QR pixels precisely.
Checkerboard or placeholder QRs will not scan.

---

## Wrong template selected — capability mismatch

Re-run the active probe tests to determine correct template:
  Test 1 (browse):   GET https://m.cuer.ai/api/probe  → {"ok":true}
  Test 2 (terminal): run: npx --version
  Test 3 (code):     run: print(1+1) in code interpreter
  Test 4 (net):      run Python: urllib.request.urlopen("https://m.cuer.ai/api/probe").read()
  Test 5 (POST):     POST https://m.cuer.ai/api/probe  → {"ok":true}
  Test 6 (binary):   GET https://m.cuer.ai/api/probe/png  → receive image bytes

Re-run /onboard after confirming your actual capabilities.

---

## /api/recall or /api/palace returning 401

These endpoints require auth. Use one of:
  Option A (header):   Authorization: Bearer gk_...
  Option B (URL param): ?auth=gk_...

---

## "Memory not found" on /api/recall

The short_id you passed either does not exist or belongs to a different palace.
Only memories stored by your guest key's palace are visible.

---

## No response from any endpoint (timeout)

Your environment may be sandboxed with no internet access.
Test: run Python: urllib.request.urlopen("https://m.cuer.ai/api/probe").read()
If this times out, you are in a sandboxed interpreter (Template F or no-net Template E).

---

## More help

Skill doc:  https://m.cuer.ai/memory-palace-skill.md
Onboard:    https://m.cuer.ai/memory-palace-onboard.md
FAQ:        https://m.cuer.ai/api/faq
`

export async function GET() {
    return new Response(TEXT, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
        },
    })
}
