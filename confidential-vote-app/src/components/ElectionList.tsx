import React from 'react';
import { Election } from '../types/voting';
import './ElectionList.css';

interface ElectionListProps {
  elections: Election[];
  onSelectElection: (election: Election) => void;
  loading: boolean;
}

export const ElectionList: React.FC<ElectionListProps> = ({
  elections,
  onSelectElection,
  loading
}) => {
  if (loading) {
    return (
      <div className="election-list">
        <div className="loading">Loading elections...</div>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="election-list">
        <div className="no-elections">No elections available</div>
      </div>
    );
  }

  return (
    <div className="election-list">
      <h2>Available Elections</h2>
      <div className="elections-grid">
        {elections.map((election) => (
          <div
            key={election.id}
            className={`election-card ${election.isActive ? 'active' : 'ended'}`}
            onClick={() => onSelectElection(election)}
          >
            <div className="election-header">
              <h3>{election.title}</h3>
              <span className={`status ${election.isActive ? 'active' : 'ended'}`}>
                {election.isActive ? 'Active' : 'Ended'}
              </span>
            </div>
            <p className="election-description">{election.description}</p>
            <div className="election-details">
              <div className="detail">
                <span className="label">Candidates:</span>
                <span className="value">{election.candidates.length}</span>
              </div>
              <div className="detail">
                <span className="label">Total Votes:</span>
                <span className="value">{election.totalVotes}</span>
              </div>
              <div className="detail">
                <span className="label">End Date:</span>
                <span className="value">
                  {new Date(election.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 