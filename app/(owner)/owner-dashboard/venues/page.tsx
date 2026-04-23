"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit2, ShieldAlert, MapPin, Phone, Info, Clock, Calendar } from "lucide-react"

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    pricePerHour: "",
    courts: "1",
    description: "",
    image: "",
    phone: "",
  })

  const [blockData, setBlockData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "06:00",
    endTime: "07:00",
    reason: "Maintenance"
  })

  const fetchVenues = () => {
    fetch("/api/owner/venues")
      .then(res => res.json())
      .then(data => {
        setVenues(data.venues || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        alert(data.error || "Failed to upload image")
      }
    } catch (err) {
      console.error(err)
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const isEditing = !!editingVenueId
      const url = isEditing ? `/api/owner/venues/${editingVenueId}` : "/api/owner/venues"
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          pricePerHour: Number(formData.pricePerHour),
          courts: Number(formData.courts),
          description: formData.description,
          image: formData.image,
          phone: formData.phone,
        })
      })

      if (res.ok) {
        handleCloseDialog()
        fetchVenues() 
      } else {
        const errorData = await res.json()
        alert(errorData.error || `Failed to ${isEditing ? "update" : "create"} venue`)
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBlockSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/owner/bookings/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: selectedVenue._id,
          ...blockData
        })
      })

      const data = await res.json()
      if (res.ok) {
        alert("Slot blocked successfully!")
        setIsBlockDialogOpen(false)
      } else {
        alert(data.error || "Failed to block slot")
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingVenueId(null)
    setFormData({ name: "", address: "", pricePerHour: "", courts: "1", description: "", image: "", phone: "" })
  }

  const handleEditClick = (venue: any) => {
    setEditingVenueId(venue._id)
    setFormData({
      name: venue.name,
      address: venue.address,
      pricePerHour: venue.pricePerHour.toString(),
      courts: venue.courts.toString(),
      description: venue.description || "",
      image: venue.image || "",
      phone: venue.phone || "",
    })
    setIsDialogOpen(true)
  }

  const handleBlockClick = (venue: any) => {
    setSelectedVenue(venue)
    setIsBlockDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Venues</h1>
          <p className="text-muted-foreground mt-1">Manage and update your futsal facilities.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingVenueId(null)}>
              <Plus className="h-4 w-4" /> Add New Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingVenueId ? "Edit Venue" : "Add Futsal Venue"}</DialogTitle>
              <DialogDescription>
                {editingVenueId ? "Update your venue details below." : "Fill in the details to list your futsal venue."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateVenue}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Venue Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      required
                      className="pl-9"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pricePerHour">Price/Hour (Rs.)</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      required
                      min="0"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="courts">No. of Courts</Label>
                    <Input
                      id="courts"
                      type="number"
                      required
                      min="1"
                      value={formData.courts}
                      onChange={(e) => setFormData({ ...formData, courts: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell players about your facility..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      required
                      className="pl-9"
                      placeholder="98XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Image Thumbnail</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-xs text-blue-500 animate-pulse">Uploading image...</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? "Saving..." : editingVenueId ? "Update Venue" : "Create Venue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BLOCK TIME DIALOG */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <ShieldAlert className="h-5 w-5 text-orange-500" />
               Block Time Slot
            </DialogTitle>
            <DialogDescription>
              Prevent players from booking this venue during a specific time.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBlockSlot} className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Date</Label>
              <div className="relative">
                 <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input 
                   type="date" 
                   className="pl-9"
                   value={blockData.date} 
                   onChange={e => setBlockData({...blockData, date: e.target.value})}
                   required 
                 />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={blockData.startTime} 
                    onChange={e => setBlockData({...blockData, startTime: e.target.value})}
                    required 
                  />
               </div>
               <div className="grid gap-2">
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={blockData.endTime} 
                    onChange={e => setBlockData({...blockData, endTime: e.target.value})}
                    required 
                  />
               </div>
            </div>
            <div className="grid gap-2">
              <Label>Reason (Internal)</Label>
              <Input 
                placeholder="Maintenance, Private Event, etc." 
                value={blockData.reason}
                onChange={e => setBlockData({...blockData, reason: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4">
               <Button type="submit" variant="destructive" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Blocking..." : "Confirm Block"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {[1,2,3].map(i => <div key={i} className="h-[300px] bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : venues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
               <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No venues added yet</h3>
            <p className="mt-2 text-sm text-muted-foreground mb-6">
              Start by adding your first futsal venue to get discovered by players.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Venue Now</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map(venue => (
            <Card key={venue._id} className="overflow-hidden group border-border hover:border-primary/50 hover:shadow-md transition-all">
              <div className="relative h-40 w-full bg-muted overflow-hidden">
                {venue.image ? (
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <MapPin className="h-8 w-8 opacity-20" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                   <Badge className="bg-black/60 text-white backdrop-blur-md border-none">Rs. {venue.pricePerHour}/hr</Badge>
                </div>
              </div>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                   {venue.name}
                   <Badge variant="outline" className="text-[10px] font-bold uppercase">{venue.courts} Courts</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="space-y-1.5">
                   <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <MapPin className="h-3 w-3" /> {venue.address}
                   </div>
                   {venue.phone && (
                     <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Phone className="h-3 w-3" /> {venue.phone}
                     </div>
                   )}
                </div>
                
                {venue.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                    "{venue.description}"
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleEditClick(venue)}>
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200" onClick={() => handleBlockClick(venue)}>
                    <ShieldAlert className="h-3 w-3" /> Block
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
