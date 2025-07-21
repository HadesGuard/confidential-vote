# 🔐 Confidential Voting Frontend

A React-based frontend for the Confidential Voting System using Fully Homomorphic Encryption (FHE) with Zama Protocol.

## 🚀 Features

- **🔐 FHE-Encrypted Voting**: Votes are encrypted using Fully Homomorphic Encryption
- **👛 Wallet Integration**: MetaMask integration for secure transactions
- **📋 Proposal Management**: Create and manage voting proposals
- **🗳️ Anonymous Voting**: Vote anonymously with encrypted ballots
- **📊 Result Revelation**: Make vote counts public when ready
- **🎨 Modern UI**: Beautiful, responsive interface
- **📱 Mobile Friendly**: Works on all devices

## 🏗️ Architecture

### Frontend Stack
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Ethers.js**: Ethereum interaction
- **FHE Integration**: Mock FHE service (ready for Zama Relayer SDK)

### Key Components
- **VotingInterface**: Main voting interface
- **ContractService**: Smart contract interaction
- **FHEService**: FHE encryption/decryption (mock)
- **useVoting**: React hooks for voting logic

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- MetaMask browser extension
- Hardhat node running (for local development)

### Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
# REACT_APP_NETWORK=hardhat
# REACT_APP_CONTRACT_ADDRESS=your_contract_address
# REACT_APP_SEPOLIA_RPC_URL=your_sepolia_rpc_url

# Start development server
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Network Configuration
REACT_APP_NETWORK=hardhat
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# RPC URLs
REACT_APP_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Zama Relayer Configuration (for future use)
REACT_APP_ZAMA_RELAYER_URL=https://relayer.zama.ai
REACT_APP_ZAMA_API_KEY=your_zama_api_key_here

# Development Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info
```

### Network Configuration

| Network | Description | Use Case |
|---------|-------------|----------|
| `hardhat` | Local development | Testing with mock FHE |
| `localhost` | Hardhat node | Persistent local testing |
| `sepolia` | Sepolia testnet | Real FHE with Zama Protocol |

## 🎯 Usage

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- View your address and balance

### 2. Create Proposal
- Click "➕ Create New Proposal"
- Enter title and description
- Submit transaction

### 3. Vote on Proposal
- View active proposals
- Click "👍 Yes" or "👎 No"
- Vote is encrypted and submitted

### 4. Reveal Results
- Click "📊 Make Results Public"
- Vote counts become visible
- Results are decrypted

## 🔐 FHE Integration

### Current Implementation
- **Mock FHE Service**: Simulates encryption/decryption
- **Base64 Encoding**: Temporary encryption method
- **Proof Generation**: Mock cryptographic proofs

### Future Integration
- **Zama Relayer SDK**: Real FHE operations
- **TFHE-rs**: Full homomorphic encryption
- **Cryptographic Proofs**: Real zero-knowledge proofs

### FHE Flow
1. **Vote Encryption**: User vote is encrypted client-side
2. **Proof Generation**: Cryptographic proof of valid vote
3. **Contract Submission**: Encrypted vote + proof sent to contract
4. **Aggregation**: Contract aggregates encrypted votes
5. **Result Revelation**: Encrypted results made public
6. **Decryption**: Results decrypted using FHE

## 📁 Project Structure

```
src/
├── components/
│   ├── VotingInterface.tsx    # Main voting interface
│   └── VotingInterface.css    # Interface styles
├── hooks/
│   └── useVoting.ts           # Voting logic hooks
├── services/
│   ├── contractService.ts     # Smart contract interaction
│   └── fheService.ts          # FHE encryption/decryption
├── types/
│   └── fhe.ts                 # TypeScript types
├── config/
│   └── app.ts                 # App configuration
└── App.tsx                    # Main app component
```

## 🧪 Testing

### Development Testing
```bash
# Start Hardhat node (in another terminal)
cd ../fhevm-hardhat
npx hardhat node

# Deploy contract
npm run deploy:localhost

# Update .env with contract address
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address

# Start frontend
npm start
```

### Production Testing
```bash
# Deploy to Sepolia
cd ../fhevm-hardhat
npm run deploy:sepolia

# Update .env
REACT_APP_NETWORK=sepolia
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address

# Start frontend
npm start
```

## 🔒 Security Features

- **🔐 Vote Encryption**: All votes encrypted with FHE
- **👤 Anonymity**: Voter identity protected
- **✅ Vote Validation**: Cryptographic proof verification
- **🛡️ Contract Security**: OpenZeppelin security patterns
- **🔑 Wallet Security**: MetaMask integration

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
```bash
# Build the project
npm run build

# Deploy build folder to your hosting service
```

### Environment Setup for Production
```bash
# Set production environment variables
REACT_APP_NETWORK=sepolia
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract
REACT_APP_SEPOLIA_RPC_URL=your_rpc_url
```

## 🔧 Development

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run eject      # Eject from Create React App
```

### Adding New Features
1. **New Components**: Add to `src/components/`
2. **New Services**: Add to `src/services/`
3. **New Hooks**: Add to `src/hooks/`
4. **New Types**: Add to `src/types/`

### FHE Service Extension
To integrate real FHE:
1. Replace mock functions in `fheService.ts`
2. Integrate Zama Relayer SDK
3. Update encryption/decryption logic
4. Add real cryptographic proofs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Smart Contract**: [fhevm-hardhat](../fhevm-hardhat/)
- **Zama Protocol**: [https://zama.ai](https://zama.ai)
- **FHE Documentation**: [https://docs.zama.ai](https://docs.zama.ai)

---

*Built with ❤️ for secure, confidential voting*
