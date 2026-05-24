"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserX, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchFriends = async () => {
    try {
      const [usersRes, invRes] = await Promise.all([
        fetch("/api/users/connected"),
        fetch("/api/players/invitations"),
      ])
      const usersData = await usersRes.json()
      const invData = await invRes.json()

      setFriends(usersData.users || [])

      // Store all accepted invitations so we can find the invitation ID for unfriend
      const allInvitations = [
        ...(invData.received || []),
        ...(invData.sent || []),
      ].filter((inv: any) => inv.status === "accepted")

      setInvitations(allInvitations)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const handleUnfriend = async (friendId: string) => {
  if (!confirm("Are you sure you want to remove this connection?")) return

  const invitation = invitations.find(
    (inv: any) =>
      inv.sender?._id?.toString() === friendId ||
      inv.recipient?._id?.toString() === friendId ||
      inv.sender?.toString() === friendId ||      // ✅ handle non-populated
      inv.recipient?.toString() === friendId
  )

  if (!invitation) {
    toast({ title: "Error", description: "Connection not found", variant: "destructive" })
    return
  }

  setRemovingId(friendId)
  try {
    const res = await fetch(`/api/players/invitations/${invitation._id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setFriends((prev) => prev.filter((f) => f._id !== friendId))
      toast({ title: "Removed", description: "Connection removed successfully" })
    } else {
      const data = await res.json()
      toast({ title: "Error", description: data.error || "Failed to remove connection", variant: "destructive" })
    }
  } catch (err) {
    toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
  } finally {
    setRemovingId(null)
  }
}

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        <p className="text-muted-foreground mt-1">Players you are connected with.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : friends.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No connections yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Invite players from the Matchmaking page to connect.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => (
            <Card key={friend._id} className="border-border">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {friend.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">{friend.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  onClick={() => handleUnfriend(friend._id)}
                  disabled={removingId === friend._id}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  {removingId === friend._id ? "Removing..." : "Unfriend"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}