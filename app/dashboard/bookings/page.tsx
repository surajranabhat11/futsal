"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Phone, AlertCircle, CheckCircle2, XCircle, History } from "lucide-react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchBookings = () => {
    setLoading(true)
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    setCancellingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (res.ok) {
        fetchBookings()
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to cancel booking")
      }
    } catch (err) {
      console.error(err)
      alert("An unexpected error occurred")
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none border-none"><History className="w-3 h-3 mr-1" /> Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
      case "refund_pending":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 italic">Refund Pending</Badge>
      case "refunded":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Refunded</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your futsal reservations</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-48 h-32 md:h-auto" />
                <div className="flex-1 p-6 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No bookings found</h3>
            <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
            <Button asChild bg-primary>
              <a href="/dashboard/location">Find a Venue</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{booking.venueId?.name || "Unknown Venue"}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {booking.venueId?.address || "No address"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {getPaymentBadge(booking.paymentStatus)}
                          {getStatusBadge(booking.status)}
                        </div>
                        <span className="text-xs text-muted-foreground">Order ID: #{booking._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Date
                        </div>
                        <div className="font-semibold text-sm">
                          {format(new Date(booking.date), "PPP")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Time
                        </div>
                        <div className="font-semibold text-sm">
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Phone className="w-3 h-3 mr-1" /> Contact
                        </div>
                        <div className="font-semibold text-sm">
                          {booking.playerPhone}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Phone className="w-3 h-3 mr-1" /> Venue Contact
                        </div>
                        <div className="font-semibold text-sm">
                          {booking.venueId?.phone || "N/A"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground flex items-center text-primary/80">
                           Amount Paid
                        </div>
                        <div className="font-bold text-lg text-primary">
                          Rs. {booking.totalAmount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                        >
                          Cancel Booking
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/location/${booking.venueId?._id}`}>View Venue</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
