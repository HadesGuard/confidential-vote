"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract"
import { prepareVoteForContract, VOTE_OPTIONS, handleFHEError } from "@/lib/fheService"
import { useFHE } from "@/hooks/useFHE"

// Sepolia network configuration
const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_NETWORK_NAME = "Sepolia"
const SEPOLIA_RPC_URL = "https://g.w.lavanet.xyz:443/gateway/sep1/rpc-http/ac0a485e471079428fadfc1850f34a3d"

interface Proposal {
  id: number
  description: string
  yesCount: number
  noCount: number
  isPublic: boolean
  createdAt: Date
}

interface Web3ContextType {
  // Wallet state
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null

  // Network state
  isCorrectNetwork: boolean
  networkName: string | null

  // Contract state
  contract: ethers.Contract | null
  proposals: Proposal[]
  isLoading: boolean

  // FHE state
  fheStatus: {
    initialized: boolean
    loading: boolean
    error: string | null
    sdkAvailable: boolean
  }

  // Functions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToSepolia: () => Promise<void>
  createProposal: (description: string) => Promise<void>
  vote: (proposalId: number, voteValue: boolean) => Promise<void>
  makeVoteCountsPublic: (proposalId: number) => Promise<void>
  hasUserVoted: (proposalId: number) => Promise<boolean>
  getPublicVoteCounts: (proposalId: number) => Promise<{yesCount: number, noCount: number, isPublic: boolean}>
  refreshProposals: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Network validation
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID
  const networkName = chainId ? (chainId === SEPOLIA_CHAIN_ID ? SEPOLIA_NETWORK_NAME : `Chain ID ${chainId}`) : null

  // FHE configuration - only create when user is actually connected
  const fheConfig = isConnected && account && typeof window !== "undefined" ? {
    network: (window as any).ethereum,
    rpcUrl: SEPOLIA_RPC_URL,
    account: account,
    chainId: chainId || undefined
  } : undefined

  // Use FHE service
  const {
    isInitialized: fheInitialized,
    isLoading: fheLoading,
    error: fheError,
    encrypt: fheEncrypt,
    decrypt: fheDecrypt,
    publicDecrypt: fhePublicDecrypt
  } = useFHE(fheConfig)

  // Initialize Web3
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          // User was already connected, restore the connection
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          const currentChainId = Number.parseInt(chainId, 16)
          
          setAccount(accounts[0])
          setChainId(currentChainId)
          
          // Create provider and contract instance
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
          setContract(contractInstance)
          setIsConnected(true)
          
          // Load proposals
          await loadProposals(contractInstance)
          
