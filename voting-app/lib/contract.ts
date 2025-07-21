export const CONTRACT_ADDRESS = "0x..." // Replace with your deployed contract address

export const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "yesCount",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "noCount",
        type: "uint8",
      },
    ],
    name: "VoteCountsMadePublic",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    name: "createProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getEncryptedVoteCount",
    outputs: [
      {
        internalType: "euint8",
        name: "yes",
        type: "bytes32",
      },
      {
        internalType: "euint8",
        name: "no",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getMyVote",
    outputs: [
      {
        internalType: "euint8",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getPublicVoteCounts",
    outputs: [
      {
        internalType: "uint8",
        name: "yesCount",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "noCount",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isPublic",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "voter",
        type: "address",
      },
    ],
    name: "hasUserVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "makeVoteCountsPublic",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "euint8",
        name: "yesCount",
        type: "bytes32",
      },
      {
        internalType: "euint8",
        name: "noCount",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "isPublic",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "publicYesCount",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "publicNoCount",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "externalEuint8",
        name: "encryptedVote",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const
