# CRM in Google Cloud (GCP) – Production Implementation Guide

This repository now contains a **working starter implementation** (backend, frontend, database schema, and infra scripts) plus an actionable deployment path using your GCP project and VM instance.


## Quick start: run server and test from public IP

### Run backend on your VM and expose it publicly

```

> Note: for real production, put HTTPS + domain in front of the VM (Load Balancer or Nginx + cert).

---

## 1) System Architecture Overview

- **Frontend:** Next.js app (role-aware pages).
- **Backend:** Node.js + Express API (JWT auth, tenant scoping, RBAC).
- **Database:** PostgreSQL (Cloud SQL recommended).
- **File Storage:** Google Cloud Storage bucket with tenant-scoped object paths.
- **Email:** Gmail API OAuth2 integration.
- **Payments:** Stripe checkout + webhook verification.
- **Secrets:** Secret Manager.
- **Runtime:** Cloud Run (recommended) or Compute Engine instance (`ha-node-1`).

Logical flow:

```text
Next.js Frontend
  -> Express API (JWT cookie/session)
  -> PostgreSQL (tenant-scoped data)
  -> GCS (files)
  -> Stripe + Gmail APIs
```

---

## 2) Google Cloud Setup

Your provided project context:


Bootstrap project resources with:

```bash
cd infra
PROJECT_ID=project-0693dfc8-2cf7-4d94-a5e REGION=us-central1 ./gcloud-setup.sh
```

This enables required APIs, creates Cloud SQL DB + user, creates GCS bucket, and grants IAM roles to backend service account.

---

## 3) Backend (API) – Step-by-step

Implemented in `backend/`.

### Key endpoints
- `POST /api/auth/register-admin` → creates tenant + first admin.
- `POST /api/auth/login` → JWT login.
- `GET /api/users` → list users in same tenant (admin/manager).
- `POST /api/users` → admin creates users for same tenant.
- `POST /api/files/upload` → upload files (tenant/project scoped path).
- `POST /api/payments/checkout` → create Stripe checkout session.
- `POST /api/payments/webhook/stripe` → verify and process Stripe webhook.
- `GET /api/integrations/gmail/connect` → Gmail OAuth connect URL.

### Run locally

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

---

## 4) Frontend – Step-by-step

Implemented in `frontend/` with route placeholders:
- `/login`
- `/dashboard`
- `/admin/users`
- `/clients`
- `/projects`
- `/schedule`
- `/payments`

Use HTTP-only JWT cookie from backend login and hide/show features by role.

---

## 5) Database Design (Schema)

`database/schema.sql` includes multi-tenant tables:
- `tenants`
- `users`
- `clients`
- `projects`
- `schedules`
- `time_logs`
- `payments`
- `files`

All business rows are linked to `tenant_id` for isolation.

---

## 6) Authentication & Role System

- JWT payload includes `user_id`, `role`, `tenant_id`.
- Password hash uses bcrypt (`12` rounds).
- Middleware blocks unauthorized roles.
- Queries are expected to always filter by tenant.

---

## 7) File Storage (Google Cloud Storage)

- Multer receives file in API.
- Object key format: `tenants/<tenant_id>/projects/<project_id>/...`.
- Persist URL metadata in `files` table.
- For production, return short-lived signed URLs.

---

## 8) Gmail API Integration

- Enable Gmail API.
- Configure OAuth2 credentials + callback.
- Admin initiates connect flow via `/api/integrations/gmail/connect`.
- Store refresh token securely (Secret Manager).

---

## 9) Stripe Payment Integration

- Server creates checkout session with metadata (`tenant_id`, `project_id`).
- Webhook endpoint verifies signature.
- On success, update `payments` and project status server-side only.

---

## 10) Multi-Tenant SaaS Logic

- First admin is created by `register-admin`, which creates a new tenant.
- Admin then creates users in same tenant.
- API prevents cross-tenant reads/writes via tenant-scoped queries.

---

## 11) Security & IAM

- Use HTTPS only.
- Keep secrets in Secret Manager.
- Use least-privilege service account roles.
- Add login rate limiting and audit logging in production.

---

## 12) Deployment on GCP

### Option A (recommended): Cloud Run
- Use `infra/deploy-backend.sh` and `infra/deploy-frontend.sh`.

### Option B: Deploy backend to your existing VM instance
- Uses your instance `ha-node-1` in `us-central1-a`.

```bash
cd infra
PROJECT_ID=project-0693dfc8-2cf7-4d94-a5e \
ZONE=us-central1-a \
INSTANCE=ha-node-1 \
./deploy-to-instance.sh
```

---

## 13) Testing & Production Hardening

Validate before go-live:
- tenant isolation tests
- role access tests
- upload authorization tests
- Stripe webhook signature tests
- Gmail token refresh tests
- SQL injection and CORS checks

Hardening:
- Cloud Monitoring + alerts
- automated DB backups
- autoscaling policies
- incident logging and alert routing

---

## 14) File Structure Layout

```text
backend/
  src/
    app.js
    config/db.js
    controllers/
    middleware/
    routes/
    services/
database/
  schema.sql
frontend/
  app/
infra/
  gcloud-setup.sh
  deploy-backend.sh
  deploy-frontend.sh
  deploy-to-instance.sh
```
=======
CRM IN GOOGLE CLOUD
