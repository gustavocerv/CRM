# CRM on Google Cloud (Production-Oriented Blueprint)

This repository provides a **starter architecture + implementation scaffold** for a multi-tenant CRM running on Google Cloud with:
- Next.js frontend
- Node.js/Express backend API
- PostgreSQL (Cloud SQL)
- Google Cloud Storage file uploads
- Gmail API integration
- Stripe Checkout + webhooks
- Tenant-aware RBAC and secure deployment guidance

## System Architecture Overview

```text
Next.js Frontend
   ↓ HTTPS + JWT cookie
Cloud Run Backend API (Express)
   ↓
Cloud SQL (PostgreSQL, private connectivity)
   ↓
GCS (files), Stripe API (payments), Gmail API (emails)
   ↓
Secret Manager + IAM + Cloud Logging/Monitoring
```

## Google Cloud Setup

1. Create a GCP project and enable billing.
2. Enable APIs: Cloud Run, Cloud SQL Admin, IAM, Gmail, Cloud Storage, Secret Manager.
3. Create PostgreSQL Cloud SQL instance and `crm_db` database.
4. Create private GCS bucket for uploads.
5. Create backend service account with least privilege:
   - Cloud SQL Client
   - Storage Object Admin (or tighter per-prefix custom role)
   - Secret Manager Secret Accessor

See `infra/gcloud-setup.sh` for command-based bootstrap.

## Backend (API) – Step-by-step

The backend scaffold is inside `backend/`:
- JWT auth with tenant-aware middleware
- Role middleware (`admin`, `manager`, `secretary`, `employee`)
- Stripe checkout + webhook verification endpoint
- File upload flow to GCS abstraction
- Gmail service abstraction using Google APIs

Start locally:

```bash
cd backend
npm install
npm run dev
```

## Frontend – Step-by-step

The frontend scaffold is inside `frontend/` and follows Next.js App Router with pages for:
- `/login`
- `/dashboard`
- `/admin/users`
- `/clients`
- `/projects`
- `/schedule`
- `/payments`

Use HTTP-only cookie auth and role-based rendering.

## Database Design (Schema)

`database/schema.sql` includes a multi-tenant schema with required tables:
- `tenants`
- `users`
- `clients`
- `projects`
- `schedules`
- `time_logs`
- `payments`
- `files`

Every business table has `tenant_id` and key tenant-scoped indexes.

## Authentication & Role System

- Password hashing with bcrypt (12 rounds).
- JWT payload: `user_id`, `role`, `tenant_id`.
- Middleware enforces token + role checks.
- Query pattern requirement: always scope by `tenant_id`.

## File Storage (Google Cloud Storage)

- Upload endpoint accepts file via Multer.
- File saved to GCS path `tenants/<tenant_id>/...`.
- URL strategy:
  - Preferred: signed URLs (short-lived)
  - Alternative: backend-proxied reads

## Gmail API Integration

- OAuth2 flow for admin to connect Gmail account.
- Store refresh token in Secret Manager (encrypted at rest).
- Use Gmail API for confirmations, receipts, and updates.

## Stripe Payment Integration

- Checkout session includes `tenant_id` + `project_id` metadata.
- Webhook endpoint verifies Stripe signature.
- On successful payment, backend updates `payments` and related project state.

## Multi-Tenant SaaS Logic

- Admin registration creates a `tenant` and first admin user.
- All invited/created users inherit tenant context.
- Data isolation by mandatory tenant filtering at query level.

## Security & IAM

- HTTPS-only deployment.
- Private Cloud SQL connectivity from Cloud Run.
- Secrets from Secret Manager only.
- Rate limit login endpoint.
- Enable audit logs, monitoring, and alerting.

## Deployment on GCP

- Backend: containerized and deployed to Cloud Run.
- Frontend: Cloud Run or Firebase Hosting.
- Attach Cloud SQL connector and service account to backend.
- Use CI/CD for build, test, and deploy gates.

## Testing & Production Hardening

Checklist:
- Tenant isolation tests
- RBAC access control tests
- Stripe webhook signature validation tests
- File access policy tests
- Gmail token refresh tests
- SQL injection and auth brute-force checks
- CORS and cookie security validation

## File Structure Layout

```text
backend/
  src/
    app.js
    config/
    controllers/
    middleware/
    routes/
    services/
database/
  schema.sql
frontend/
  (next.js scaffold placeholder)
infra/
  gcloud-setup.sh
  deploy-backend.sh
  deploy-frontend.sh
```
