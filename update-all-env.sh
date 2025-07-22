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

print_status "Updating all environment files..."

# Update fhevm-hardhat/.env
print_status "Updating fhevm-hardhat/.env..."
if [ -f "$SCRIPT_DIR/update-env.sh" ]; then
    ./update-env.sh
else
    print_error "update-env.sh not found"
    exit 1
fi

echo ""

# Update voting-app/.env
print_status "Updating voting-app/.env..."
if [ -f "$SCRIPT_DIR/update-fe-env.sh" ]; then
    ./update-fe-env.sh
else
    print_error "update-fe-env.sh not found"
    exit 1
fi

echo ""

# Show final status
print_status "Final environment status:"
./setup-env.sh

echo ""
print_success "All environment files updated successfully!"
print_warning "Remember to add your MNEMONIC phrase and contract address!" 