# Collarts Automation Stack

Discord AI concierge + webhook fan-out so teachers can operate GitHub + Vercel without leaving #college-of-the-rats.

## Prereqs
- Node.js 18+
- Discord application (bot user + public key)
- GitHub personal access token (fine-grained, repo + issues scope) or GitHub App token
- Vercel token with access to the course project

```bash
cp .env.example .env
npm install
```

Populate `.env` with the IDs/secrets for Discord, GitHub, and Vercel.

## Slash Commands
| Command | Purpose |
| --- | --- |
| `/rat-status [branch]` | Summaries commits + test signals for a branch using GitHub REST |
| `/deploy-fresh-cheese [ref]` | Queues a Vercel deployment for `ref` |
| `/hide-the-stash` | Rolls production back to the last healthy deploy |
| `/open-issue <title> <summary>` | Creates a GitHub issue containing the Discord thread context |
| `/patch-notes` | Generates release notes from recently merged PRs |

Register commands globally:
```bash
npm run register-commands
```

## Running the Bot API
```bash
npm run dev
```
Expose `http://localhost:8787/interactions` via a tunnelling service for Discord interactions while developing.

### Routes
- `POST /interactions` – Discord interaction endpoint (signature-verified)
- `POST /webhooks/github` – Receives GitHub webhooks (push, pull_request, deployment_status)
- `POST /webhooks/vercel` – Listens for Vercel deployment lifecycle events

GitHub + Vercel routes currently log events and are ready for Discord notifications once tokens/webhook URLs are added. Signature verification is wired through `GITHUB_WEBHOOK_SECRET` / `VERCEL_WEBHOOK_SECRET`.

## Extending the AI Concierge
`src/commands.js` includes helper functions for GitHub + Vercel REST APIs. Replace TODO blocks with calls to your AI orchestration layer (e.g., send structured payloads to OpenAI or internal agents) so responses can be embellished with generated text, audio renders, or assignment reminders.
