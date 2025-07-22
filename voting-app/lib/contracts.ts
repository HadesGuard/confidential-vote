// Contract configuration for Confidential Voting
// Similar to zpool-fe structure

// Contract addresses (Sepolia deployment)
export const CONFIDENTIAL_VOTING_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xFFF82723DbF6e060FE6663D6194cCB5F77471791";

// Contract ABI - imported from the existing contract.ts
export const CONFIDENTIAL_VOTING_ABI = [
  {
    "inputs": [],
    "name": "AlreadyVoted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FHEPermissionDenied",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProposal",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotVoted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "VoteCountsAlreadyPublic",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "VoteCountsMadePublic",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getEncryptedVoteCount",
    "outputs": [
      {
        "internalType": "euint8",
        "name": "yes",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "no",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getMyVote",
    "outputs": [
      {
        "internalType": "euint8",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "getPublicVoteCounts",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "yesCount",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "noCount",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "isPublic",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "hasAnyVotes",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "voter",
        "type": "address"
      }
    ],
    "name": "hasUserVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      }
    ],
    "name": "makeVoteCountsPublic",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "euint8",
        "name": "yesCount",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "noCount",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isPublic",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "publicYesCount",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "publicNoCount",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint8",
        "name": "encryptedVote",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Network configuration
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
export const SEPOLIA_RPC_ENDPOINTS = [
  {
    name: "Lavanet",
    url: "https://g.w.lavanet.xyz:443/gateway/sep1/rpc-http/ac0a485e471079428fadfc1850f34a3d",
    priority: 1
  },
  {
    name: "PublicNode",
    url: "https://ethereum-sepolia-rpc.publicnode.com",
    priority: 2
  }
];

// Contract configuration
export const CONTRACT_CONFIG = {
  address: CONFIDENTIAL_VOTING_ADDRESS,
  abi: CONFIDENTIAL_VOTING_ABI,
  chainId: SEPOLIA_CHAIN_ID,
  rpcEndpoints: SEPOLIA_RPC_ENDPOINTS
}; 