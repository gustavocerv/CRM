#!/usr/bin/env bash
set -euo pipefail

# Target instance details provided by user.
PROJECT_ID="${PROJECT_ID:-project-0693dfc8-2cf7-4d94-a5e}"
ZONE="${ZONE:-us-central1-a}"
INSTANCE="${INSTANCE:-ha-node-1}"


# Build and push API image to Artifact Registry.
=======
# Build and push API image to Artifact Registry/GCR.

REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-crm}"
IMAGE_NAME="${IMAGE_NAME:-crm-backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"


# Public IP routing options.
HOST_PORT="${HOST_PORT:-80}"
CONTAINER_PORT="${CONTAINER_PORT:-8080}"
FIREWALL_RULE="${FIREWALL_RULE:-allow-crm-backend-${HOST_PORT}}"

# Runtime env values for backend container.
DATABASE_URL="${DATABASE_URL:-postgres://crm_user:password@127.0.0.1:5432/crm_db}"
JWT_SECRET="${JWT_SECRET:-replace_me_long_random_string}"
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-replace_me}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-replace_me}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-replace_me}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-replace_me}"
GOOGLE_REDIRECT_URI="${GOOGLE_REDIRECT_URI:-http://35.188.176.52/api/integrations/gmail/callback}"
GCS_BUCKET="${GCS_BUCKET:-project-0693dfc8-2cf7-4d94-a5e-crm-uploads}"
CORS_ORIGIN="${CORS_ORIGIN:-http://35.188.176.52}"

=======

# Create repo if missing.
gcloud artifacts repositories create "$REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --description="CRM images" 2>/dev/null || true

gcloud auth configure-docker "${REGION}-docker.pkg.dev" -q

gcloud builds submit ../backend --tag "$IMAGE_URI"


# Open VM firewall for the selected host port (80 by default).
gcloud compute firewall-rules create "$FIREWALL_RULE" \
  --project "$PROJECT_ID" \
  --allow "tcp:${HOST_PORT}" \
  --direction INGRESS \
  --priority 1000 \
  --network default \
  --source-ranges 0.0.0.0/0 \
  --target-tags crm-backend 2>/dev/null || true

gcloud compute instances add-tags "$INSTANCE" \
  --project "$PROJECT_ID" \
  --zone "$ZONE" \
  --tags crm-backend

=======

# Ensure Docker is installed and run container on VM.
gcloud compute ssh "$INSTANCE" --project "$PROJECT_ID" --zone "$ZONE" --command "
  set -euo pipefail
  command -v docker >/dev/null 2>&1 || (sudo apt-get update && sudo apt-get install -y docker.io)
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo docker rm -f crm-backend || true
  sudo docker pull '$IMAGE_URI'

  sudo docker run -d --name crm-backend --restart unless-stopped \
    -p ${HOST_PORT}:${CONTAINER_PORT} \
    -e PORT=${CONTAINER_PORT} \
    -e DATABASE_URL='${DATABASE_URL}' \
    -e JWT_SECRET='${JWT_SECRET}' \
    -e STRIPE_SECRET_KEY='${STRIPE_SECRET_KEY}' \
    -e STRIPE_WEBHOOK_SECRET='${STRIPE_WEBHOOK_SECRET}' \
    -e GOOGLE_CLIENT_ID='${GOOGLE_CLIENT_ID}' \
    -e GOOGLE_CLIENT_SECRET='${GOOGLE_CLIENT_SECRET}' \
    -e GOOGLE_REDIRECT_URI='${GOOGLE_REDIRECT_URI}' \
    -e GCS_BUCKET='${GCS_BUCKET}' \
    -e CORS_ORIGIN='${CORS_ORIGIN}' \
    '$IMAGE_URI'
"

echo "Backend deployed to ${INSTANCE} (${ZONE})."
echo "Try: http://35.188.176.52/health"
=======
  sudo docker run -d --name crm-backend --restart unless-stopped -p 8080:8080 '$IMAGE_URI'
"

echo "Backend deployed to ${INSTANCE} (${ZONE})."
