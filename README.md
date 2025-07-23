# Mapin

> Visio-lite diagramming for the browser – **open-source, web-first, MIT-licensed**.

![Mapin screenshot placeholder](./docs/screenshot.png)

Mapin lets you create process maps, flow-charts, and whiteboard sketches directly in the browser using drag-and-drop shapes and smart connectors. It’s built to be:

* **Free & open source** – MIT license, no vendor lock-in.
* **Web-first** – runs entirely client-side; deploy it to any static host.
* **Extensible** – powered by React, Tailwind, and the excellent React Flow graph engine.

---

## ✨ Features (MVP)

| Status | Feature |
| ------ | ------- |
| ✅ | Rectangle, diamond, ellipse & text shapes |
| ✅ | Drag-drop, pan, zoom, snap-to-grid |
| ✅ | Orthogonal connectors with auto-routing |
| ✅ | Mini-map & canvas controls |
| 🔜 | JSON save/load ↔ localStorage |
| 🔜 | Export to PNG / SVG |
| 🔜 | Multi-select, align & distribute |
| 🚀 | Real-time collaboration (CRDT/WebSocket) |

---

## 🔧 Tech stack

| Layer | Library |
| ----- | ------- |
| UI / Framework | React 18, TypeScript, Vite |
| Diagram engine | `@xyflow/react` (React Flow v12) |
| Canvas polish | Tailwind CSS 3.x |
| State | Zustand 4 |
| Build / tooling | pnpm workspaces, Vitest, ESLint, Prettier |
| Hosting | Vercel Hobby (static build)

---

## 📂 Repository structure

```
.
├─ apps/
│  └─ web/           # React front-end (Vite)
├─ libs/             # Shared TS utilities (future)
├─ docs/             # Images / docs (optional)
├─ pnpm-workspace.yaml
└─ vercel.json       # Deployment config
```

---

## 🚀 Quick start

```bash
# 1. Clone
$ git clone https://github.com/TechKuro/Mapin.git && cd Mapin

# 2. Install (needs Node ≥18 & pnpm ≥8)
$ pnpm install

# 3. Run dev server
$ pnpm dev            # → http://localhost:5173
```

### Using GitHub Codespaces

1. Click the **Code ▾** button → **Codespaces** → **Create codespace**.
2. Wait for the container to build; the dev server will auto-run.

---

## 📜 Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production build (outputs to `apps/web/dist`) |
| `pnpm preview` | Preview the prod build locally |
| `pnpm lint` | Run ESLint across workspace |
| `pnpm test` | Unit tests via Vitest |

---

## ☁️ Deployment (Vercel)

The repo includes `vercel.json`; just **Import Project** in the Vercel dashboard. Builds are automatic on every push and each PR gets its own preview URL.

---

## 🗺 Roadmap

1. Finish save/load & export functionality.
2. Keyboard shortcuts + multi-select tooling.
3. Public share links (Supabase row storage).
4. Real-time collaboration via WebSocket & Yjs.
5. Mobile wrapper (Capacitor) for tablet editing.

See [issues](https://github.com/TechKuro/Mapin/issues) for the up-to-date task list.

---

## 🤝 Contributing

PRs and issues are welcome! Please follow the conventional-commit style (`feat: …`, `fix: …`) and run `pnpm lint && pnpm test` before opening a pull request.

---

## 📄 License

MIT © 2025 Martin Graham

---

## 🙏 Acknowledgements

* [React Flow](https://reactflow.dev) – diagram engine
* [Tailwind CSS](https://tailwindcss.com) – utility-first styling
* [xyflow](https://github.com/xyflow/xyflow) community – inspiration & support 