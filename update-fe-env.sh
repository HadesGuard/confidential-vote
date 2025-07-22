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
VOTING_APP_DIR="$SCRIPT_DIR/voting-app"

print_status "Updating voting-app/.env file..."

# Check if voting-app directory exists
if [ ! -d "$VOTING_APP_DIR" ]; then
    print_error "voting-app directory not found: $VOTING_APP_DIR"
    exit 1
fi

# Create or update .env file
ENV_FILE="$VOTING_APP_DIR/.env"

print_status "Creating/updating .env file with specified configuration..."

# Create the .env file with the specified content
cat > "$ENV_FILE" << EOF
# Voting App Environment Variables

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Development Configuration
NODE_ENV=development
EOF

print_success "Updated voting-app/.env file"

# Show the content
print_status "Current .env content:"
echo "=================================="
cat "$ENV_FILE"
echo "=================================="

print_warning "Please add your contract address to the NEXT_PUBLIC_CONTRACT_ADDRESS= line"
print_success "Frontend environment file updated successfully!" 