          console.log('Restored wallet connection:', {
            account: accounts[0],
            chainId: currentChainId,
            isConnected: true
          })
        } else {
          console.log('No wallet connected, waiting for user to connect...')
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!")
      return
    }

    try {
      setIsConnecting(true)

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      // Get chain ID
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const currentChainId = Number.parseInt(chainId, 16)

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create contract instance
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      setAccount(accounts[0])
      setChainId(currentChainId)
      setContract(contractInstance)
      setIsConnected(true)

      console.log('Wallet connected successfully:', {
        account: accounts[0],
        chainId: currentChainId,
        isConnected: true
      })

      // Load proposals
      await loadProposals(contractInstance)
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setIsConnected(false)
    setChainId(null)
    setContract(null)
    setProposals([])
  }

  const loadProposals = async (contractInstance?: ethers.Contract) => {
    const contractToUse = contractInstance || contract
    if (!contractToUse) return

    try {
      setIsLoading(true)

      // Get proposal count
      const count = await contractToUse.proposalCount()
      const proposalCount = Number(count)

      const loadedProposals: Proposal[] = []

      // Load each proposal
      for (let i = 0; i < proposalCount; i++) {
        try {
          const proposal = await contractToUse.proposals(i)
          const [yesCount, noCount, isPublic] = await contractToUse.getPublicVoteCounts(i)

          loadedProposals.push({
            id: i,
            description: proposal.description,
            yesCount: Number(yesCount),
            noCount: Number(noCount),
            isPublic: isPublic,
            createdAt: new Date(), // Contract doesn't store timestamp, using current time
          })
        } catch (error) {
          console.error(`Error loading proposal ${i}:`, error)
        }
      }

      setProposals(loadedProposals.reverse()) // Show newest first
    } catch (error) {
      console.error("Error loading proposals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createProposal = async (description: string) => {
    if (!contract || !account) {
      throw new Error("Wallet not connected")
    }

    try {
      setIsLoading(true)

      const tx = await contract.createProposal(description)
      await tx.wait()

      // Refresh proposals
      await loadProposals()
    } catch (error) {
      console.error("Error creating proposal:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const validateNetwork = () => {
    if (!isCorrectNetwork) {
      alert(`This app only supports ${SEPOLIA_NETWORK_NAME} network. Please switch to ${SEPOLIA_NETWORK_NAME} in your wallet.`)
      return false
    }
    return true
  }

  const vote = async (proposalId: number, voteValue: boolean) => {
    if (!contract || !account) {
      throw new Error("Wallet not connected")
    }

    if (!fheInitialized) {
      throw new Error("FHE service not initialized. Please wait for initialization to complete.")
    }

    // Validate network before voting
    if (!validateNetwork()) {
      return
    }

    try {
      setIsLoading(true)

      // Convert boolean vote to numeric value for FHE
      const numericVote = voteValue ? VOTE_OPTIONS.YES : VOTE_OPTIONS.NO
      
      // Use real FHE encryption
      const encryptedVote = await fheEncrypt(numericVote)

      const tx = await contract.vote(proposalId, encryptedVote.encryptedValue, encryptedVote.proof)
      await tx.wait()

      // Refresh proposals
      await loadProposals()
    } catch (error) {
      console.error("Error voting:", error)
      const errorMessage = handleFHEError(error)
      throw new Error(`Voting failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const makeVoteCountsPublic = async (proposalId: number) => {
    if (!contract || !account) {
      throw new Error("Wallet not connected")
    }

    try {
      setIsLoading(true)

      const tx = await contract.makeVoteCountsPublic(proposalId)
      await tx.wait()

      // Refresh proposals
      await loadProposals()
    } catch (error) {
      console.error("Error making vote counts public:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const hasUserVoted = async (proposalId: number): Promise<boolean> => {
    if (!contract || !account) {
      return false
    }

    try {
      const voted = await contract.hasUserVoted(proposalId, account)
      return voted
    } catch (error) {
      console.error("Error checking if user voted:", error)
      return false
    }
  }

  const getPublicVoteCounts = async (proposalId: number): Promise<{yesCount: number, noCount: number, isPublic: boolean}> => {
    if (!contract) {
      throw new Error("Contract not connected")
    }

    try {
      const [yesCount, noCount, isPublic] = await contract.getPublicVoteCounts(proposalId)
      return {
        yesCount: Number(yesCount),
        noCount: Number(noCount),
        isPublic: Boolean(isPublic)
      }
    } catch (error) {
      console.error("Error getting public vote counts:", error)
      return { yesCount: 0, noCount: 0, isPublic: false }
    }
  }

  const refreshProposals = async () => {
    await loadProposals()
  }

  const switchToSepolia = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask!")
      return
    }

    try {
      // Try to switch to Sepolia network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: SEPOLIA_NETWORK_NAME,
                nativeCurrency: {
                  name: "Sepolia Ether",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError)
          alert("Failed to add Sepolia network to MetaMask")
        }
      } else {
        console.error("Error switching to Sepolia network:", switchError)
        alert("Failed to switch to Sepolia network")
      }
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const value: Web3ContextType = {
    account,
    isConnected,
    isConnecting,
    chainId,
    isCorrectNetwork,
    networkName,
    contract,
    proposals,
    isLoading,
    fheStatus: {
      initialized: fheInitialized,
      loading: fheLoading,
      error: fheError,
      sdkAvailable: fheInitialized && !fheError
    },
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    createProposal,
    vote,
    makeVoteCountsPublic,
    hasUserVoted,
    getPublicVoteCounts,
    refreshProposals,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
