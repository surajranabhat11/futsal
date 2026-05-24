"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, Award, TrendingUp, Users, Activity, Target, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Player {
  _id: string
  name: string
  email: string
  image?: string
}

interface FeedbackItem {
  _id: string
  sender: { _id: string; name: string; image?: string }
  recipient: string
  rating: number
  comment: string
  createdAt: string
}

interface PlayerWithFeedback extends Player {
  averageRating: number
  totalReviews: number
  feedback: FeedbackItem[]
  myRating?: number
  myComment?: string
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const [hovered, setHovered] = useState(0)
  const px = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${px} transition-all duration-300 ${
            star <= (hovered || value)
              ? "fill-amber-400 text-amber-400 scale-110"
              : "text-muted-foreground/30"
          } ${!readonly ? "cursor-pointer hover:scale-125" : ""}`}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const { data: session } = useSession()
  const { toast } = useToast()


  const [players, setPlayers] = useState<PlayerWithFeedback[]>([])
  const [myReceivedFeedback, setMyReceivedFeedback] = useState<FeedbackItem[]>([])
  const [myAverageRating, setMyAverageRating] = useState(0)
  const [myTotalReviews, setMyTotalReviews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [forms, setForms] = useState<Record<string, { rating: number; comment: string }>>({})

  const fetchFeedbackForPlayer = useCallback(async (playerId: string) => {
    const res = await fetch(`/api/feedback?recipientId=${playerId}`)
    if (!res.ok) return { feedback: [], averageRating: 0, totalReviews: 0 }
    return res.json()
  }, [])

  const loadAll = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    try {
      const usersRes = await fetch("/api/users/connected")
      const usersData = await usersRes.json()
      const connectedPlayers: Player[] = usersData.users || []

      const [playersWithFeedback, myFeedbackData] = await Promise.all([
        Promise.all(
          connectedPlayers.map(async (player) => {
            const data = await fetchFeedbackForPlayer(player._id)
            const myReview = data.feedback?.find(
              (f: FeedbackItem) => f.sender._id === session.user.id
            )
            return {
              ...player,
              feedback: data.feedback || [],
              averageRating: data.averageRating || 0,
              totalReviews: data.totalReviews || 0,
              myRating: myReview?.rating,
              myComment: myReview?.comment,
            }
          })
        ),
        fetchFeedbackForPlayer(session.user.id),
      ])

      setPlayers(playersWithFeedback)
      setMyReceivedFeedback(myFeedbackData.feedback || [])
      setMyAverageRating(myFeedbackData.averageRating || 0)
      setMyTotalReviews(myFeedbackData.totalReviews || 0)

      const initialForms: Record<string, { rating: number; comment: string }> = {}
      playersWithFeedback.forEach((p) => {
        initialForms[p._id] = {
          rating: p.myRating || 0,
          comment: p.myComment || "",
        }
      })
      setForms(initialForms)
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to load locker room feedback.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [session, fetchFeedbackForPlayer, toast])

  useEffect(() => {
    loadAll()
  }, [loadAll])



  const handleSubmit = async (recipientId: string) => {
    const form = forms[recipientId]
    if (!form?.rating) {
      toast({ title: "Rate the player", description: "Please select a star rating first.", variant: "destructive" })
      return
    }
    setSubmitting(recipientId)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, rating: form.rating, comment: form.comment }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit")
      }
      toast({ title: "Review Published!", description: "Your feedback has been updated in the locker room." })
      const data = await fetchFeedbackForPlayer(recipientId)
      setPlayers((prev) =>
        prev.map((p) =>
          p._id === recipientId
            ? {
                ...p,
                feedback: data.feedback,
                averageRating: data.averageRating,
                totalReviews: data.totalReviews,
                myRating: form.rating,
                myComment: form.comment,
              }
            : p
        )
      )
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight uppercase leading-none">Scout Report</h1>
          <p className="text-muted-foreground font-medium mt-2 text-lg">Rate your squad members and build your reputation.</p>
        </div>
        <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border/50 shadow-sm">
           <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Award className="h-6 w-6" />
           </div>
           <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none">Your Rep</p>
              <p className="text-2xl font-black font-heading leading-tight">{myAverageRating > 0 ? myAverageRating.toFixed(1) : "N/A"}</p>
           </div>
        </div>
      </div>

      <Tabs defaultValue="rate" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 p-1.5 bg-muted/50 rounded-2xl max-w-md">
          <TabsTrigger value="rate" className="rounded-xl font-black uppercase tracking-widest text-xs data-[state=active]:bg-background data-[state=active]:shadow-lg">Rate Players</TabsTrigger>
          <TabsTrigger value="received" className="rounded-xl font-black uppercase tracking-widest text-xs data-[state=active]:bg-background data-[state=active]:shadow-lg">
            My Reputation
            {myTotalReviews > 0 && (
              <Badge className="ml-2 bg-primary text-white border-none rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center font-bold text-[10px]">{myTotalReviews}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rate" className="space-y-6 mt-8">
          {players.length === 0 ? (
            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background">
              <CardContent className="py-20 text-center">
                <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                   <Users className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-black uppercase font-heading">No teammates yet</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">Connect with players through match invitations to start building your network.</p>
                <Button className="mt-8 rounded-full px-8 font-black uppercase tracking-widest" asChild>
                   <a href="/dashboard/matchmaking">Search Players</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            players.map((player) => (
              <Card key={player._id} className="feedback-card border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background overflow-hidden hover:shadow-2xl transition-all duration-500">
                <CardHeader className="p-8 pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                           <AvatarImage src={player.image || ""} />
                           <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                             {player.name?.substring(0, 2).toUpperCase()}
                           </AvatarFallback>
                         </Avatar>
                         <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                            <Target className="h-3 w-3 text-white" />
                         </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black font-heading uppercase tracking-tight">{player.name}</CardTitle>
                        <CardDescription className="font-bold text-primary/60 text-xs uppercase tracking-widest mt-0.5">{player.email}</CardDescription>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-3xl flex items-center gap-4 border border-border/20">
                      <div className="text-right">
                         <div className="flex items-center gap-1.5 justify-end">
                           <StarRating value={Math.round(player.averageRating)} readonly size="sm" />
                           <span className="text-lg font-black font-heading leading-none">
                             {player.averageRating > 0 ? player.averageRating.toFixed(1) : "0.0"}
                           </span>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
                           {player.totalReviews} SCOUT REPORTS
                         </p>
                      </div>
                      <div className="h-10 w-px bg-border/50" />
                      <div className="flex -space-x-3">
                         {[1,2,3].map(i => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-background shadow-sm">
                               <AvatarImage src={`/placeholder.svg?${i}`} />
                               <AvatarFallback className="text-[8px] font-black">U</AvatarFallback>
                            </Avatar>
                         ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* REVIEW FORM */}
                  <div className="space-y-4 bg-muted/20 p-6 rounded-[2rem] border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <Award className="h-24 w-24" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Publish Report</p>
                    <div className="py-2">
                       <StarRating
                         size="lg"
                         value={forms[player._id]?.rating || 0}
                         onChange={(v) => setForms((prev) => ({ ...prev, [player._id]: { ...prev[player._id], rating: v } }))}
                       />
                    </div>
                    <Textarea
                      placeholder="Share your thoughts on their performance, teamwork, or skill..."
                      value={forms[player._id]?.comment || ""}
                      onChange={(e) => setForms((prev) => ({ ...prev, [player._id]: { ...prev[player._id], comment: e.target.value } }))}
                      rows={3}
                      className="rounded-2xl bg-background/50 border-none focus-visible:ring-primary/20 font-medium p-4"
                    />
                    <Button
                      className="w-full h-12 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                      onClick={() => handleSubmit(player._id)}
                      disabled={submitting === player._id || !forms[player._id]?.rating}
                    >
                      {submitting === player._id ? <Loader2 className="h-5 w-5 animate-spin" /> : player.myRating ? "Update Report" : "Submit Report"}
                    </Button>
                  </div>

                  {/* FEEDBACK HISTORY */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Teammate Reviews</p>
                        <Badge variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary">All Activity</Badge>
                     </div>
                     <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-3">
                           {player.feedback.length === 0 ? (
                              <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-[2rem] opacity-30 grayscale">
                                 <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">No reports yet</p>
                              </div>
                           ) : player.feedback.map((f) => (
                             <div key={f._id} className="p-4 rounded-2xl bg-background border border-border/30 shadow-sm group hover:border-primary/30 transition-all">
                               <div className="flex gap-3">
                                 <Avatar className="h-8 w-8 shrink-0 border border-border">
                                   <AvatarFallback className="text-[10px] font-black">
                                     {f.sender.name?.substring(0, 2).toUpperCase()}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between mb-1">
                                     <span className="text-xs font-black uppercase tracking-tight">{f.sender.name}</span>
                                     <span className="text-[10px] font-bold text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   <div className="flex items-center gap-2 mb-2">
                                      <div className="flex gap-0.5">
                                         {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`h-2.5 w-2.5 ${s <= f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                         ))}
                                      </div>
                                   </div>
                                   {f.comment && (
                                     <p className="text-xs text-muted-foreground font-medium italic">&quot;{f.comment}&quot;</p>
                                   )}
                                 </div>
                               </div>
                             </div>
                           ))}
                        </div>
                     </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-6 mt-8">
          <div className="grid gap-6 lg:grid-cols-3">
             <Card className="lg:col-span-1 border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-gradient-to-br from-primary to-[#122b1f] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Award className="h-32 w-32" />
                </div>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center h-full space-y-4">
                   <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Global Ranking</p>
                   <div>
                      <p className="text-7xl font-black font-heading leading-none">
                        {myAverageRating > 0 ? myAverageRating.toFixed(1) : "—"}
                      </p>
                      <div className="flex justify-center mt-4">
                         <StarRating value={Math.round(myAverageRating)} readonly size="md" />
                      </div>
                   </div>
                   <p className="text-sm font-bold opacity-80 mt-2">
                     Based on {myTotalReviews} Scout Reports
                   </p>
                </CardContent>
             </Card>

             <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background">
                <CardHeader className="p-8 pb-0">
                   <CardTitle className="text-xl font-black font-heading uppercase tracking-tight flex items-center gap-3">
                      <Activity className="h-6 w-6 text-primary" />
                      Skill breakdown
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-6 space-y-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = myReceivedFeedback.filter((f) => f.rating === star).length
                    const pct = myTotalReviews > 0 ? (count / myTotalReviews) * 100 : 0
                    return (
                      <div key={star} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-1">
                           <div className="flex items-center gap-2">
                              <span>{star} STAR</span>
                              <div className="flex">
                                 {Array(star).fill(0).map((_, i) => <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />)}
                              </div>
                           </div>
                           <span>{count} Reports</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted/50 overflow-hidden border border-border/20">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
             </Card>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Recent Reports</h3>
             {myReceivedFeedback.length === 0 ? (
               <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-background">
                 <CardContent className="py-20 text-center text-muted-foreground">
                   <p className="font-bold">No feedback yet. Get out there and play!</p>
                 </CardContent>
               </Card>
             ) : (
               <div className="grid gap-4 md:grid-cols-2">
                  {myReceivedFeedback.map((f) => (
                    <Card key={f._id} className="border-none shadow-xl shadow-black/5 rounded-3xl bg-background hover:scale-[1.02] transition-transform">
                      <CardContent className="p-6 flex gap-4">
                        <Avatar className="h-12 w-12 border border-border shadow-sm">
                          <AvatarImage src={(f.sender as any).image || ""} />
                          <AvatarFallback className="bg-primary/5 text-primary font-black uppercase">
                            {f.sender.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black font-heading text-sm uppercase tracking-tight">{f.sender.name}</span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>
                          <StarRating value={f.rating} readonly size="sm" />
                          {f.comment && (
                            <p className="text-sm text-muted-foreground font-medium italic mt-3 bg-muted/30 p-3 rounded-xl border border-border/20">
                               &quot;{f.comment}&quot;
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>
             )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
