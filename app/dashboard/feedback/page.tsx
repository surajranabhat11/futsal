"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pastMatches, setPastMatches] = useState<any[]>([])
  const [receivedFeedback, setReceivedFeedback] = useState<any[]>([])

  // Simulate data loading
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock past matches data
        setPastMatches([
          {
            id: 1,
            opponent: "Team Alpha",
            date: "2024-12-01",
            location: "Futsal Arena, Kathmandu",
            result: "Win",
            score: "5-3",
            feedbackGiven: true,
          },
          {
            id: 2,
            opponent: "Futsal Kings",
            date: "2024-11-25",
            location: "Sports Complex, Lalitpur",
            result: "Loss",
            score: "2-4",
            feedbackGiven: false,
          },
          {
            id: 3,
            opponent: "Goal Getters",
            date: "2024-11-18",
            location: "Goal Zone Futsal, Bhaktapur",
            result: "Win",
            score: "6-2",
            feedbackGiven: true,
          },
        ])

        // Mock received feedback data
        setReceivedFeedback([
          {
            id: 1,
            from: "Team Alpha",
            date: "2024-12-01",
            rating: 4,
            comment: "Great team to play against. Very fair and skilled players.",
            avatar: "/placeholder.svg?height=40&width=40",
          },
          {
            id: 2,
            from: "Goal Getters",
            date: "2024-11-18",
            rating: 5,
            comment: "Excellent sportsmanship and communication. Would play again!",
            avatar: "/placeholder.svg?height=40&width=40",
          },
        ])

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching feedback data:", error)
        setIsLoading(false)
      }
    }

    fetchFeedbackData()
  }, [])

  const handleSubmitFeedback = () => {
    setIsSubmitting(true)

    // Simulate API call with a delay
    setTimeout(() => {
      console.log("Feedback submitted:", { rating, feedback })
      setRating(0)
      setFeedback("")
      setIsSubmitting(false)

      // In a real app, you would update the UI to reflect the submitted feedback
      alert("Feedback submitted successfully!")
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        <div className="w-full">
          <div className="flex w-full mb-6">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-md" />
                  ))}
              </div>
            </CardContent>
          </Card>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">Rate your matches and view feedback from other teams.</p>
      </div>

      <Tabs defaultValue="give-feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="give-feedback">Give Feedback</TabsTrigger>
          <TabsTrigger value="received-feedback">Received Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="give-feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Matches</CardTitle>
              <CardDescription>Select a match to provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{match.opponent}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            match.result === "Win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {match.result} ({match.score})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.date).toLocaleDateString()} at {match.location}
                      </p>
                    </div>
                    <Button variant={match.feedbackGiven ? "outline" : "default"} disabled={match.feedbackGiven}>
                      {match.feedbackGiven ? "Feedback Given" : "Give Feedback"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>Provide feedback for your selected match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 font-medium">Rating</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={`h-8 w-8 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Comments</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience with this team..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmitFeedback} disabled={isSubmitting || rating === 0} className="w-full">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="received-feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback from Other Teams</CardTitle>
              <CardDescription>See what others have to say about playing with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {receivedFeedback.length > 0 ? (
                  receivedFeedback.map((feedback) => (
                    <div key={feedback.id} className="space-y-2 border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={feedback.avatar || "/placeholder.svg"} alt={feedback.from} />
                          <AvatarFallback>{feedback.from.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{feedback.from}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(feedback.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-10">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating ? "fill-primary text-primary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm ml-10">{feedback.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feedback received yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
