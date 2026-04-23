"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bell, Send, CheckCircle2 } from "lucide-react"

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ content: "", link: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSend = async () => {
    if (!form.content.trim()) { setError("Message is required."); return }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: form.content, link: form.link }),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSent(true)
      setForm({ content: "", link: "" })
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast Notification</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-green-600" /> Send to All Users
          </CardTitle>
          <CardDescription>
            This will create a system notification for every registered user in the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder="e.g. We've updated our matching algorithm — check out the new matchmaking page!"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              placeholder="/dashboard/matchmaking"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {sent && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Notification sent to all users!
            </div>
          )}

          <Button
            onClick={handleSend}
            disabled={sending}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send to All Users"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
