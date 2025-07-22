#!/bin/bash

# Rollback script to revert to previous contract address
echo "🔄 Rolling back to previous contract address..."

# Check if backup file exists
if [ ! -f "contract-address.backup" ]; then
    echo "❌ No backup file found. Cannot rollback."
    exit 1
fi

# Read previous contract address
PREVIOUS_ADDRESS=$(cat contract-address.backup)
echo "📋 Rolling back to: $PREVIOUS_ADDRESS"

# Update frontend
cd voting-app

# Update .env
if [ -f ".env" ]; then
    sed -i '' "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$PREVIOUS_ADDRESS/" .env
fi

# Update contracts.ts
sed -i '' "s/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \".*\"/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \"$PREVIOUS_ADDRESS\"/" lib/contracts.ts

echo "✅ Rollback complete! Contract: $PREVIOUS_ADDRESS" 