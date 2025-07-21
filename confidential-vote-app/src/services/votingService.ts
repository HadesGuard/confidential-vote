import { Election, Vote, Candidate, VoteResult, EncryptedVoteData } from '../types/voting';
import { FHEUtils } from '../utils/fhe';

export class VotingService {
  private static instance: VotingService;
  private elections: Map<string, Election> = new Map();
  private votes: Map<string, Vote[]> = new Map();
  private keyPair = FHEUtils.generateKeyPair();

  private constructor() {
    this.initializeSampleElections();
  }

  static getInstance(): VotingService {
    if (!VotingService.instance) {
      VotingService.instance = new VotingService();
    }
    return VotingService.instance;
  }

  private initializeSampleElections(): void {
    const sampleElection: Election = {
      id: '1',
      title: 'Presidential Election 2024',
      description: 'Vote for the next president of the country',
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      candidates: [
        {
          id: '1',
          name: 'John Doe',
          description: 'Progressive Party',
          encryptedVoteCount: FHEUtils.encryptVote(0, this.keyPair.publicKey)
        },
        {
          id: '2',
          name: 'Jane Smith',
          description: 'Conservative Party',
          encryptedVoteCount: FHEUtils.encryptVote(0, this.keyPair.publicKey)
        },
        {
          id: '3',
          name: 'Bob Johnson',
          description: 'Independent',
          encryptedVoteCount: FHEUtils.encryptVote(0, this.keyPair.publicKey)
        }
      ],
      isActive: true,
      totalVotes: 0
    };

    this.elections.set(sampleElection.id, sampleElection);
    this.votes.set(sampleElection.id, []);
  }

  async createElection(election: Omit<Election, 'id'>): Promise<Election> {
    const newElection: Election = {
      ...election,
      id: Date.now().toString(),
      candidates: election.candidates.map(candidate => ({
        ...candidate,
        encryptedVoteCount: FHEUtils.encryptVote(0, this.keyPair.publicKey)
      }))
    };

    this.elections.set(newElection.id, newElection);
    this.votes.set(newElection.id, []);
    return newElection;
  }

  async getElections(): Promise<Election[]> {
    return Array.from(this.elections.values());
  }

  async getElection(id: string): Promise<Election | null> {
    return this.elections.get(id) || null;
  }

  async castVote(
    electionId: string,
    candidateId: string,
    voterAddress: string
  ): Promise<EncryptedVoteData> {
    const election = this.elections.get(electionId);
    if (!election) {
      throw new Error('Election not found');
    }

    if (!election.isActive) {
      throw new Error('Election is not active');
    }

    const candidate = election.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Check if voter has already voted
    const existingVotes = this.votes.get(electionId) || [];
    const hasVoted = existingVotes.some(vote => vote.voterAddress === voterAddress);
    if (hasVoted) {
      throw new Error('Voter has already voted');
    }

    // Encrypt the vote (1 for the selected candidate, 0 for others)
    const voteValue = 1;
    const encryptedVote = FHEUtils.encryptVote(voteValue, this.keyPair.publicKey);
    const proof = FHEUtils.generateVoteProof(voteValue, encryptedVote, this.keyPair.publicKey);

    // Create vote record
    const vote: Vote = {
      id: Date.now().toString(),
      encryptedVote,
      timestamp: Date.now(),
      voterAddress,
      electionId
    };

    // Add vote to storage
    existingVotes.push(vote);
    this.votes.set(electionId, existingVotes);

    // Update candidate's encrypted vote count (homomorphic addition)
    candidate.encryptedVoteCount = FHEUtils.addEncryptedVotes(
      candidate.encryptedVoteCount,
      encryptedVote
    );

    // Update total votes
    election.totalVotes += 1;

    return {
      encryptedVote,
      proof,
      publicKey: this.keyPair.publicKey
    };
  }

  async getVoteResults(electionId: string): Promise<VoteResult[]> {
    const election = this.elections.get(electionId);
    if (!election) {
      throw new Error('Election not found');
    }

    const results: VoteResult[] = [];
    let totalDecryptedVotes = 0;

    // Decrypt vote counts for each candidate
    for (const candidate of election.candidates) {
      const voteCount = FHEUtils.decryptVote(candidate.encryptedVoteCount, this.keyPair.privateKey);
      totalDecryptedVotes += voteCount;
      results.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        voteCount,
        percentage: 0 // Will be calculated below
      });
    }

    // Calculate percentages
    if (totalDecryptedVotes > 0) {
      results.forEach(result => {
        result.percentage = (result.voteCount / totalDecryptedVotes) * 100;
      });
    }

    return results.sort((a, b) => b.voteCount - a.voteCount);
  }

  async verifyVote(
    electionId: string,
    encryptedVote: string,
    proof: string,
    publicKey: string
  ): Promise<boolean> {
    return FHEUtils.verifyVoteProof(proof, encryptedVote, publicKey);
  }

  async getVoterStatus(electionId: string, voterAddress: string): Promise<boolean> {
    const votes = this.votes.get(electionId) || [];
    return votes.some(vote => vote.voterAddress === voterAddress);
  }

  async endElection(electionId: string): Promise<void> {
    const election = this.elections.get(electionId);
    if (!election) {
      throw new Error('Election not found');
    }

    election.isActive = false;
    election.endDate = Date.now();
  }

  getPublicKey(): string {
    return this.keyPair.publicKey;
  }
} 