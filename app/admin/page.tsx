"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Star, TrendingUp, Clock, MapPin, Swords } from "lucide-react"

interface Stats {
  totalUsers: number
  totalMatches: number
  openMatches: number
  completedMatches: number
  totalVenues: number
  pendingChallenges: number
  totalFeedback: number
  avgRating: number
  recentUsers: { name: string; email: string; createdAt: string }[]
  recentMatches: { venue: string; status: string; dateTime: string; createdBy: { name: string } }[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-gray-200  mb-2" />
                <div className="h-8 w-16 rounded bg-gray-200 " />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Total Matches", value: stats?.totalMatches ?? 0, icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    { label: "Open Matches", value: stats?.openMatches ?? 0, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Venues", value: stats?.totalVenues ?? 0, icon: MapPin, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
    { label: "Pending Challenges", value: stats?.pendingChallenges ?? 0, icon: Swords, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Overview</h2>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-blue-600" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers?.length ? (
              <ul className="space-y-3">
                {stats.recentUsers.map((u, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No users yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" /> Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentMatches?.length ? (
              <ul className="space-y-3">
                {stats.recentMatches.map((m, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.venue}</p>
                      <p className="text-xs text-muted-foreground">by {m.createdBy?.name || "Unknown"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.status === "open" ? "bg-primary/15 text-green-700" :
                      m.status === "completed" ? "bg-gray-100 text-gray-600" :
                      m.status === "cancelled" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {m.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No matches yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
