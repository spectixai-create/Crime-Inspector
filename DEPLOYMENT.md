# Deployment — Vercel

This is a Next.js 14 (App Router) application. The repository is set up
for one-click deployment to Vercel with no code changes.

## Required environment variables

| Variable            | Required | Where used                              |
| ------------------- | -------- | --------------------------------------- |
| `ANTHROPIC_API_KEY` | **Yes**  | `src/lib/llm.ts` — read at request time by `/api/interrogate`, `/api/evaluate`, `/api/assistant` |

That is the **only** secret the app needs. There are no `NEXT_PUBLIC_*`
variables — nothing is exposed to the browser.

## Steps

1. Open the Vercel dashboard and click **Add New… → Project**.
2. Import the GitHub repository:
   `https://github.com/spectixai-create/Crime-Inspector`
3. **Framework preset**: Next.js (auto-detected).
4. **Build command**: leave the default (`next build`).
5. **Output directory**: leave the default (`.next`).
6. Expand **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: *(paste your Anthropic API key)*
   - Environments: **Production**, **Preview**, **Development**.
7. Click **Deploy**.

## After deploy

- If you added the env variable **after** the first deploy, trigger a
  redeploy from the Vercel **Deployments** tab.
- No custom domain is required for prototype testing — the auto-assigned
  `*.vercel.app` URL works out of the box.
- The app is dark-mode-only Hebrew RTL — no system theme detection.

## Verification checklist on the live URL

After deploy, open the deployment URL and confirm:

- The Case Selector renders three cases (case 003 is locked until 002 is
  solved with 3+ stars).
- Click into a case → Case Brief renders the dossier.
- Enter the interrogation room → a question to the suspect returns a
  reply (this is the live `ANTHROPIC_API_KEY` check). If you see
  *"שגיאת רשת או API — נסה שוב"*, the key is missing or invalid.
- Open the Evidence drawer (`Ctrl+E` or the top-bar button).
- The Investigation Assistant button appears after the first exchange.

## Runtime notes

- All three API routes declare `export const runtime = 'nodejs'` and run
  as Vercel serverless functions (no edge-runtime constraints).
- Case data, evidence images, and audio loops are static — case JSON is
  imported into the bundle at build time, media is served from `/public`.
- Client state (current session, completed cases, audio prefs) lives in
  `localStorage` — no database is required.
