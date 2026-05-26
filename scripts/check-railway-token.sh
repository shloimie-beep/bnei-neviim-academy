#!/bin/bash
# Railway Token Health Check

echo "=== Railway Token Audit ==="

TOKEN_FILE=".secrets/railway-token.txt"
CONFIG_FILE="$HOME/.railway/config.json"

# Check if token file exists
if [ -f "$TOKEN_FILE" ]; then
    echo "✓ Token file exists"
    TOKEN=$(cat "$TOKEN_FILE")
    echo "Token: ${TOKEN:0:8}...${TOKEN: -4}"
else
    echo "✗ Token file missing at $TOKEN_FILE"
fi

# Check if project is linked
if [ -d ".railway" ]; then
    echo "✓ Project has .railway directory"
else
    echo "✗ Project not linked to Railway"
fi

# Check if BNA is in global config
if grep -q "BNA v2.0" "$CONFIG_FILE" 2>/dev/null; then
    echo "✓ BNA project found in Railway config"
else
    echo "✗ BNA project NOT in Railway config"
fi

# Test token validity
echo ""
echo "Testing token validity..."
export RAILWAY_TOKEN=$(cat "$TOKEN_FILE" 2>/dev/null)
if railway status 2>&1 | grep -q "Project"; then
    echo "✓ Token is VALID"
else
    echo "✗ Token is INVALID or EXPIRED"
    echo ""
    echo "To fix:"
    echo "1. Run: railway login"
    echo "2. Then: cat ~/.railway/config.json | grep token"
    echo "3. Save token to: $TOKEN_FILE"
fi
