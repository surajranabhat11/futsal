"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Trash2, Calendar, MapPin } from "lucide-react"
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

interface MatchRecord {
  _id: string
  venue: string
  type: string
  status: string
  dateTime: string
  teamSize: number
  skillLevel: string
  createdBy: { name: string; email: string }
  players: string[]
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-primary/15 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  matched: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  completed: "bg-gray-100 text-gray-600  dark:text-gray-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/matches?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => { setMatches(data.matches || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/admin/matches/${id}`, { method: "DELETE" })
    setMatches((prev) => prev.filter((m) => m._id !== id))
    setDeleting(null)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/admin/matches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setMatches((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Matches</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
          ) : matches.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No matches found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Match</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Players</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{m.venue}</p>
                          <p className="text-xs text-muted-foreground">by {m.createdBy?.name || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(m.dateTime).toLocaleDateString()} {new Date(m.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.players?.length ?? 0} / {m.teamSize}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={m.status} onValueChange={(val) => handleStatusChange(m._id, val)}>
                        <SelectTrigger className={`h-7 w-28 text-xs border-0 font-medium ${STATUS_COLORS[m.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="matched">Matched</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
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
                            <AlertDialogTitle>Delete Match</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete the match at <strong>{m.venue}</strong>? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(m._id)}
                            >
                              {deleting === m._id ? "Deleting..." : "Delete"}
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
