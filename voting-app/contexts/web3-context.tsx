"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract"

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

  // Contract state
  contract: ethers.Contract | null
  proposals: Proposal[]
  isLoading: boolean

  // Functions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  createProposal: (description: string) => Promise<void>
  vote: (proposalId: number, voteValue: boolean) => Promise<void>
  makeVoteCountsPublic: (proposalId: number) => Promise<void>
  hasUserVoted: (proposalId: number) => Promise<boolean>
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

  // Initialize Web3
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          await connectWallet()
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

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create contract instance
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      setAccount(accounts[0])
      setChainId(Number.parseInt(chainId, 16))
      setContract(contractInstance)
      setIsConnected(true)

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

  const vote = async (proposalId: number, voteValue: boolean) => {
    if (!contract || !account) {
      throw new Error("Wallet not connected")
    }

    try {
      setIsLoading(true)

      // For FHEVM, we need to encrypt the vote
      // This is a simplified version - in reality, you'd use FHEVM's encryption library
      const encryptedVote = voteValue ? "0x01" : "0x00" // Simplified encryption
      const proof = "0x" // Simplified proof

      const tx = await contract.vote(proposalId, encryptedVote, proof)
      await tx.wait()

      // Refresh proposals
      await loadProposals()
    } catch (error) {
      console.error("Error voting:", error)
      throw error
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

  const refreshProposals = async () => {
    await loadProposals()
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
    contract,
    proposals,
    isLoading,
    connectWallet,
    disconnectWallet,
    createProposal,
    vote,
    makeVoteCountsPublic,
    hasUserVoted,
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
