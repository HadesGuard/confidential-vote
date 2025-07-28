// Contract configuration for Confidential Voting
// Similar to zpool-fe structure

// Contract addresses (Sepolia deployment)
export const CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x8ea7A2098de5F4EB3d2804fD242Ce9BF561e5AC4";

// Import ABI from compiled contract
import contractABI from './ConfidentialVotingABI.json';
export const CONFIDENTIAL_VOTING_ABI = contractABI.abi; 