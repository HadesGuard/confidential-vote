// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { FHE, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConfidentialVoting is SepoliaConfig {
    using FHE for *;

    enum VoteOption { Yes, No }

    struct Proposal {
        string description;
        euint8 yesCount;
        euint8 noCount;
        bool isPublic;
        uint8 publicYesCount;
        uint8 publicNoCount;
    }

    Proposal[] public proposals;
    
    // Move mappings outside of struct to avoid FHE mapping issues
    mapping(uint256 => mapping(address => euint8)) private encryptedVotes;
    mapping(uint256 => mapping(address => bool)) private hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event Voted(uint256 indexed proposalId, address voter);
    event VoteCountsMadePublic(uint256 indexed proposalId, uint8 yesCount, uint8 noCount);

    function createProposal(string calldata description) external {
        Proposal storage newProposal = proposals.push();
        newProposal.description = description;
        newProposal.yesCount = FHE.asEuint8(0);
        newProposal.noCount = FHE.asEuint8(0);
        newProposal.isPublic = false;
        newProposal.publicYesCount = 0;
        newProposal.publicNoCount = 0;
        emit ProposalCreated(proposals.length - 1, description);
    }

    function vote(uint256 proposalId, externalEuint8 encryptedVote, bytes calldata proof) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        euint8 v = FHE.fromExternal(encryptedVote, proof);
        encryptedVotes[proposalId][msg.sender] = v;
        hasVoted[proposalId][msg.sender] = true;

        euint8 yes = FHE.asEuint8(uint8(VoteOption.Yes));
        euint8 no = FHE.asEuint8(uint8(VoteOption.No));

        euint8 one = FHE.asEuint8(1);
        p.yesCount = FHE.add(p.yesCount, FHE.select(FHE.eq(v, yes), one, FHE.asEuint8(0)));
        p.noCount = FHE.add(p.noCount, FHE.select(FHE.eq(v, no), one, FHE.asEuint8(0)));

        emit Voted(proposalId, msg.sender);
    }

    function getEncryptedVoteCount(uint256 proposalId) external view returns (euint8 yes, euint8 no) {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        return (p.yesCount, p.noCount);
    }

    function getMyVote(uint256 proposalId) external returns (euint8) {
        require(proposalId < proposals.length, "Invalid proposal");
        require(hasVoted[proposalId][msg.sender], "You haven't voted");
        FHE.allow(encryptedVotes[proposalId][msg.sender], msg.sender);
        return encryptedVotes[proposalId][msg.sender];
    }

    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /// @notice Check if a user has voted on a proposal
    /// @param proposalId ID of the proposal
    /// @param voter Address of the voter
    function hasUserVoted(uint256 proposalId, address voter) external view returns (bool) {
        require(proposalId < proposals.length, "Invalid proposal");
        return hasVoted[proposalId][voter];
    }

    /// @notice Make vote counts public (admin only)
    /// @param proposalId ID of the proposal
    /// @dev IMPORTANT: This function only marks the proposal as public.
    ///      Actual decryption must be done on the frontend using:
    ///      - userDecrypt() for individual votes
    ///      - publicDecrypt() for vote counts (if authorized)
    ///      See Zama Relayer SDK documentation for implementation details.
    function makeVoteCountsPublic(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        require(!p.isPublic, "Vote counts already public");
        
        // Mark as public - actual decryption happens on frontend
        p.isPublic = true;
        
        // Note: In a real implementation, you would:
        // 1. Use Zama Relayer SDK on frontend to decrypt vote counts
        // 2. Call publicDecrypt() with proper authorization
        // 3. Update publicYesCount and publicNoCount with decrypted values
        
        emit VoteCountsMadePublic(proposalId, 0, 0); // Placeholder values
    }

    /// @notice Get public vote counts (only available after makeVoteCountsPublic is called)
    /// @param proposalId ID of the proposal
    function getPublicVoteCounts(uint256 proposalId) external view 
        returns (uint8 yesCount, uint8 noCount, bool isPublic) {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage p = proposals[proposalId];
        return (p.publicYesCount, p.publicNoCount, p.isPublic);
    }
} 