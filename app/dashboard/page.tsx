"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, MessageSquare, Star, Users, Calendar, Trophy, TrendingUp, Clock, ArrowRight, Zap, Target, Activity } from "lucide-react"
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
  const router = useRouter()
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
      const response = await fetch("/api/players/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
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
      const endpoint = type === "invitation" ? `/api/players/invitations/${id}` : `/api/teams/challenges/${id}`
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      await fetchInvitationsAndChallenges()
      router.refresh()
      toast({ 
        title: status === "accepted" ? "Success!" : "Declined", 
        description: `${type === "invitation" ? "Invitation" : "Challenge"} successfully ${status}.`,
        variant: status === "accepted" ? "default" : "destructive"
      })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <Skeleton className="h-96 rounded-2xl" />
           <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  const quickStats = [
    { label: "Matches", value: stats.totalMatches, icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    { label: "Win Rate", value: `${Math.round((stats.wins / stats.totalMatches) * 100)}%`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Rating", value: stats.rating, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Messages", value: stats.messages, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-card">
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tight leading-tight">
            Welcome Back, <span className="text-primary italic">Pro!</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Here&apos;s what&apos;s happening with your futsal career today.</p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="rounded-full shadow-lg shadow-primary/30 h-12 px-6 font-bold hover:scale-105 transition-all">
              <Link href="/dashboard/matchmaking">
                <Zap className="w-5 h-5 mr-2 fill-current" />
                Find Match
              </Link>
           </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {quickStats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-none bg-background shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all animate-stat group rounded-2xl overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full ${bg.replace('/10', '')}`} />
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className={`h-14 w-14 ${bg} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <div>
                  <p className="text-4xl font-black font-heading tracking-tight text-foreground">{value}</p>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/50">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* MAIN ACTIONS */}
        <div className="lg:col-span-8 space-y-8">
          {/* QUICK LINKS */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 animate-card">
            {[
              { href: "/dashboard/location", label: "Venues", icon: MapPin, color: "bg-primary" },
              { href: "/dashboard/matchmaking", label: "Players", icon: Users, color: "bg-accent" },
              { href: "/dashboard/chat", label: "Messages", icon: MessageSquare, color: "bg-blue-600" },
              { href: "/dashboard/feedback", label: "Reviews", icon: Star, color: "bg-amber-500" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} className="group">
                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-background border border-border/50 hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all h-full relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 w-16 h-16 bg-muted/20 rounded-full group-hover:scale-150 transition-transform duration-500" />
                  <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-wider relative z-10">{label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* CHALLENGES TAB SECTION */}
          <Card id="team-challenges" className="border-none shadow-2xl shadow-black/5 animate-card overflow-hidden rounded-3xl relative">
             {(teamChallenges.received.filter(c => c.status === 'pending').length > 0) && (
               <div className="absolute top-4 right-4 z-10 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
               </div>
             )}
             <div className="h-3 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="pb-6 p-8">
              <div className="flex items-center justify-between">
                 <div>
                    <CardTitle className="text-2xl font-black font-heading flex items-center gap-3">
                      <Target className="h-6 w-6 text-accent" />
                      Team Challenges
                    </CardTitle>
                    <CardDescription className="text-md mt-1">Accept or decline match requests from local teams</CardDescription>
                 </div>
                 <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm font-bold bg-accent/10 text-accent border-none">{teamChallenges.received.length} PENDING</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1.5 rounded-2xl h-14">
                  <TabsTrigger value="received" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg h-full">Received</TabsTrigger>
                  <TabsTrigger value="sent" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg h-full">Sent</TabsTrigger>
                </TabsList>
                <TabsContent value="received" className="mt-6 space-y-4">
                  {teamChallenges.received.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 grayscale">
                       <Activity className="h-16 w-16 mb-4 stroke-[1.5]" />
                       <p className="text-lg font-bold">No challenges yet</p>
                       <p className="text-sm">When teams challenge you, they will appear here.</p>
                    </div>
                  ) : teamChallenges.received.map((ch) => (
                    <div key={ch._id} className="group relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-6 hover:bg-muted/40 transition-all border-l-4 border-l-accent">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-sm uppercase shadow-md group-hover:rotate-3 transition-transform">
                                {ch.sender?.name?.charAt(0) || "?"}
                             </div>
                             <div>
                                <p className="font-black text-base">{ch.sender?.name || "Unknown"}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Challenger Team</p>
                             </div>
                          </div>
                          <p className="text-sm font-medium italic text-muted-foreground bg-background/50 p-3 rounded-xl border border-border/30">&quot;{ch.message}&quot;</p>
                          <div className="flex flex-wrap gap-3">
                            <Badge variant="outline" className="bg-background flex items-center gap-2 py-1.5 px-3 border-none shadow-sm rounded-full">
  <Calendar className="h-3.5 w-3.5 text-primary" />
  <span className="text-xs font-bold">
    {ch.matchDetails?.date ? new Date(ch.matchDetails.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}
  </span>
</Badge>
<Badge variant="outline" className="bg-background flex items-center gap-2 py-1.5 px-3 border-none shadow-sm rounded-full">
  <MapPin className="h-3.5 w-3.5 text-accent" />
  <span className="text-xs font-bold">{ch.matchDetails?.location || "TBD"}</span>
</Badge>
<Badge variant="outline" className="bg-background flex items-center gap-2 py-1.5 px-3 border-none shadow-sm rounded-full">
  <Users className="h-3.5 w-3.5 text-blue-500" />
  <span className="text-xs font-bold">{ch.matchDetails?.teamSize || "?"}v{ch.matchDetails?.teamSize || "?"}</span>
</Badge>
                          </div>
                        </div>
                        {ch.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="lg" className="rounded-2xl px-6 h-12 font-black tracking-tight shadow-lg shadow-primary/20" onClick={() => handleResponse("challenge", ch._id, "accepted")}>ACCEPT</Button>
                            <Button size="lg" variant="outline" className="rounded-2xl px-6 h-12 font-black tracking-tight border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" onClick={() => handleResponse("challenge", ch._id, "rejected")}>DECLINE</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="sent" className="mt-6">
                   <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
                      <p className="text-sm font-bold text-muted-foreground">Manage sent challenges in your global activity log.</p>
                   </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="lg:col-span-4 space-y-8">
          {/* PLAYER INVITATIONS */}
          <Card id="squad-invites" className="border-none shadow-2xl shadow-black/5 animate-card rounded-3xl overflow-hidden relative">
             {(playerInvitations.received.filter(i => i.status === 'pending').length > 0) && (
               <div className="absolute top-4 right-4 z-10 flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </div>
             )}
             <div className="p-8 pb-4">
                <CardTitle className="text-xl font-black font-heading flex items-center gap-3 text-primary">
                  <Users className="h-6 w-6" />
                  Squad Invites
                </CardTitle>
             </div>
            <CardContent className="p-8 pt-0 space-y-4">
               {playerInvitations.received.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-muted/30 border border-dashed border-border text-center">
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No New Invites</p>
                  </div>
               ) : playerInvitations.received.slice(0, 3).map((inv) => (
                  <div key={inv._id} className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-all">
                     <div>
                        <p className="text-base font-black tracking-tight">{inv.sender?.name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-0.5">{inv.status}</p>
                     </div>
                     <Button size="icon" variant="ghost" className="h-10 w-10 rounded-2xl bg-background shadow-sm hover:bg-primary hover:text-white transition-all group-hover:scale-110" asChild>
                        <Link href="/dashboard/matchmaking"><ArrowRight className="h-5 w-5" /></Link>
                     </Button>
                  </div>
               ))}
               <Button variant="ghost" className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-muted/50" asChild>
                  <Link href="/dashboard/matchmaking">View All Invitations</Link>
               </Button>
            </CardContent>
          </Card>

          {/* TRAINING TIP */}
          <Card className="border-none bg-gradient-to-br from-primary via-primary to-[#122b1f] text-white shadow-2xl shadow-primary/20 animate-card rounded-3xl overflow-hidden relative min-h-[220px] flex flex-col justify-end">
             <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                <Zap className="h-32 w-32 fill-white" />
             </div>
             <CardHeader className="relative z-10">
                <div className="h-1 w-12 bg-accent mb-2 rounded-full" />
                <CardTitle className="text-2xl font-black font-heading tracking-tight">Pro Tip</CardTitle>
             </CardHeader>
             <CardContent className="relative z-10 pb-8 pt-0">
                <p className="text-base opacity-90 leading-relaxed font-bold italic tracking-tight">
                  &quot;Always stay on your toes! In Futsal, the ball moves faster than on grass. Keep your first touch close to maintain control in tight spaces.&quot;
                </p>
             </CardContent>
          </Card>

          {/* ACTIVITY LOG MINI */}
          <Card className="border-none bg-background shadow-2xl shadow-black/5 animate-card rounded-3xl">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black font-heading flex items-center gap-3">
                  <Activity className="h-6 w-6 text-blue-600" />
                  Live Activity
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0">
                <div className="space-y-6">
                   {[1, 2].map((i) => (
                      <div key={i} className="flex gap-4 relative">
                         {i === 1 && <div className="absolute left-[11px] top-6 w-0.5 h-10 bg-muted" />}
                         <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                         </div>
                         <div>
                            <p className="text-sm font-bold leading-tight">Match Scheduled at Central Futsal</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">2 hours ago</p>
                         </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
