import React, { useState } from 'react';
import { useVoting } from '../hooks/useVoting';
import { VOTE_OPTIONS, getVoteOptionLabel } from '../services/fheService';
import { UI_CONSTANTS } from '../config/app';
import './VotingInterface.css';

interface CreateProposalForm {
  title: string;
  description: string;
}

export const VotingInterface: React.FC = () => {
  const {
    proposals,
    loading,
    error,
    userAddress,
    userBalance,
    isWalletConnected,
    connectWallet,
    createProposal,
    castVote,
    makeVoteCountsPublic,
    refreshProposals,
    hasUserVoted,
  } = useVoting();

  const [createForm, setCreateForm] = useState<CreateProposalForm>({
    title: '',
    description: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [votingProposal, setVotingProposal] = useState<number | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create proposal
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title.trim() || !createForm.description.trim()) {
      return;
    }

    try {
      await createProposal(createForm.title, createForm.description);
      setCreateForm({ title: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  // Handle vote casting
  const handleVote = async (proposalId: number, voteValue: number) => {
    try {
      setVotingProposal(proposalId);
      await castVote(proposalId, voteValue);
      setVotingProposal(null);
    } catch (error) {
      console.error('Failed to cast vote:', error);
      setVotingProposal(null);
    }
  };

  // Handle making vote counts public
  const handleMakePublic = async (proposalId: number) => {
    try {
      await makeVoteCountsPublic(proposalId);
    } catch (error) {
      console.error('Failed to make vote counts public:', error);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isWalletConnected) {
    return (
      <div className="voting-interface">
        <div className="wallet-connect">
          <h2>🔐 Confidential Voting System</h2>
          <p>Connect your wallet to start voting securely with FHE encryption</p>
          <button 
            onClick={connectWallet}
            disabled={loading}
            className="connect-button"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-interface">
      {/* Header */}
      <div className="header">
        <h1>🔐 Confidential Voting System</h1>
        <div className="user-info">
          <span>Address: {userAddress ? formatAddress(userAddress) : 'Unknown'}</span>
          <span>Balance: {userBalance} ETH</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Create Proposal Section */}
      <div className="create-proposal-section">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="toggle-button"
        >
          {showCreateForm ? 'Cancel' : '➕ Create New Proposal'}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateProposal} className="create-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={createForm.title}
                onChange={handleInputChange}
                maxLength={UI_CONSTANTS.MAX_TITLE_LENGTH}
                minLength={UI_CONSTANTS.MIN_TITLE_LENGTH}
                required
                placeholder="Enter proposal title..."
              />
              <span className="char-count">
                {createForm.title.length}/{UI_CONSTANTS.MAX_TITLE_LENGTH}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={createForm.description}
                onChange={handleInputChange}
                maxLength={UI_CONSTANTS.MAX_DESCRIPTION_LENGTH}
                minLength={UI_CONSTANTS.MIN_DESCRIPTION_LENGTH}
                required
                placeholder="Enter proposal description..."
                rows={4}
              />
              <span className="char-count">
                {createForm.description.length}/{UI_CONSTANTS.MAX_DESCRIPTION_LENGTH}
              </span>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Proposal'}
            </button>
          </form>
        )}
      </div>

      {/* Proposals List */}
      <div className="proposals-section">
        <div className="section-header">
          <h2>📋 Active Proposals</h2>
          <button onClick={refreshProposals} disabled={loading} className="refresh-button">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="no-proposals">
            <p>No proposals available. Create one to get started!</p>
          </div>
        ) : (
          <div className="proposals-list">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userAddress={userAddress}
                onVote={handleVote}
                onMakePublic={handleMakePublic}
                hasUserVoted={hasUserVoted}
                votingProposal={votingProposal}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Proposal Card Component
interface ProposalCardProps {
  proposal: any;
  userAddress: string | null;
  onVote: (proposalId: number, voteValue: number) => Promise<void>;
  onMakePublic: (proposalId: number) => Promise<void>;
  hasUserVoted: (proposalId: number) => Promise<boolean>;
  votingProposal: number | null;
  loading: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  userAddress,
  onVote,
  onMakePublic,
  hasUserVoted,
  votingProposal,
  loading,
}) => {
  const [userVoted, setUserVoted] = useState<boolean>(false);
  const [checkingVote, setCheckingVote] = useState(false);

  // Check if user has voted
  React.useEffect(() => {
    const checkVote = async () => {
      if (userAddress) {
        setCheckingVote(true);
        try {
          const voted = await hasUserVoted(proposal.id);
          setUserVoted(voted);
        } catch (error) {
          console.error('Failed to check vote status:', error);
        } finally {
          setCheckingVote(false);
        }
      }
    };
    checkVote();
  }, [proposal.id, userAddress, hasUserVoted]);

  const isVoting = votingProposal === proposal.id;

  return (
    <div className="proposal-card">
      <div className="proposal-header">
        <h3>{proposal.title}</h3>
        <span className="proposal-id">#{proposal.id}</span>
      </div>
      
      <p className="proposal-description">{proposal.description}</p>
      
      <div className="proposal-meta">
        <span>Created by: {formatAddress(proposal.creator)}</span>
        <span>Date: {formatDate(proposal.createdAt)}</span>
        <span className={`status ${proposal.isActive ? 'active' : 'inactive'}`}>
          {proposal.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {userVoted && (
        <div className="vote-status">
          ✅ You have voted on this proposal
        </div>
      )}

      {proposal.isActive && !userVoted && !checkingVote && (
        <div className="voting-actions">
          <button
            onClick={() => onVote(proposal.id, VOTE_OPTIONS.YES)}
            disabled={isVoting || loading}
            className="vote-button yes"
          >
            {isVoting ? 'Voting...' : `👍 ${getVoteOptionLabel(VOTE_OPTIONS.YES)}`}
          </button>
          <button
            onClick={() => onVote(proposal.id, VOTE_OPTIONS.NO)}
            disabled={isVoting || loading}
            className="vote-button no"
          >
            {isVoting ? 'Voting...' : `👎 ${getVoteOptionLabel(VOTE_OPTIONS.NO)}`}
          </button>
        </div>
      )}

      {checkingVote && (
        <div className="checking-vote">
          Checking vote status...
        </div>
      )}

      <div className="proposal-actions">
        <button
          onClick={() => onMakePublic(proposal.id)}
          disabled={loading}
          className="make-public-button"
        >
          📊 Make Results Public
        </button>
      </div>
    </div>
  );
};

// Helper function
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString();
}; 