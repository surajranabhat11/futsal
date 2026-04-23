"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

// Star rating component
function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md"
}) {
  const [hovered, setHovered] = useState(0)
  const px = size === "sm" ? "h-4 w-4" : "h-6 w-6"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${px} transition-colors ${
            star <= (hovered || value)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          } ${!readonly ? "cursor-pointer" : ""}`}
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

  // Per-player form state: { [playerId]: { rating, comment } }
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
      // 1. Load connected players
      const usersRes = await fetch("/api/users/connected")
      const usersData = await usersRes.json()
      const connectedPlayers: Player[] = usersData.users || []

      // 2. Load feedback for each player + my own received feedback in parallel
      const [playersWithFeedback, myFeedbackData] = await Promise.all([
        Promise.all(
          connectedPlayers.map(async (player) => {
            const data = await fetchFeedbackForPlayer(player._id)
            // Find if current user already reviewed this player
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

      // Pre-fill forms with existing reviews
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
      toast({ title: "Error", description: "Failed to load feedback data", variant: "destructive" })
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
      toast({ title: "Please select a rating", variant: "destructive" })
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
      toast({ title: "Feedback submitted!", description: "Your review has been saved." })
      // Refresh data for this player
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Feedback</h1>
        <p className="text-muted-foreground">
          Rate players you have played with and see what others think.
        </p>
      </div>

      <Tabs defaultValue="rate">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rate">Rate Players</TabsTrigger>
          <TabsTrigger value="received">
            My Reviews
            {myTotalReviews > 0 && (
              <Badge className="ml-2" variant="secondary">{myTotalReviews}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Rate connected players ── */}
        <TabsContent value="rate" className="space-y-4 mt-4">
          {players.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No connected players found.</p>
                <p className="text-sm mt-1">
                  Accept player invitations or challenges to rate those players.
                </p>
              </CardContent>
            </Card>
          ) : (
            players.map((player) => (
              <Card key={player._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.image || ""} />
                        <AvatarFallback>
                          {player.name?.substring(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{player.name}</CardTitle>
                        <CardDescription className="text-xs">{player.email}</CardDescription>
                      </div>
                    </div>
                    {/* Public rating summary */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <StarRating value={Math.round(player.averageRating)} readonly size="sm" />
                        <span className="text-sm font-medium">
                          {player.averageRating > 0 ? player.averageRating.toFixed(1) : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {player.totalReviews} review{player.totalReviews !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Rate this player */}
                  <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                    <p className="text-sm font-medium">
                      {forms[player._id]?.rating && forms[player._id].rating === player.myRating
                        ? "Your review"
                        : "Leave a review"}
                    </p>
                    <StarRating
                      value={forms[player._id]?.rating || 0}
                      onChange={(v) =>
                        setForms((prev) => ({
                          ...prev,
                          [player._id]: { ...prev[player._id], rating: v },
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Write a comment (optional)..."
                      value={forms[player._id]?.comment || ""}
                      onChange={(e) =>
                        setForms((prev) => ({
                          ...prev,
                          [player._id]: { ...prev[player._id], comment: e.target.value },
                        }))
                      }
                      rows={2}
                      className="text-sm resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(player._id)}
                      disabled={submitting === player._id || !forms[player._id]?.rating}
                    >
                      {submitting === player._id
                        ? "Submitting..."
                        : player.myRating
                        ? "Update Review"
                        : "Submit Review"}
                    </Button>
                  </div>

                  {/* All public reviews for this player */}
                  {player.feedback.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        All reviews
                      </p>
                      {player.feedback.map((f) => (
                        <div key={f._id} className="flex gap-3 p-2 rounded-lg bg-muted/20">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={(f.sender as any).image || ""} />
                            <AvatarFallback className="text-xs">
                              {f.sender.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{f.sender.name}</span>
                              <StarRating value={f.rating} readonly size="sm" />
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatDate(f.createdAt)}
                              </span>
                            </div>
                            {f.comment && (
                              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                                {f.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── TAB 2: My received feedback ── */}
        <TabsContent value="received" className="space-y-4 mt-4">
          {/* Summary card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {myAverageRating > 0 ? myAverageRating.toFixed(1) : "—"}
                  </p>
                  <StarRating value={Math.round(myAverageRating)} readonly />
                  <p className="text-sm text-muted-foreground mt-1">
                    {myTotalReviews} review{myTotalReviews !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = myReceivedFeedback.filter((f) => f.rating === star).length
                    const pct = myTotalReviews > 0 ? (count / myTotalReviews) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-4 text-right text-muted-foreground">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual reviews */}
          {myReceivedFeedback.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No reviews yet.</p>
                <p className="text-sm mt-1">Play matches and connect with players to receive feedback.</p>
              </CardContent>
            </Card>
          ) : (
            myReceivedFeedback.map((f) => (
              <Card key={f._id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={(f.sender as any).image || ""} />
                      <AvatarFallback>
                        {f.sender.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{f.sender.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                      </div>
                      <StarRating value={f.rating} readonly size="sm" />
                      {f.comment && (
                        <p className="text-sm text-muted-foreground mt-1">{f.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
