"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Match {
  _id: string
  creatorId: string
  opponentId: string
  location: string
  date: string
  time: string
  teamSize: number
  status: "pending" | "accepted" | "rejected" | "completed"
  createdAt: string
  score?: {
    creator: number
    opponent: number
  }
}

interface Team {
  id: string
  name: string
  location: string
  distance: number
  rating: number
  availability: string[]
  players: number
  challenged?: boolean
}

interface MatchmakingContextType {
  matches: Match[]
  searchResults: Team[]
  isLoadingMatches: boolean
  isSearching: boolean
  isChallenging: boolean
  distance: number
  setDistance: (distance: number) => void
  searchTeams: (criteria: SearchCriteria) => Promise<void>
  challengeTeam: (teamId: string) => Promise<void>
  getMatches: () => Promise<void>
  updateMatchStatus: (
    matchId: string,
    status: "accepted" | "rejected" | "completed",
    score?: { creator: number; opponent: number },
  ) => Promise<void>
}

interface SearchCriteria {
  location?: string
  date?: string
  time?: string
  teamSize?: number
  skillBased?: boolean
}

const MatchmakingContext = createContext<MatchmakingContextType | null>(null)

export function useMatchmaking() {
  const context = useContext(MatchmakingContext)
  if (!context) {
    throw new Error("useMatchmaking must be used within a MatchmakingProvider")
  }
  return context
}

export function MatchmakingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [matches, setMatches] = useState<Match[]>([])
  const [searchResults, setSearchResults] = useState<Team[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isChallenging, setIsChallenging] = useState(false)
  const [distance, setDistance] = useState(5)

  // Fetch matches
  const fetchMatches = useCallback(async () => {
    if (!session?.user) return

    try {
      setIsLoadingMatches(true)
      const response = await fetch("/api/matches")

      if (!response.ok) {
        throw new Error("Failed to fetch matches")
      }

      const data = await response.json()

      if (data.matches) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
      toast({
        title: "Error",
        description: "Failed to load your matches",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMatches(false)
    }
  }, [session, toast])

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchMatches()
    }
  }, [session, fetchMatches])

  // Search for teams
  const searchTeams = useCallback(
    async (criteria: SearchCriteria) => {
      if (!session?.user) return

      setIsSearching(true)

      try {
        // In a real implementation, this would be an API call
        // For now, we'll simulate with mock data
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock teams data
        const mockTeams = [
          {
            id: "1",
            name: "Team Alpha",
            location: "Kathmandu",
            distance: 2.3,
            rating: 4.8,
            availability: ["Mon", "Wed", "Fri"],
            players: 5,
          },
          {
            id: "2",
            name: "Futsal Kings",
            location: "Lalitpur",
            distance: 3.5,
            rating: 4.5,
            availability: ["Tue", "Thu", "Sat"],
            players: 5,
          },
          {
            id: "3",
            name: "Goal Getters",
            location: "Bhaktapur",
            distance: 4.8,
            rating: 4.2,
            availability: ["Mon", "Thu", "Sun"],
            players: 5,
          },
        ]

        // Filter by distance
        const filteredTeams = mockTeams.filter((team) => team.distance <= distance)

        setSearchResults(filteredTeams)
      } catch (error) {
        console.error("Error searching teams:", error)
        toast({
          title: "Error",
          description: "Failed to search for teams",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    },
    [session, distance, toast],
  )

  // Challenge a team
  const challengeTeam = useCallback(
    async (teamId: string) => {
      if (!session?.user) return

      setIsChallenging(true)

      try {
        // Find the team in search results
        const team = searchResults.find((team) => team.id === teamId)

        if (!team) {
          throw new Error("Team not found")
        }

        // Create a match request
        const response = await fetch("/api/matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opponentId: teamId,
            location: team.location,
            date: new Date().toISOString().split("T")[0], // Today's date
            time: "18:00", // Default time
            teamSize: team.players,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create match request")
        }

        // Update the search results to show the team as challenged
        setSearchResults((prevResults) =>
          prevResults.map((team) => (team.id === teamId ? { ...team, challenged: true } : team)),
        )

        toast({
          title: "Challenge Sent",
          description: `Challenge request sent to ${team.name}!`,
          variant: "success",
        })

        // Refresh matches
        fetchMatches()
      } catch (error) {
        console.error("Error challenging team:", error)
        toast({
          title: "Error",
          description: "Failed to send challenge request",
          variant: "destructive",
        })
      } finally {
        setIsChallenging(false)
      }
    },
    [session, searchResults, fetchMatches, toast],
  )

  // Update match status
  const updateMatchStatus = useCallback(
    async (
      matchId: string,
      status: "accepted" | "rejected" | "completed",
      score?: { creator: number; opponent: number },
    ) => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/matches/${matchId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            score,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update match status")
        }

        // Update the match in the list
        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match._id === matchId
              ? {
                  ...match,
                  status,
                  score,
                }
              : match,
          ),
        )

        toast({
          title: "Match Updated",
          description: `Match has been ${status}`,
          variant: "success",
        })
      } catch (error) {
        console.error("Error updating match status:", error)
        toast({
          title: "Error",
          description: "Failed to update match status",
          variant: "destructive",
        })
      }
    },
    [session, toast],
  )

  const value = {
    matches,
    searchResults,
    isLoadingMatches,
    isSearching,
    isChallenging,
    distance,
    setDistance,
    searchTeams,
    challengeTeam,
    getMatches: fetchMatches,
    updateMatchStatus,
  }

  return <MatchmakingContext.Provider value={value}>{children}</MatchmakingContext.Provider>
}
