"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FeedbackRecord {
  _id: string
  senderId: string
  senderName?: string
  recipientId: string
  recipientName?: string
  rating: number
  comment?: string
  createdAt: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((data) => { setFeedback(data.feedback || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" })
    setFeedback((prev) => prev.filter((f) => f._id !== id))
    setDeleting(null)
  }

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1)
      : "N/A"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Feedback</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>Avg: <strong className="text-foreground">{avgRating}</strong></span>
          <span className="text-gray-300">·</span>
          <span>{feedback.length} reviews</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100  animate-pulse" />
              ))}
            </div>
          ) : feedback.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No feedback yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">From</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">To</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rating</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Comment</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f._id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {f.senderName || f.senderId?.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {f.recipientName || f.recipientId?.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      <Stars rating={f.rating} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {f.comment || <span className="text-gray-300 italic">No comment</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete this feedback entry? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(f._id)}
                            >
                              {deleting === f._id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
