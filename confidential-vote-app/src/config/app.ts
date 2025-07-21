import { AppConfig } from '../types/fhe';

export const appConfig: AppConfig = {
  networks: {
    hardhat: {
      chainId: 31337,
      rpcUrl: 'http://localhost:8545',
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
      explorerUrl: 'http://localhost:8545',
    },
    localhost: {
      chainId: 31337,
      rpcUrl: 'http://localhost:8545',
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Will be updated after deployment
      explorerUrl: 'http://localhost:8545',
    },
    sepolia: {
      chainId: 11155111,
      rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '', // Will be updated after deployment
      explorerUrl: 'https://sepolia.etherscan.io',
    },
  },
  defaultNetwork: 'hardhat',
};

// Get current network configuration
export const getCurrentNetwork = (): AppConfig['networks'][keyof AppConfig['networks']] => {
  const networkName = process.env.REACT_APP_NETWORK || appConfig.defaultNetwork;
  return appConfig.networks[networkName as keyof AppConfig['networks']];
};

// Environment variables
export const ENV = {
  NETWORK: process.env.REACT_APP_NETWORK || 'hardhat',
  CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS || '',
  SEPOLIA_RPC_URL: process.env.REACT_APP_SEPOLIA_RPC_URL || '',
  ZAMA_RELAYER_URL: process.env.REACT_APP_ZAMA_RELAYER_URL || '',
  ZAMA_API_KEY: process.env.REACT_APP_ZAMA_API_KEY || '',
};

// Vote options
export const VOTE_OPTIONS = {
  YES: 0,
  NO: 1,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_TITLE_LENGTH: 3,
  MIN_DESCRIPTION_LENGTH: 10,
  VOTING_PERIOD_DAYS: 7,
  RESULTS_REVEAL_DELAY_HOURS: 24,
}; 