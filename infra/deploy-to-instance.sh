#!/usr/bin/env bash
set -euo pipefail

# Target instance details provided by user.
PROJECT_ID="${PROJECT_ID:-project-0693dfc8-2cf7-4d94-a5e}"
ZONE="${ZONE:-us-central1-a}"
INSTANCE="${INSTANCE:-ha-node-1}"

# Build and push API image to Artifact Registry/GCR.
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-crm}"
IMAGE_NAME="${IMAGE_NAME:-crm-backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"

# Create repo if missing.
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --description="CRM images" 2>/dev/null || true

gcloud auth configure-docker "${REGION}-docker.pkg.dev" -q

gcloud builds submit ../backend --tag "$IMAGE_URI"

# Ensure Docker is installed and run container on VM.
gcloud compute ssh "$INSTANCE" --project "$PROJECT_ID" --zone "$ZONE" --command "
  set -euo pipefail
  command -v docker >/dev/null 2>&1 || (sudo apt-get update && sudo apt-get install -y docker.io)
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo docker rm -f crm-backend || true
  sudo docker pull '$IMAGE_URI'
  sudo docker run -d --name crm-backend --restart unless-stopped -p 8080:8080 '$IMAGE_URI'
"

echo "Backend deployed to ${INSTANCE} (${ZONE})."
