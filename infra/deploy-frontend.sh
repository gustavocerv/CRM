#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-crm-frontend}"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:latest"

gcloud builds submit ../frontend --tag "$IMAGE"

gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --allow-unauthenticated
