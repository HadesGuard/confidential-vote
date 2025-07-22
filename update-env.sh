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

print_status "Updating fhevm-hardhat/.env file..."

# Check if fhevm-hardhat directory exists
if [ ! -d "$FHEVM_HARDHAT_DIR" ]; then
    print_error "fhevm-hardhat directory not found: $FHEVM_HARDHAT_DIR"
    exit 1
fi

# Create or update .env file
ENV_FILE="$FHEVM_HARDHAT_DIR/.env"

print_status "Creating/updating .env file with specified configuration..."

# Create the .env file with the specified content
cat > "$ENV_FILE" << EOF
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
MNEMONIC=
EOF

print_success "Updated fhevm-hardhat/.env file"

# Show the content
print_status "Current .env content:"
echo "=================================="
cat "$ENV_FILE"
echo "=================================="

print_warning "Please add your MNEMONIC phrase to the MNEMONIC= line"
print_success "Environment file updated successfully!" 