#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-crm-backend}"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:latest"
SQL_CONNECTION_NAME="${SQL_CONNECTION_NAME:-project:region:instance}"
SERVICE_ACCOUNT="crm-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com"


gcloud builds submit ../backend --tag "$IMAGE"

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated \
  --service-account "$SERVICE_ACCOUNT" \
  --set-env-vars "NODE_ENV=production" \
  --add-cloudsql-instances "$SQL_CONNECTION_NAME"
