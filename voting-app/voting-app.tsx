"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/contexts/web3-context"
import { WalletConnect } from "@/components/wallet-connect"
import ZamaTest from "@/components/ZamaTest"
import {
  Eye,
  Plus,
  Shield,
  Lock,
  Users,
  CheckCircle,
  XCircle,
  Vote,
  BarChart3,
  History,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react"

interface UserVote {
  proposalId: number
  vote: "yes" | "no"
  votedAt: Date
}

export default function Component() {
  const {
    isConnected,
    isCorrectNetwork,
    networkName,
    proposals,
    isLoading,
    createProposal,
    vote,
    makeVoteCountsPublic,
    hasUserVoted,
    refreshProposals,
    switchToSepolia,
  } = useWeb3()

  const { toast } = useToast()
  const [newProposal, setNewProposal] = useState("")
  const [activeTab, setActiveTab] = useState("vote")
  const [userVotes, setUserVotes] = useState<UserVote[]>([])
  const [votingStates, setVotingStates] = useState<Record<number, boolean>>({})
  const [creatingProposal, setCreatingProposal] = useState(false)

  // Check voting status for all proposals
  useEffect(() => {
    if (isConnected && proposals.length > 0) {
      checkVotingStatus()
    }
  }, [isConnected, proposals])

  const checkVotingStatus = async () => {
    const votes: UserVote[] = []
    for (const proposal of proposals) {
      try {
        const voted = await hasUserVoted(proposal.id)
        if (voted) {
          // Since we can't get the actual vote from the contract easily,
          // we'll track it locally or assume it exists
          votes.push({
            proposalId: proposal.id,
            vote: "yes", // This would need to be tracked differently in a real app
            votedAt: new Date(),
          })
        }
      } catch (error) {
        console.error(`Error checking vote status for proposal ${proposal.id}:`, error)
      }
    }
    setUserVotes(votes)
  }

  const handleCreateProposal = async () => {
    if (!newProposal.trim()) return

    try {
      setCreatingProposal(true)
      await createProposal(newProposal.trim())
      setNewProposal("")
      setActiveTab("vote")
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created on the blockchain.",
      })
    } catch (error) {
      console.error("Error creating proposal:", error)
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreatingProposal(false)
    }
  }

  const handleVote = async (proposalId: number, voteValue: "yes" | "no") => {
    try {
      setVotingStates((prev) => ({ ...prev, [proposalId]: true }))

      await vote(proposalId, voteValue === "yes")

      // Update local vote tracking
      const newVote: UserVote = {
        proposalId,
        vote: voteValue,
        votedAt: new Date(),
      }
      setUserVotes((prev) => [...prev.filter((v) => v.proposalId !== proposalId), newVote])

      toast({
        title: "Vote Submitted",
        description: `Your ${voteValue} vote has been recorded on the blockchain.`,
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVotingStates((prev) => ({ ...prev, [proposalId]: false }))
    }
  }

  const handleMakePublic = async (proposalId: number) => {
    try {
      await makeVoteCountsPublic(proposalId)
      toast({
        title: "Results Made Public",
        description: "Vote counts are now visible to everyone.",
      })
    } catch (error) {
      console.error("Error making results public:", error)
      toast({
        title: "Error",
        description: "Failed to make results public. Please try again.",
        variant: "destructive",
      })
    }
  }

  const hasUserVotedOnProposal = (proposalId: number) => {
    return userVotes.some((vote) => vote.proposalId === proposalId)
  }

  const getUserVote = (proposalId: number) => {
    return userVotes.find((vote) => vote.proposalId === proposalId)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalVotes = proposals.reduce((acc, p) => acc + p.yesCount + p.noCount, 0)
  const totalProposals = proposals.length
  const userVoteCount = userVotes.length

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Confidential Voting
                  </h1>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Zero-knowledge privacy guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-12 pb-12 relative z-10">
          <div className="max-w-4xl mx-auto px-6">
            <ZamaTest />
            <WalletConnect />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Confidential Voting
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Zero-knowledge privacy guaranteed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{totalVotes} votes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Vote className="h-4 w-4" />
                  <span>{totalProposals} proposals</span>
                </div>
              </div>
              
              {/* Network Status */}
              {isConnected && (
                <div className="flex items-center gap-2">
                  {isCorrectNetwork ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-md">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-400 font-medium">{networkName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-md">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-xs text-red-400 font-medium">Wrong Network</span>
                      </div>
                      <Button
                        onClick={switchToSepolia}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        Switch to Sepolia
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Network Warning Banner */}
      {isConnected && !isCorrectNetwork && (
        <div className="fixed top-16 left-0 right-0 bg-red-500/90 backdrop-blur-xl border-b border-red-400/30 z-10">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">
                  Wrong Network: This app only supports {networkName} network
                </span>
              </div>
              <Button
                onClick={switchToSepolia}
                size="sm"
                className="bg-white text-red-600 hover:bg-gray-100 font-medium"
              >
                Switch to Sepolia
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`relative z-10 ${isConnected && !isCorrectNetwork ? 'pt-32' : 'pt-24'} pb-12`}>
        <div className="max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="grid grid-cols-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-1 rounded-xl">
                <TabsTrigger
                  value="vote"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200"
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Vote
                </TabsTrigger>
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-300 font-medium transition-all duration-200"
                >
                  <History className="h-4 w-4 mr-2" />
                  My Votes
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={refreshProposals}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {/* Vote Tab */}
            <TabsContent value="vote" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
                <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {proposals.length} proposals
                </Badge>
              </div>

              {isLoading && proposals.length === 0 ? (
                <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Loading proposals from blockchain...</p>
                  </CardContent>
                </Card>
              ) : proposals.length === 0 ? (
                <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
                      <Vote className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-lg">No proposals yet. Create the first one!</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Create Proposal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {proposals.map((proposal) => (
                    <Card
                      key={proposal.id}
                      className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-white text-lg leading-relaxed flex-1">
                            {proposal.description}
                          </CardTitle>
                          <div className="text-xs text-slate-400 whitespace-nowrap">#{proposal.id}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Voting Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Button
                            variant={getUserVote(proposal.id)?.vote === "yes" ? "default" : "outline"}
                            onClick={() => handleVote(proposal.id, "yes")}
                            disabled={votingStates[proposal.id] || isLoading}
                            className={`h-12 font-medium transition-all duration-200 ${
                              getUserVote(proposal.id)?.vote === "yes"
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                                : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-green-600/20 hover:border-green-500/50 hover:text-green-400"
                            }`}
                          >
                            {votingStates[proposal.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Vote Yes
                          </Button>
                          <Button
                            variant={getUserVote(proposal.id)?.vote === "no" ? "destructive" : "outline"}
                            onClick={() => handleVote(proposal.id, "no")}
                            disabled={votingStates[proposal.id] || isLoading}
                            className={`h-12 font-medium transition-all duration-200 ${
                              getUserVote(proposal.id)?.vote === "no"
                                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0"
                                : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400"
                            }`}
                          >
                            {votingStates[proposal.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Vote No
                          </Button>
                        </div>

                        {/* Make Results Public Button */}
                        {hasUserVotedOnProposal(proposal.id) && !proposal.isPublic && (
                          <Button
                            variant="ghost"
                            onClick={() => handleMakePublic(proposal.id)}
                            disabled={isLoading}
                            className="w-full h-10 bg-slate-700/20 hover:bg-slate-700/40 text-slate-300 hover:text-white border border-slate-600/50 hover:border-purple-500/50 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Make Results Public
                          </Button>
                        )}

                        {/* Results Display */}
                        {proposal.isPublic && (
                          <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <div className="flex justify-between items-center mb-6">
                              <span className="text-lg font-semibold text-white">Results</span>
                              <Badge
                                variant="secondary"
                                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                              >
                                {proposal.yesCount + proposal.noCount} total votes
                              </Badge>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                    <span className="text-slate-200 font-medium">Yes</span>
                                    <span className="text-slate-400">{proposal.yesCount} votes</span>
                                  </div>
                                  <div className="text-lg font-bold text-green-400">
                                    {proposal.yesCount + proposal.noCount > 0
                                      ? Math.round((proposal.yesCount / (proposal.yesCount + proposal.noCount)) * 100)
                                      : 0}
                                    %
                                  </div>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        proposal.yesCount + proposal.noCount > 0
                                          ? (proposal.yesCount / (proposal.yesCount + proposal.noCount)) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full"></div>
                                    <span className="text-slate-200 font-medium">No</span>
                                    <span className="text-slate-400">{proposal.noCount} votes</span>
                                  </div>
                                  <div className="text-lg font-bold text-red-400">
                                    {proposal.yesCount + proposal.noCount > 0
                                      ? Math.round((proposal.noCount / (proposal.yesCount + proposal.noCount)) * 100)
                                      : 0}
                                    %
                                  </div>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        proposal.yesCount + proposal.noCount > 0
                                          ? (proposal.noCount / (proposal.yesCount + proposal.noCount)) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Voting Status */}
                        {hasUserVotedOnProposal(proposal.id) && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            <Badge
                              variant="secondary"
                              className={`text-xs font-medium ${
                                getUserVote(proposal.id)?.vote === "yes"
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}
                            >
                              You voted: {getUserVote(proposal.id)?.vote?.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card className="bg-slate-800/50 backdrop-blur-xl border-purple-500/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                      <Plus className="h-5 w-5 text-purple-400" />
                    </div>
                    Create New Proposal
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Submit a new proposal for anonymous community voting. All votes are cryptographically secured on the
                    blockchain.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="proposal-input" className="text-slate-200 font-medium">
                      Proposal Description
                    </Label>
                    <Input
                      id="proposal-input"
                      placeholder="Enter your proposal description..."
                      value={newProposal}
                      onChange={(e) => setNewProposal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !creatingProposal && handleCreateProposal()}
                      disabled={creatingProposal}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 h-12"
                    />
                  </div>
                  <Button
                    onClick={handleCreateProposal}
                    disabled={!newProposal.trim() || creatingProposal}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-12"
                  >
                    {creatingProposal ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4 mr-2" />
                        Create Proposal
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Vote className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Proposals</p>
                        <p className="text-2xl font-bold text-white">{totalProposals}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Votes</p>
                        <p className="text-2xl font-bold text-white">{totalVotes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Your Votes</p>
                        <p className="text-2xl font-bold text-white">{userVoteCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Proposal Overview</CardTitle>
                  <CardDescription className="text-slate-400">
                    Summary of all proposals and their voting status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white font-medium text-sm leading-relaxed flex-1 pr-4">
                            {proposal.description}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                              #{proposal.id}
                            </Badge>
                            {proposal.isPublic ? (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-700/50 text-slate-400 text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        {proposal.isPublic && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-slate-400">Yes: {proposal.yesCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-slate-400">No: {proposal.noCount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Your Voting History</h2>
                <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {userVotes.length} votes cast
                </Badge>
              </div>

              {userVotes.length === 0 ? (
                <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
                  <CardContent className="py-16 text-center">
                    <div className="p-4 bg-slate-700/30 rounded-full w-fit mx-auto mb-4">
                      <History className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-lg">No votes cast yet.</p>
                    <Button
                      onClick={() => setActiveTab("vote")}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Start Voting
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userVotes
                    .sort((a, b) => b.votedAt.getTime() - a.votedAt.getTime())
                    .map((vote) => {
                      const proposal = proposals.find((p) => p.id === vote.proposalId)
                      if (!proposal) return null

                      return (
                        <Card
                          key={`${vote.proposalId}-${vote.votedAt.getTime()}`}
                          className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-2 leading-relaxed">{proposal.description}</h4>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs font-medium ${
                                      vote.vote === "yes"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : "bg-red-500/20 text-red-300 border-red-500/30"
                                    }`}
                                  >
                                    Voted: {vote.vote.toUpperCase()}
                                  </Badge>
                                  <span className="text-slate-400 text-sm">{formatDate(vote.votedAt)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-slate-400 text-sm mb-1">Proposal #{proposal.id}</div>
                                {proposal.isPublic && (
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="text-green-400">Yes: {proposal.yesCount}</span>
                                    <span className="text-red-400">No: {proposal.noCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
