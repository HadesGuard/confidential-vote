# Confidential Voting - Deployment Scripts

Automated scripts for deploying the Confidential Voting contract and updating the frontend configuration.

## 🚀 Quick Start

### Full Deployment (Recommended)
```bash
./deploy-full.sh
```

### Individual Scripts

#### 1. Environment Setup
```bash
./setup-env.sh
```
- ✅ Checks and creates `.env` files
- ✅ Validates configuration
- ✅ Shows current status

#### 2. Deploy Contract & Update Frontend
```bash
./deploy-and-update.sh
```
- ✅ Compiles contract
- ✅ Deploys to Sepolia
- ✅ Creates backup
- ✅ Updates frontend files
- ✅ Verifies build

#### 3. Quick Deploy
```bash
./deploy.sh
```
- ✅ Fast deployment for development
- ✅ Minimal output

#### 4. Rollback
```bash
./rollback.sh
```
- ✅ Reverts to previous contract
- ✅ Requires backup file

## 📁 Scripts Overview

| Script | Purpose | Features |
|--------|---------|----------|
| `deploy-full.sh` | Complete deployment | Environment check + deploy + verify |
| `setup-env.sh` | Environment setup | Check/create .env files |
| `deploy-and-update.sh` | Full deployment | Compile, deploy, backup, update |
| `deploy.sh` | Quick deployment | Fast deploy for dev |
| `rollback.sh` | Rollback | Revert to previous contract |

## 🔧 Prerequisites

1. **Node.js & npm** installed
2. **Dependencies** installed in both directories:
   ```bash
   cd fhevm-hardhat && npm install
   cd voting-app && npm install
   ```
3. **Environment variables** configured (see below)

## 📋 Environment Configuration

### fhevm-hardhat/.env
```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
MNEMONIC=your_mnemonic_phrase_here
```

### voting-app/.env
```bash
# Voting App Environment Variables

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Auto-generated

# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Development Configuration
NODE_ENV=development
```

## 🎯 Deployment Process

### Automated Flow
```
1. Check Environment → 2. Compile Contract → 3. Deploy to Sepolia → 
4. Backup Address → 5. Update .env → 6. Update contracts.ts → 
7. Build Frontend → 8. Verify Success
```

### Manual Steps (if needed)
```bash
# 1. Compile
cd fhevm-hardhat
npx hardhat compile

# 2. Deploy
npx hardhat run deploy/deploy-confidential-vote.ts --network sepolia

# 3. Update frontend
cd ../voting-app
# Update .env and contracts.ts manually
npm run build
```

## 📊 Current Status

### Environment Status
- ✅ **fhevm-hardhat/.env**: Configured with MNEMONIC
- ✅ **voting-app/.env**: Configured with contract address
- ✅ **SEPOLIA_RPC_URL**: Set
- ✅ **Authentication**: MNEMONIC configured

### Contract Status
- **Current Address**: `0xFFF82723DbF6e060FE6663D6194cCB5F77471791`
- **Network**: Sepolia Testnet
- **Status**: Deployed and verified

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x *.sh
   ```

2. **Environment Missing**
   ```bash
   ./setup-env.sh
   ```

3. **Deployment Failed**
   - Check ETH balance
   - Verify RPC URL
   - Check private key/mnemonic

4. **Build Failed**
   - Check TypeScript errors
   - Verify contract address format
   - Ensure dependencies installed

### Rollback Process
```bash
# Check backup exists
ls contract-address.backup

# Rollback
./rollback.sh
```

## 🔒 Security Notes

- ⚠️ **Never commit private keys**
- ⚠️ **Use testnet keys only**
- ✅ **Scripts create backups automatically**
- ✅ **Rollback capability available**

## 📈 Usage Examples

### Development Workflow
```bash
# 1. Make changes to contract
# 2. Deploy quickly
./deploy.sh

# 3. Test changes
cd voting-app && npm run dev
```

### Production Deployment
```bash
# 1. Full deployment with verification
./deploy-full.sh

# 2. Verify everything works
cd voting-app && npm run build
```

### Emergency Rollback
```bash
# If new deployment has issues
./rollback.sh
```

## 📞 Support

If you encounter issues:

1. **Check script output** for error messages
2. **Verify prerequisites** are met
3. **Check network connectivity**
4. **Ensure sufficient ETH balance**

## 🎉 Success Indicators

After successful deployment:
- ✅ Contract deployed to Sepolia
- ✅ Frontend .env updated
- ✅ contracts.ts updated
- ✅ Build passes without errors
- ✅ Backup file created

Ready to use! 🚀 