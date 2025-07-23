# Mapin — Visio-lite PoC

This repository contains a monorepo for the **Mapin** process-mapping proof-of-concept.

* **Frontend:** React 18 + Vite + TypeScript (located in `apps/web`)
* **Diagram engine:** React Flow Community + tldraw
* **Styling:** Tailwind CSS + shadcn/ui (soon)

## Getting started

```bash
# Install dependencies (PNPM is recommended)
pnpm install

# Start the web app in dev mode
pnpm dev
```

The web application will be available at http://localhost:5173 by default.

## Project layout

```text
.
├─ apps/web/         # React + Vite frontend
├─ libs/             # Shared TypeScript libraries (planned)
└─ pnpm-workspace.yaml
```

## Deploying to Vercel (cloud-only workflow)

1. Sign in to [Vercel](https://vercel.com) with GitHub and click **Add New → Project**.
2. Select the `TechKuro/Mapin` repository.
3. When prompted for settings:
   * **Framework Preset:** Vite
   * **Root Directory:** `.` (repo root)
   * **Build Command:** `npm run build --workspaces` *(default picked up)*
   * **Output Directory:** `apps/web/dist`
4. Click **Deploy** – the first build may take a minute. Subsequent pushes trigger preview URLs automatically.

Alternatively, if you keep the `vercel.json` committed (already provided), Vercel detects the settings above automatically, so you can just hit **Import** and deploy.

After deploy completes, the Production URL is live and each git commit will receive its own preview link (e.g. `https://mapin-git-feature-xyz-vercel.app`).

## License

MIT © 2025 Martin Graham 