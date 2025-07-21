import { ethers } from 'ethers';
import { 
  ConfidentialVotingContract, 
  Proposal, 
  VoteCounts, 
  EncryptedVote 
} from '../types/fhe';
import { getCurrentNetwork } from '../config/app';

// Contract ABI - This should match the actual contract ABI
const CONTRACT_ABI = [
  // View functions
  "function proposalCount() view returns (uint256)",
  "function proposals(uint256) view returns (string title, string description, address creator, bool isActive, uint256 createdAt)",
  "function voteCounts(uint256) view returns (bytes yesCount, bytes noCount, bool isPublic)",
  "function userVotes(address, uint256) view returns (bool)",
  "function getPublicVoteCounts(uint256) view returns (uint256 yesCount, uint256 noCount, bool isPublic)",
  
  // State changing functions
  "function createProposal(string title, string description)",
  "function vote(uint256 proposalId, bytes encryptedVote, bytes proof)",
  "function makeVoteCountsPublic(uint256 proposalId)",
  
  // Events
  "event ProposalCreated(uint256 indexed proposalId, string title, address indexed creator)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter)",
  "event VoteCountsMadePublic(uint256 indexed proposalId)",
];

export class ContractService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private network = getCurrentNetwork();

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      } else {
        // Fallback to JSON RPC provider
        this.provider = new ethers.JsonRpcProvider(this.network.rpcUrl);
      }

      // Initialize contract
      if (this.network.contractAddress) {
        this.contract = new ethers.Contract(
          this.network.contractAddress,
          CONTRACT_ABI,
          this.signer || this.provider
        );
      }

      console.log('Contract service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      throw error;
    }
  }

  // Get contract instance
  getContract(): ethers.Contract | null {
    return this.contract;
  }

  // Get provider
  getProvider(): ethers.Provider | null {
    return this.provider;
  }

  // Get signer
  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  // Get current network
  getNetwork() {
    return this.network;
  }

  // Check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    return this.signer !== null;
  }

  // Connect wallet
  async connectWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        if (this.network.contractAddress) {
          this.contract = new ethers.Contract(
            this.network.contractAddress,
            CONTRACT_ABI,
            this.signer
          );
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask is not installed');
    }
  }

  // Get proposal count
  async getProposalCount(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const count = await this.contract.proposalCount();
      return Number(count);
    } catch (error) {
      console.error('Failed to get proposal count:', error);
      throw error;
    }
  }

  // Get proposal by ID
  async getProposal(id: number): Promise<Proposal> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const proposal = await this.contract.proposals(id);
      return {
        id,
        title: proposal.title,
        description: proposal.description,
        creator: proposal.creator,
        isActive: proposal.isActive,
        createdAt: Number(proposal.createdAt),
      };
    } catch (error) {
      console.error(`Failed to get proposal ${id}:`, error);
      throw error;
    }
  }

  // Get all proposals
  async getAllProposals(): Promise<Proposal[]> {
    try {
      const count = await this.getProposalCount();
      const proposals: Proposal[] = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const proposal = await this.getProposal(i);
          proposals.push(proposal);
        } catch (error) {
          console.warn(`Failed to get proposal ${i}:`, error);
        }
      }
      
      return proposals;
    } catch (error) {
      console.error('Failed to get all proposals:', error);
      throw error;
    }
  }

  // Get vote counts for a proposal
  async getVoteCounts(proposalId: number): Promise<VoteCounts> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const voteCounts = await this.contract.voteCounts(proposalId);
      return {
        yesCount: voteCounts.yesCount,
        noCount: voteCounts.noCount,
        isPublic: voteCounts.isPublic,
      };
    } catch (error) {
      console.error(`Failed to get vote counts for proposal ${proposalId}:`, error);
      throw error;
    }
  }

  // Check if user has voted
  async hasUserVoted(userAddress: string, proposalId: number): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.userVotes(userAddress, proposalId);
    } catch (error) {
      console.error(`Failed to check if user voted for proposal ${proposalId}:`, error);
      throw error;
    }
  }

  // Create a new proposal
  async createProposal(title: string, description: string): Promise<void> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const tx = await this.contract.createProposal(title, description);
      await tx.wait();
      console.log('Proposal created successfully');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    }
  }

  // Cast a vote
  async castVote(proposalId: number, encryptedVote: EncryptedVote, proof: string): Promise<void> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const tx = await this.contract.vote(proposalId, encryptedVote.encryptedValue, proof);
      await tx.wait();
      console.log('Vote cast successfully');
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    }
  }

  // Make vote counts public
  async makeVoteCountsPublic(proposalId: number): Promise<void> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const tx = await this.contract.makeVoteCountsPublic(proposalId);
      await tx.wait();
      console.log('Vote counts made public successfully');
    } catch (error) {
      console.error('Failed to make vote counts public:', error);
      throw error;
    }
  }

  // Get public vote counts
  async getPublicVoteCounts(proposalId: number): Promise<[string, string, boolean]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.getPublicVoteCounts(proposalId);
    } catch (error) {
      console.error(`Failed to get public vote counts for proposal ${proposalId}:`, error);
      throw error;
    }
  }

  // Get user address
  async getUserAddress(): Promise<string | null> {
    if (!this.signer) return null;
    
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get user address:', error);
      return null;
    }
  }

  // Get user balance
  async getUserBalance(): Promise<string> {
    if (!this.signer || !this.provider) return '0';
    
    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return '0';
    }
  }
}

// Singleton instance
export const contractService = new ContractService(); 