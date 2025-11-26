## Deploying SERVIFY to Render (backend) and Vercel (frontend)

This guide turns the project into a production-ready setup on Render (Node backend + MongoDB) and Vercel (Vite frontend).

---

### 1. Prerequisites

- Node.js 20+
- MongoDB connection string (Atlas or self-hosted)
- Production-ready environment values (see `.env.example` files)
- GitHub repository linked to Render and Vercel

---

### 2. Backend on Render

1. **Create secrets**  
   In Render → *Secrets* add the following (names must match `render.yaml`):
   - `SERVIFY_MONGODB_URI`
   - `SERVIFY_JWT_SECRET`
   - `SERVIFY_EMAIL_USER`
   - `SERVIFY_EMAIL_PASS`
   - `SERVIFY_TWILIO_SID`
   - `SERVIFY_TWILIO_AUTH_TOKEN`
   - `SERVIFY_TWILIO_PHONE`
   - `SERVIFY_ABSTRACT_API`

2. **Deploy via `render.yaml`**  
   - Push the repo to GitHub.
   - In Render select **New + Blueprint** → choose the repo → pick the main branch.
   - Render reads `render.yaml` and provisions `servify-backend`.
   - Update the `FRONTEND_URL` value inside `render.yaml` (or via Render dashboard) once the Vercel domain is known.

3. **Environment notes**
   - Render automatically sets `PORT`; the app already reads it.
   - Add `FRONTEND_URL=https://<your-vercel-domain>` so CORS is locked down.
   - After deploy, check logs to confirm “MongoDB connected” and “Server running on port …”.

---

### 3. Frontend on Vercel

1. **Import project**
   - In Vercel click **New Project** → Import from GitHub → choose `frontend/` directory.
   - Vercel detects Vite automatically.

2. **Environment variables**
   - Add:
     - `VITE_API_URL=https://<render-service>.onrender.com/api`
     - `VITE_SOCKET_URL=https://<render-service>.onrender.com`
   - (Optional) Add analytics keys, etc.

3. **Build settings**
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
   - The included `frontend/vercel.json` encodes these defaults and references the env variables above (aliases `servify_backend_api` and `servify_backend_socket` if you prefer using Vercel Environment Variable aliases).

4. **Post-deploy**
   - Copy the generated Vercel URL and update Render’s `FRONTEND_URL`.
   - (Optional) Configure a custom domain on Vercel, then mirror it in Render.

---

### 4. Common Production Checks

- **CORS**: `FRONTEND_URL` whitelist matches the deployed frontend origin.
- **Sockets**: `VITE_SOCKET_URL` points to the Render backend base URL (no `/api` path).
- **Uploads**: Ensure Render persistent disk or external storage if you need durable uploads. By default, `backend/uploads` is ephemeral—use an S3 bucket or Render Disk for production.
- **Monitoring**: Enable Render health checks and Vercel analytics if required.
- **Secrets audit**: `.env` files remain local; only `.env.example` is tracked.

---

### 5. Deployment Flow Summary

1. Push code → GitHub.
2. Render blueprint deploy handles backend (`render.yaml`).
3. Vercel import handles frontend (`frontend/vercel.json`).
4. Update cross-domain env variables so both apps talk to each other.
5. Smoke-test: login, create tasks, send chats, verify Socket.IO events.

With these files and steps, SERVIFY can be redeployed consistently across environments. Update this document whenever infrastructure or environment variables change.

