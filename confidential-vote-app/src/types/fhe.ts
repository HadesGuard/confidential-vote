// FHE Types for Confidential Voting
export interface EncryptedVote {
  encryptedValue: string;
  proof: string;
}

export interface VoteOption {
  YES: 0;
  NO: 1;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  isActive: boolean;
  createdAt: number;
}

export interface VoteCounts {
  yesCount: string;
  noCount: string;
  isPublic: boolean;
}

export interface UserVote {
  proposalId: number;
  hasVoted: boolean;
  vote?: EncryptedVote;
}

// Contract ABI types
export interface ConfidentialVotingContract {
  proposalCount(): Promise<number>;
  proposals(id: number): Promise<Proposal>;
  voteCounts(id: number): Promise<VoteCounts>;
  userVotes(user: string, proposalId: number): Promise<boolean>;
  
  createProposal(title: string, description: string): Promise<void>;
  vote(proposalId: number, encryptedVote: EncryptedVote, proof: string): Promise<void>;
  makeVoteCountsPublic(proposalId: number): Promise<void>;
  getPublicVoteCounts(proposalId: number): Promise<[string, string, boolean]>;
}

// FHE Encryption/Decryption types
export interface FHEEncryption {
  encrypt(value: number): Promise<EncryptedVote>;
  decrypt(encryptedValue: string): Promise<number>;
  generateProof(encryptedVote: EncryptedVote): Promise<string>;
}

// Network configuration
export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  explorerUrl: string;
}

// Environment configuration
export interface AppConfig {
  networks: {
    hardhat: NetworkConfig;
    sepolia: NetworkConfig;
    localhost: NetworkConfig;
  };
  defaultNetwork: keyof AppConfig['networks'];
} 