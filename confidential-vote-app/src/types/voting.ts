export interface Vote {
  id: string;
  encryptedVote: string;
  timestamp: number;
  voterAddress: string;
  electionId: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  candidates: Candidate[];
  isActive: boolean;
  totalVotes: number;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  encryptedVoteCount: string;
}

export interface Voter {
  address: string;
  hasVoted: boolean;
  voteHash: string;
}

export interface EncryptedVoteData {
  encryptedVote: string;
  proof: string;
  publicKey: string;
}

export interface VoteResult {
  candidateId: string;
  candidateName: string;
  voteCount: number;
  percentage: number;
}

export interface FHEKeyPair {
  publicKey: string;
  privateKey: string;
} 