"use client"

import { CalendarDays, MapPin, CheckCircle, Activity, Banknote, RotateCcw, ArrowRight, Store } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalBookings: 0,
    pendingBookings: 0,
    pendingRefunds: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [venuesRes, bookingsRes] = await Promise.all([
          fetch("/api/owner/venues"),
          fetch("/api/owner/bookings")
        ])
        const venuesData = await venuesRes.json()
        const bookingsData = await bookingsRes.json()

        const venues = venuesData.venues || []
        const bookings = bookingsData.bookings || []

        setStats({
          totalVenues: venues.length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === "pending").length,
          pendingRefunds: bookings.filter((b: any) => b.paymentStatus === "refund_pending").length,
          totalEarnings: bookings.filter((b: any) => b.paymentStatus === "paid").reduce((sum: number, b: any) => sum + b.totalAmount, 0)
        })
      } catch (error) {
        console.error("Failed to fetch stats", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-10 w-64" />
           <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Manage your futsal business and track performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/owner-dashboard/venues">
              <Button size="sm">Manage Venues</Button>
           </Link>
        </div>
      </div>

      {/* NOTICES */}
      {stats.pendingRefunds > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
          <CardContent className="p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                   <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                   <p className="font-semibold text-orange-800 dark:text-orange-300">Pending Refunds</p>
                   <p className="text-sm text-orange-700/80 dark:text-orange-400/80">You have {stats.pendingRefunds} refund requests to process.</p>
                </div>
             </div>
             <Link href="/owner-dashboard/bookings">
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-100 text-orange-700">View Requests</Button>
             </Link>
          </CardContent>
        </Card>
      )}

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border hover:shadow-sm transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVenues}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-sm transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-sm transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                   <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                   {stats.pendingBookings > 0 && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1 h-4 min-w-4 flex justify-center text-[10px]">!</Badge>}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:shadow-sm transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">Rs. {stats.totalEarnings}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
               <CardTitle className="text-lg">Recent Performance</CardTitle>
               <CardDescription>How your venues are doing lately</CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center border-t">
               <div className="text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Analytics graph will appear here as more data is collected.</p>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader>
               <CardTitle className="text-lg">Quick Tip</CardTitle>
               <CardDescription className="text-primary-foreground/70 text-xs">Maximize your bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm">Adding clear photos and a detailed description of your amenities (like showers, parking, or cafe) increases booking rates by up to 40%.</p>
               <Link href="/owner-dashboard/venues">
                  <Button variant="secondary" size="sm" className="w-full">Update Venue Info <ArrowRight className="ml-2 h-3 w-3" /></Button>
               </Link>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
