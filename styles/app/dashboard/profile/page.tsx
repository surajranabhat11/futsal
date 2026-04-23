"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Save, Loader2, MapPin, User, Bell } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/contexts/profile-context"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { profile, loading, updateProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    location: "", bio: "", position: "", skillLevel: "",
    availability: {}, notifications: true, profileImage: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        location: profile.location || "",
        bio: profile.bio || "",
        position: profile.position || "",
        skillLevel: profile.skillLevel || "",
        availability: profile.availability || {},
        notifications: profile.notifications != null ? profile.notifications : true,
        profileImage: profile.profileImage || "",
      })
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><Skeleton className="h-8 w-36 mb-2" /><Skeleton className="h-4 w-56" /></div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-100 dark:border-gray-800">
            <CardContent className="pt-6 flex flex-col items-center">
              <Skeleton className="h-28 w-28 rounded-full mb-4" />
              <Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-48 mb-6" />
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full mb-3" />)}
            </CardContent>
          </Card>
          <div className="md:col-span-2"><Skeleton className="h-10 w-full mb-4 rounded-lg" /><Skeleton className="h-64 rounded-xl" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account settings and preferences</p>
        </div>
        <Button
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          disabled={isSaving}
          className={isEditing ? "bg-green-600 hover:bg-green-700 text-white" : ""}
        >
          {isEditing ? (
            isSaving ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</div>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save Changes</>
            )
          ) : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AVATAR CARD */}
        <Card className="md:col-span-1 border-gray-100 dark:border-gray-800">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-28 w-28">
                <AvatarImage src={formData.profileImage || "/placeholder.svg?height=112&width=112"} alt={session?.user?.name || ""} />
                <AvatarFallback className="text-3xl bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {session?.user?.name?.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-green-600 hover:bg-green-700 text-white">
                  <Camera className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <h2 className="text-lg font-bold">{session?.user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{session?.user?.email}</p>
            <div className="w-full space-y-3">
              {[
                { label: "Position", value: formData.position },
                { label: "Skill Level", value: formData.skillLevel },
                { label: "Location", value: formData.location },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium">{value || "—"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TABS */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal"><User className="h-3.5 w-3.5 mr-1.5" />Personal</TabsTrigger>
              <TabsTrigger value="preferences"><MapPin className="h-3.5 w-3.5 mr-1.5" />Preferences</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="h-3.5 w-3.5 mr-1.5" />Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <Card className="border-gray-100 dark:border-gray-800">
                <CardHeader><CardTitle className="text-base">Personal Information</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} disabled={!isEditing} placeholder="e.g. Kathmandu, Nepal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} disabled={!isEditing} rows={4} placeholder="Tell others about yourself..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <Card className="border-gray-100 dark:border-gray-800">
                <CardHeader><CardTitle className="text-base">Player Preferences</CardTitle><CardDescription>Customize your player profile</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Position</Label>
                      <Select disabled={!isEditing} value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                        <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                        <SelectContent>
                          {["Goalkeeper", "Defender", "Midfielder", "Forward", "Any"].map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Skill Level</Label>
                      <Select disabled={!isEditing} value={formData.skillLevel} onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}>
                        <SelectTrigger><SelectValue placeholder="Select skill level" /></SelectTrigger>
                        <SelectContent>
                          {["Beginner", "Intermediate", "Advanced", "Professional"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card className="border-gray-100 dark:border-gray-800">
                <CardHeader><CardTitle className="text-base">Notifications</CardTitle><CardDescription>Enable or disable notifications</CardDescription></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium text-sm">Enable Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive match requests and messages</p>
                    </div>
                    <Switch id="notifications" checked={formData.notifications} disabled={!isEditing}
                      onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
