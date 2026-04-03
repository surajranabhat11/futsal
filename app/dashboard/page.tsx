"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, MessageSquare, Star, Users, Calendar, Trophy, TrendingUp, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Invitation {
  _id: string
  sender: { _id: string; name: string; email: string; image?: string }
  recipient: { _id: string; name: string; email: string; image?: string }
  status: "pending" | "accepted" | "rejected"
  message: string
  createdAt: string
}

interface Challenge {
  _id: string
  sender: { _id: string; name: string; email: string; image?: string }
  recipient: { _id: string; name: string; email: string; image?: string }
  status: "pending" | "accepted" | "rejected"
  message: string
  matchDetails: { date: string; time: string; location: string; teamSize: number; skillLevel: string }
  createdAt: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ totalMatches: 0, wins: 0, messages: 0, rating: 0 })
  const [playerInvitations, setPlayerInvitations] = useState<{ received: Invitation[]; sent: Invitation[] }>({ received: [], sent: [] })
  const [teamChallenges, setTeamChallenges] = useState<{ received: Challenge[]; sent: Challenge[] }>({ received: [], sent: [] })

  useEffect(() => {
    fetchDashboardData()
    fetchInvitationsAndChallenges()
    const refreshInterval = setInterval(fetchInvitationsAndChallenges, 30000)
    return () => clearInterval(refreshInterval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStats({ totalMatches: 12, wins: 8, messages: 24, rating: 4.8 })
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setIsLoading(false)
    }
  }

  const fetchInvitationsAndChallenges = async () => {
    try {
      const [invRes, chalRes] = await Promise.all([
        fetch("/api/players/invitations"),
        fetch("/api/teams/challenges"),
      ])
      if (invRes.ok) setPlayerInvitations(await invRes.json())
      if (chalRes.ok) setTeamChallenges(await chalRes.json())
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleResponse = async (type: "invitation" | "challenge", id: string, status: "accepted" | "rejected") => {
    try {
      const endpoint = type === "invitation" ? `/api/players/invitations/${id}` : `/api/teams/challenge/${id}`
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      await fetchInvitationsAndChallenges()
      toast({ title: "Success", description: `${type === "invitation" ? "Invitation" : "Challenge"} ${status}` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Matches", value: stats.totalMatches, icon: Trophy, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Wins", value: stats.wins, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Rating", value: stats.rating, icon: Star, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back! Manage your matches and invitations.</p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-gray-100 dark:border-gray-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QUICK LINKS */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { href: "/dashboard/matchmaking", label: "Find Match", icon: Users, color: "bg-green-600" },
          { href: "/dashboard/location", label: "Venues", icon: MapPin, color: "bg-blue-600" },
          { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, color: "bg-purple-600" },
          { href: "/dashboard/feedback", label: "Feedback", icon: Star, color: "bg-amber-600" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer">
              <CardContent className="pt-6 pb-5 flex flex-col items-center gap-2 text-center">
                <div className={`h-10 w-10 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* INVITATIONS */}
      <Card className="border-gray-100 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Player Invitations
          </CardTitle>
          <CardDescription>Manage your team invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">Received ({playerInvitations.received.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({playerInvitations.sent.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="received" className="space-y-3 mt-4">
              {playerInvitations.received.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No received invitations</p>
              ) : playerInvitations.received.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <div>
                    <p className="font-medium text-sm">From: {inv.sender.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{inv.message}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{inv.status}</Badge>
                  </div>
                  {inv.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResponse("invitation", inv._id, "accepted")}>Accept</Button>
                      <Button size="sm" variant="outline" className="hover:border-red-400 hover:text-red-500" onClick={() => handleResponse("invitation", inv._id, "rejected")}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="sent" className="space-y-3 mt-4">
              {playerInvitations.sent.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No sent invitations</p>
              ) : playerInvitations.sent.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <div>
                    <p className="font-medium text-sm">To: {inv.recipient?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{inv.message}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CHALLENGES */}
      <Card className="border-gray-100 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Team Challenges
          </CardTitle>
          <CardDescription>Manage your match challenges</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received">Received ({teamChallenges.received.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({teamChallenges.sent.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="received" className="space-y-3 mt-4">
              {teamChallenges.received.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No received challenges</p>
              ) : teamChallenges.received.map((ch) => (
                <div key={ch._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">From: {ch.sender?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ch.message}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ch.matchDetails.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ch.matchDetails.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ch.matchDetails.location}</span>
                      <span>{ch.matchDetails.teamSize}v{ch.matchDetails.teamSize} · {ch.matchDetails.skillLevel}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{ch.status}</Badge>
                  </div>
                  {ch.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResponse("challenge", ch._id, "accepted")}>Accept</Button>
                      <Button size="sm" variant="outline" className="hover:border-red-400 hover:text-red-500" onClick={() => handleResponse("challenge", ch._id, "rejected")}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="sent" className="space-y-3 mt-4">
              {teamChallenges.sent.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No sent challenges</p>
              ) : teamChallenges.sent.map((ch) => (
                <div key={ch._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">To: {ch.recipient?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ch.message}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3">
                      <span>{new Date(ch.matchDetails.date).toLocaleDateString()} · {ch.matchDetails.time}</span>
                      <span>{ch.matchDetails.location}</span>
                      <span>{ch.matchDetails.teamSize}v{ch.matchDetails.teamSize} · {ch.matchDetails.skillLevel}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{ch.status}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
