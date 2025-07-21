import { useState, useEffect, useCallback } from 'react';
import { Proposal, EncryptedVote } from '../types/fhe';
import { contractService } from '../services/contractService';
import { fheService, VOTE_OPTIONS } from '../services/fheService';

export interface UseVotingReturn {
  // State
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  userAddress: string | null;
  userBalance: string;
  isWalletConnected: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  createProposal: (title: string, description: string) => Promise<void>;
  castVote: (proposalId: number, voteValue: number) => Promise<void>;
  makeVoteCountsPublic: (proposalId: number) => Promise<void>;
  refreshProposals: () => Promise<void>;
  hasUserVoted: (proposalId: number) => Promise<boolean>;
}

export const useVoting = (): UseVotingReturn => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState('0');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Initialize contract service
  useEffect(() => {
    const init = async () => {
      try {
        await contractService.initialize();
        await checkWalletConnection();
      } catch (err) {
        setError('Failed to initialize contract service');
        console.error(err);
      }
    };
    init();
  }, []);

  // Check wallet connection
  const checkWalletConnection = useCallback(async () => {
    try {
      const connected = await contractService.isWalletConnected();
      setIsWalletConnected(connected);
      
      if (connected) {
        const address = await contractService.getUserAddress();
        const balance = await contractService.getUserBalance();
        setUserAddress(address);
        setUserBalance(balance);
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await contractService.connectWallet();
      await checkWalletConnection();
      await refreshProposals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [checkWalletConnection]);

  // Refresh proposals
  const refreshProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allProposals = await contractService.getAllProposals();
      setProposals(allProposals);
    } catch (err) {
      setError('Failed to load proposals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create proposal
  const createProposal = useCallback(async (title: string, description: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await contractService.createProposal(title, description);
      await refreshProposals();
    } catch (err) {
      setError('Failed to create proposal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refreshProposals]);

  // Cast vote
  const castVote = useCallback(async (proposalId: number, voteValue: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate vote value
      if (voteValue !== VOTE_OPTIONS.YES && voteValue !== VOTE_OPTIONS.NO) {
        throw new Error('Invalid vote value');
      }

      // Check if user has already voted
      const hasVoted = await contractService.hasUserVoted(userAddress!, proposalId);
      if (hasVoted) {
        throw new Error('You have already voted on this proposal');
      }

      // Encrypt vote
      const encryptedVote = await fheService.encrypt(voteValue);
      
      // Generate proof
      const proof = await fheService.generateProof(encryptedVote);
      
      // Cast vote on contract
      await contractService.castVote(proposalId, encryptedVote, proof);
      
      console.log('Vote cast successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Make vote counts public
  const makeVoteCountsPublic = useCallback(async (proposalId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await contractService.makeVoteCountsPublic(proposalId);
      await refreshProposals();
    } catch (err) {
      setError('Failed to make vote counts public');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refreshProposals]);

  // Check if user has voted
  const hasUserVoted = useCallback(async (proposalId: number): Promise<boolean> => {
    if (!userAddress) return false;
    
    try {
      return await contractService.hasUserVoted(userAddress, proposalId);
    } catch (err) {
      console.error('Failed to check if user voted:', err);
      return false;
    }
  }, [userAddress]);

  // Load proposals on mount
  useEffect(() => {
    if (isWalletConnected) {
      refreshProposals();
    }
  }, [isWalletConnected, refreshProposals]);

  return {
    // State
    proposals,
    loading,
    error,
    userAddress,
    userBalance,
    isWalletConnected,
    
    // Actions
    connectWallet,
    createProposal,
    castVote,
    makeVoteCountsPublic,
    refreshProposals,
    hasUserVoted,
  };
}; 