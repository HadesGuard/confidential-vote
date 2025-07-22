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

print_status "🚀 Starting full deployment process..."
echo ""

# Step 0: Get mnemonic from user
print_status "Step 0: Getting deployment credentials..."
ENV_FILE="$SCRIPT_DIR/fhevm-hardhat/.env"

# Check if mnemonic is already set
if [ -f "$ENV_FILE" ]; then
    MNEMONIC_LINE=$(grep "^MNEMONIC=" "$ENV_FILE" | cut -d'=' -f2)
    if [ -n "$MNEMONIC_LINE" ] && [ "$MNEMONIC_LINE" != "" ]; then
        print_success "Mnemonic already configured in .env file"
    else
        print_warning "Mnemonic not found in .env file"
        echo ""
        echo -e "${YELLOW}Please enter your mnemonic phrase (12 or 24 words):${NC}"
        echo -e "${YELLOW}This will be used to deploy the contract to Sepolia testnet${NC}"
        echo -e "${YELLOW}Your mnemonic will be stored in fhevm-hardhat/.env${NC}"
        echo ""
        read -p "Mnemonic: " USER_MNEMONIC
        
        if [ -z "$USER_MNEMONIC" ]; then
            print_error "Mnemonic cannot be empty"
            exit 1
        fi
        
        # Update .env file with mnemonic
        if grep -q "^MNEMONIC=" "$ENV_FILE"; then
            # Replace existing MNEMONIC line
            sed -i '' "s/^MNEMONIC=.*/MNEMONIC=$USER_MNEMONIC/" "$ENV_FILE"
        else
            # Add MNEMONIC line if it doesn't exist
            echo "MNEMONIC=$USER_MNEMONIC" >> "$ENV_FILE"
        fi
        
        print_success "Mnemonic saved to .env file"
    fi
else
    print_error "fhevm-hardhat/.env file not found"
    exit 1
fi
echo ""

# Step 1: Check environment
print_status "Step 1: Checking environment setup..."
if ! ./setup-env.sh; then
    print_error "Environment setup failed"
    exit 1
fi
print_success "Environment check completed"
echo ""

# Step 2: Deploy contract and update frontend
print_status "Step 2: Deploying contract and updating frontend..."
if ! ./deploy-and-update.sh; then
    print_error "Deployment failed"
    exit 1
fi
print_success "Deployment completed"
echo ""

# Step 3: Final verification
print_status "Step 3: Final verification..."
echo "=================================="
print_success "✅ Environment configured"
print_success "✅ Contract deployed"
print_success "✅ Frontend updated"
print_success "✅ Build verified"
echo "=================================="

print_success "🎉 Full deployment process completed successfully!"
print_status "You can now start the frontend with: cd voting-app && npm run dev" 