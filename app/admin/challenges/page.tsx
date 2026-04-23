"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Swords, Trash2, Calendar, MapPin } from "lucide-react"
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

interface ChallengeRecord {
  _id: string
  sender: { name: string; email: string }
  recipient: { name: string; email: string }
  status: string
  message: string
  matchDetails: { date: string; time: string; location: string; teamSize: number; skillLevel: string }
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  accepted: "bg-primary/15 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/challenges?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => { setChallenges(data.challenges || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" })
    setChallenges((prev) => prev.filter((c) => c._id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Team Challenges</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100  animate-pulse" />
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No challenges found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">From → To</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Match Details</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((c) => (
                  <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Swords className="h-4 w-4 text-purple-500 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{c.sender?.name || "?"}</p>
                          <p className="text-xs text-gray-400">→ {c.recipient?.name || "?"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="space-y-0.5">
                        {c.matchDetails?.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.matchDetails.date).toLocaleDateString()} {c.matchDetails.time}
                          </div>
                        )}
                        {c.matchDetails?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {c.matchDetails.location}
                          </div>
                        )}
                        {c.matchDetails?.teamSize && (
                          <span>{c.matchDetails.teamSize}v{c.matchDetails.teamSize} · {c.matchDetails.skillLevel}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate text-xs">
                      {c.message || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] || ""}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
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
                            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete this challenge between <strong>{c.sender?.name}</strong> and <strong>{c.recipient?.name}</strong>? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(c._id)}
                            >
                              {deleting === c._id ? "Deleting..." : "Delete"}
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
