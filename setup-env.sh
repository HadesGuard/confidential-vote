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

print_status "Setting up environment files..."

# Check and setup fhevm-hardhat/.env
print_status "Checking fhevm-hardhat/.env..."
if [ ! -f "$FHEVM_HARDHAT_DIR/.env" ]; then
    print_warning "fhevm-hardhat/.env not found, creating from example..."
    if [ -f "$FHEVM_HARDHAT_DIR/.env.example" ]; then
        cp "$FHEVM_HARDHAT_DIR/.env.example" "$FHEVM_HARDHAT_DIR/.env"
        print_success "Created fhevm-hardhat/.env from example"
    else
        print_error "No .env.example found in fhevm-hardhat directory"
        print_status "Please create fhevm-hardhat/.env manually with:"
        echo "SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com"
        echo "MNEMONIC=your_mnemonic_phrase_here"
    fi
else
    print_success "fhevm-hardhat/.env exists"
    
    # Check if required variables are set
    if grep -q "SEPOLIA_RPC_URL" "$FHEVM_HARDHAT_DIR/.env"; then
        print_success "SEPOLIA_RPC_URL is configured"
    else
        print_warning "SEPOLIA_RPC_URL not found in fhevm-hardhat/.env"
    fi
    
    if grep -q "PRIVATE_KEY\|MNEMONIC" "$FHEVM_HARDHAT_DIR/.env"; then
        print_success "Authentication method is configured"
    else
        print_warning "Neither PRIVATE_KEY nor MNEMONIC found in fhevm-hardhat/.env"
    fi
fi

# Check and setup voting-app/.env
print_status "Checking voting-app/.env..."
if [ ! -f "$VOTING_APP_DIR/.env" ]; then
    print_warning "voting-app/.env not found, creating from example..."
    if [ -f "$VOTING_APP_DIR/.env.example" ]; then
        cp "$VOTING_APP_DIR/.env.example" "$VOTING_APP_DIR/.env"
        print_success "Created voting-app/.env from example"
    else
        print_error "No .env.example found in voting-app directory"
        print_status "Please create voting-app/.env manually with:"
        echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..."
        echo "NEXT_PUBLIC_NETWORK=sepolia"
        echo "NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com"
    fi
else
    print_success "voting-app/.env exists"
    
    # Check if required variables are set
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" "$VOTING_APP_DIR/.env"; then
        CONTRACT_ADDRESS=$(grep "NEXT_PUBLIC_CONTRACT_ADDRESS" "$VOTING_APP_DIR/.env" | cut -d'=' -f2)
        if [ -z "$CONTRACT_ADDRESS" ]; then
            print_warning "NEXT_PUBLIC_CONTRACT_ADDRESS is empty in voting-app/.env"
        else
            print_success "NEXT_PUBLIC_CONTRACT_ADDRESS is configured"
        fi
    else
        print_warning "NEXT_PUBLIC_CONTRACT_ADDRESS not found in voting-app/.env"
    fi
    
    if grep -q "NEXT_PUBLIC_NETWORK" "$VOTING_APP_DIR/.env"; then
        print_success "NEXT_PUBLIC_NETWORK is configured"
    else
        print_warning "NEXT_PUBLIC_NETWORK not found in voting-app/.env"
    fi
fi

# Show current environment status
print_status "Current environment status:"
echo "=================================="

echo "fhevm-hardhat/.env:"
if [ -f "$FHEVM_HARDHAT_DIR/.env" ]; then
    echo "  ✅ File exists"
    if grep -q "SEPOLIA_RPC_URL" "$FHEVM_HARDHAT_DIR/.env"; then
        echo "  ✅ SEPOLIA_RPC_URL configured"
    else
        echo "  ❌ SEPOLIA_RPC_URL missing"
    fi
    if grep -q "PRIVATE_KEY\|MNEMONIC" "$FHEVM_HARDHAT_DIR/.env"; then
        echo "  ✅ Authentication configured"
    else
        echo "  ❌ Authentication missing"
    fi
else
    echo "  ❌ File missing"
fi

echo ""
echo "voting-app/.env:"
if [ -f "$VOTING_APP_DIR/.env" ]; then
    echo "  ✅ File exists"
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS" "$VOTING_APP_DIR/.env"; then
        CONTRACT_ADDRESS=$(grep "NEXT_PUBLIC_CONTRACT_ADDRESS" "$VOTING_APP_DIR/.env" | cut -d'=' -f2)
        if [ -z "$CONTRACT_ADDRESS" ]; then
            echo "  ⚠️ Contract address: (empty - needs to be set)"
        else
            echo "  ✅ Contract address: $CONTRACT_ADDRESS"
        fi
    else
        echo "  ❌ Contract address missing"
    fi
    if grep -q "NEXT_PUBLIC_NETWORK" "$VOTING_APP_DIR/.env"; then
        echo "  ✅ Network configured"
    else
        echo "  ❌ Network missing"
    fi
else
    echo "  ❌ File missing"
fi

echo "=================================="

print_success "Environment setup check completed!"
print_status "If any issues are found, please update the .env files manually." 