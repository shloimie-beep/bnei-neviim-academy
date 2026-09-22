#!/bin/bash
# Railway project-token health check.

set -euo pipefail

echo "=== Railway Token Audit ==="

TOKEN_FILE=".secrets/railway-token.txt"
SERVICE="${RAILWAY_SERVICE_NAME:-skillful-motivation}"
ENVIRONMENT="${RAILWAY_ENVIRONMENT:-production}"

if [ -f "$TOKEN_FILE" ]; then
  echo "OK token file exists"
  export RAILWAY_TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")"
else
  echo "ERROR token file missing at $TOKEN_FILE"
  echo "Add a Railway project token there, or run railway login for account auth."
  exit 1
fi

if [ -d ".railway" ]; then
  echo "OK repo has .railway directory"
else
  echo "NOTE no .railway directory found; project token mode can still work, but commands must specify service/environment."
fi

echo ""
echo "Testing project token against Railway..."
railway status >/dev/null
echo "OK token can read the Railway project"

railway service status --service "$SERVICE" --environment "$ENVIRONMENT" >/dev/null
echo "OK service target works: $SERVICE / $ENVIRONMENT"
