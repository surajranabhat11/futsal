"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, Phone, CheckCircle2, XCircle, RotateCcw, ShieldAlert } from "lucide-react"

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = () => {
    fetch("/api/owner/bookings")
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const updateStatus = async (id: string, status: string) => {
    const action = status === 'confirmed' ? 'confirm' : 'reject'
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) {
      return
    }

    try {
      const res = await fetch(`/api/owner/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchBookings()
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to update status")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/owner/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus })
      })
      if (res.ok) {
        alert("Payment status updated successfully")
        fetchBookings()
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to update payment status")
      }
    } catch (error) {
      console.error(error)
      alert("An unexpected error occurred")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Confirmed</Badge>
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending</Badge>
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelled</Badge>
      case 'blocked': return <Badge className="bg-gray-800 text-white hover:bg-gray-800 border-none">Blocked</Badge>
      case 'completed': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Completed</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
        <p className="text-muted-foreground mt-1">Track and manage reservations across your venues.</p>
      </div>

      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 space-y-4">
               {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
               <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
               <h3 className="text-lg font-semibold">No bookings yet</h3>
               <p className="text-sm text-muted-foreground">Your booking history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Player Info</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Venue</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Schedule</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Payment</th>
                    <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        {booking.status === 'blocked' ? (
                          <div className="flex items-center gap-2 text-muted-foreground italic">
                             <ShieldAlert className="h-4 w-4" /> System Blocked
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                               <User className="h-3 w-3 text-muted-foreground" /> {booking.userId?.name || "Guest"}
                            </div>
                            <div className="flex items-center text-xs text-primary font-medium">
                               <Phone className="h-3 w-3 mr-1 text-muted-foreground" /> {booking.playerPhone}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {booking.venueId?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="h-3 w-3 text-muted-foreground" /> {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </div>
                           <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Clock className="h-3 w-3" /> {booking.startTime} - {booking.endTime}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`text-xs font-bold ${
                            booking.paymentStatus === 'paid' ? 'text-green-600' :
                            booking.paymentStatus === 'refund_pending' ? 'text-orange-600' :
                            booking.paymentStatus === 'refunded' ? 'text-gray-500' :
                            'text-amber-600'
                          }`}>
                            {booking.paymentStatus === 'paid' ? 'PAID' :
                             booking.paymentStatus === 'refund_pending' ? 'REFUND PENDING' :
                             booking.paymentStatus === 'refunded' ? 'REFUNDED' :
                             'UNPAID'}
                          </span>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{booking.paymentMethod}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700 hover:bg-green-50" onClick={() => updateStatus(booking._id, "confirmed")}>
                                 <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50" onClick={() => updateStatus(booking._id, "cancelled")}>
                                 <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {booking.paymentStatus === 'refund_pending' && (
                            <Button size="sm" variant="secondary" className="h-8 bg-orange-100 text-orange-800 hover:bg-orange-200 border-none font-bold text-[10px]" onClick={() => updatePaymentStatus(booking._id, "refunded")}>
                               <RotateCcw className="h-3 w-3 mr-1" /> MARK REFUNDED
                            </Button>
                          )}
                          {booking.status === 'blocked' && (
                             <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateStatus(booking._id, "cancelled")}>
                                Unblock
                             </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
