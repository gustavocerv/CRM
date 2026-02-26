#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"
SQL_INSTANCE="${SQL_INSTANCE:-crm-sql}"
DB_NAME="${DB_NAME:-crm_db}"
DB_USER="${DB_USER:-crm_user}"
BUCKET="${BUCKET:-${PROJECT_ID}-crm-uploads}"


gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com sqladmin.googleapis.com iam.googleapis.com gmail.googleapis.com storage.googleapis.com secretmanager.googleapis.com

gcloud sql instances create "$SQL_INSTANCE" \
  --database-version=POSTGRES_15 \
  --cpu=2 --memory=8GiB \
  --region="$REGION"

gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE"
gcloud sql users create "$DB_USER" --instance="$SQL_INSTANCE" --password="change-me"

gcloud storage buckets create "gs://${BUCKET}" --location="$REGION" --uniform-bucket-level-access

gcloud iam service-accounts create crm-backend-sa --display-name="CRM Backend Service Account"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:crm-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:crm-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:crm-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

echo "Setup complete. Configure OAuth, Stripe, and secrets next."
