"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VenueDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [playerPhone, setPlayerPhone] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("esewa")

  useEffect(() => {
    // In a real app we'd fetch specific venue by id from /api/venues/[id]
    // Since we don't have that yet, let's fetch all and filter or assume it's created.
    // Let's create an API endpoint /api/venues/[id] first, but for now let's just assume we get it.
    const fetchVenue = async () => {
      try {
        const res = await fetch(`/api/venues/${id}`)
        if (res.ok) {
          const data = await res.json()
          setVenue(data.venue)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVenue()
  }, [id])

  const handleBook = async () => {
    if (!date || !startTime || !endTime || !playerPhone) {
      setError("Please fill all fields")
      return
    }

    setBookingLoading(true)
    setError("")

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: id,
          date,
          startTime,
          endTime,
          playerPhone,
          paymentMethod
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to book")
        setBookingLoading(false)
        return
      }

      // If hand cash, just redirect to bookings
      if (paymentMethod === "cash") {
        router.push("/dashboard/bookings")
        return
      }

      // If eSewa, initiate payment
      const paymentRes = await fetch("/api/payment/esewa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data.booking.totalAmount, bookingId: data.booking._id })
      })

      const paymentDataResult = await paymentRes.json()

      if (paymentDataResult.paymentData) {
        const pd = paymentDataResult.paymentData
        const form = document.createElement("form")
        form.setAttribute("method", "POST")
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form")
        for (const key in pd) {
          const hiddenField = document.createElement("input")
          hiddenField.setAttribute("type", "hidden")
          hiddenField.setAttribute("name", key)
          hiddenField.setAttribute("value", pd[key])
          form.appendChild(hiddenField)
        }
        document.body.appendChild(form)
        form.submit()
      } else {
        router.push("/dashboard/bookings")
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred")
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading venue details...</div>
  if (!venue) return <div className="p-8 text-red-500">Venue not found (Note: Requires /api/venues/[id] endpoint)</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <Card className="overflow-hidden">
        {venue.image && (
          <div className="w-full h-48 sm:h-64 relative">
            <img 
              src={venue.image} 
              alt={venue.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">{venue.name}</CardTitle>
          <p className="text-muted-foreground">{venue.address}</p>
          {venue.description && <p className="text-sm mt-2">{venue.description}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium">Price per hour</p>
              <p className="text-lg">Rs. {venue.pricePerHour || 1500}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Courts</p>
              <p className="text-lg">{venue.courts || 1}</p>
            </div>
            {venue.phone && (
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-lg">{venue.phone}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-lg">Book this venue</h3>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input type="tel" value={playerPhone} onChange={(e) => setPlayerPhone(e.target.value)} placeholder="e.g. 98XXXXXXXX" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">End Time</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" value="esewa" checked={paymentMethod === "esewa"} onChange={() => setPaymentMethod("esewa")} />
                  <span className="text-sm">eSewa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} />
                  <span className="text-sm">Hand Cash (Pay at Venue)</span>
                </label>
              </div>
            </div>

            <Button className="w-full mt-4 bg-[#60bb46] hover:bg-[#4d9638]" onClick={handleBook} disabled={bookingLoading}>
              {bookingLoading ? "Processing..." : paymentMethod === "esewa" ? "Pay with eSewa" : "Book Now (Pay at Venue)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
