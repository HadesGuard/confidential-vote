#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FHEVM_HARDHAT_DIR="$SCRIPT_DIR/fhevm-hardhat"
VOTING_APP_DIR="$SCRIPT_DIR/voting-app"

print_status "Starting automated deployment process..."
print_status "Script directory: $SCRIPT_DIR"
print_status "FHEVM Hardhat directory: $FHEVM_HARDHAT_DIR"
print_status "Voting App directory: $VOTING_APP_DIR"

# Check if directories exist
if [ ! -d "$FHEVM_HARDHAT_DIR" ]; then
    print_error "FHEVM Hardhat directory not found: $FHEVM_HARDHAT_DIR"
    exit 1
fi

if [ ! -d "$VOTING_APP_DIR" ]; then
    print_error "Voting App directory not found: $VOTING_APP_DIR"
    exit 1
fi

# Step 1: Compile contract
print_status "Step 1: Compiling contract..."
cd "$FHEVM_HARDHAT_DIR"

if ! npx hardhat compile; then
    print_error "Contract compilation failed"
    exit 1
fi
print_success "Contract compiled successfully"

# Step 2: Deploy contract
print_status "Step 2: Deploying contract to Sepolia..."
print_status "Using mnemonic from fhevm-hardhat/.env for deployment..."
DEPLOY_OUTPUT=$(npx hardhat run deploy/deploy-confidential-vote.ts --network sepolia 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    print_error "Contract deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

print_success "Contract deployed successfully"

# Extract contract address from deployment output
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "ConfidentialVoting deployed to:" | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    print_error "Could not extract contract address from deployment output"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

print_success "Contract address: $CONTRACT_ADDRESS"

# Step 3: Create backup of current contract address
print_status "Step 3: Creating backup of current contract address..."
cd "$VOTING_APP_DIR"

# Backup current contract address if .env exists
if [ -f ".env" ] && grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env; then
    CURRENT_ADDRESS=$(grep "NEXT_PUBLIC_CONTRACT_ADDRESS" .env | cut -d'=' -f2)
    echo "$CURRENT_ADDRESS" > "$SCRIPT_DIR/contract-address.backup"
    print_success "Backed up current contract address: $CURRENT_ADDRESS"
fi

# Step 4: Update frontend .env file
print_status "Step 4: Updating frontend .env file..."

# Check if .env file exists, if not create it
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating new one..."
    touch .env
fi

# Update or add NEXT_PUBLIC_CONTRACT_ADDRESS
if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" .env; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
    else
        # Linux
        sed -i "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
    fi
    print_success "Updated existing NEXT_PUBLIC_CONTRACT_ADDRESS in .env"
else
    # Add new line
    echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
    print_success "Added NEXT_PUBLIC_CONTRACT_ADDRESS to .env"
fi

# Step 5: Update contracts.ts file
print_status "Step 5: Updating contracts.ts file..."
CONTRACTS_FILE="$VOTING_APP_DIR/lib/contracts.ts"

if [ ! -f "$CONTRACTS_FILE" ]; then
    print_error "contracts.ts file not found: $CONTRACTS_FILE"
    exit 1
fi

# Update contract address in contracts.ts
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \".*\"/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \"$CONTRACT_ADDRESS\"/" "$CONTRACTS_FILE"
else
    # Linux
    sed -i "s/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \".*\"/CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || \"$CONTRACT_ADDRESS\"/" "$CONTRACTS_FILE"
fi

print_success "Updated contract address in contracts.ts"

# Step 6: Build frontend to verify everything works
print_status "Step 6: Building frontend to verify changes..."
if ! npm run build; then
    print_error "Frontend build failed"
    exit 1
fi
print_success "Frontend build completed successfully"

# Step 7: Summary
print_status "Step 7: Deployment Summary"
echo "=================================="
print_success "Contract deployed to: $CONTRACT_ADDRESS"
print_success ".env file updated with: NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
print_success "contracts.ts file updated"
print_success "Frontend build verified"
echo "=================================="

print_success "Deployment and update process completed successfully!"
print_status "You can now start the frontend with: npm run dev" 