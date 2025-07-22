#!/bin/bash

# Quick deployment script
echo "🚀 Deploying contract and updating frontend..."

# Deploy contract
cd fhevm-hardhat
npx hardhat compile
DEPLOY_OUTPUT=$(npx hardhat run deploy/deploy-confidential-vote.ts --network sepolia)
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "ConfidentialVoting deployed to:" | awk '{print $4}')

echo "✅ Contract deployed to: $CONTRACT_ADDRESS"

# Update frontend
cd ../voting-app

# Update .env
if [ ! -f ".env" ]; then
    touch .env
fi

if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env; then
    sed -i '' "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
else
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
fi

# Update contracts.ts
sed -i '' "s/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \".*\"/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \"$CONTRACT_ADDRESS\"/" lib/contracts.ts

echo "✅ Frontend updated"
echo "🎉 Deployment complete! Contract: $CONTRACT_ADDRESS" 