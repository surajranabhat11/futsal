"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedLoader } from "@/components/ui/animated-loader"

export default function LocationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [venues, setVenues] = useState<any[]>([])

  const fetchVenues = async (query = "") => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/venues?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setVenues(data.venues || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
      setIsPageLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const handleSearch = () => {
    fetchVenues(searchQuery)
  }

  if (isPageLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[150px] w-full rounded-lg" />
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location</h1>
        <p className="text-muted-foreground">Find futsal venues near you and check their availability.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Venues</CardTitle>
          <CardDescription>Find futsal venues by name or location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isSearching ? (
          Array(6)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-xl" />)
        ) : venues.length > 0 ? (
          venues.map((venue) => (
            <Card key={venue._id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              {venue.image ? (
                <div className="w-full h-48 relative bg-muted">
                  <img src={venue.image} alt={venue.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 relative bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl line-clamp-1">{venue.name}</CardTitle>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${venue.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {venue.isActive !== false ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{venue.address}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-0">
                {venue.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4 flex-1">
                    {venue.description}
                  </p>
                )}
                {!venue.description && <div className="flex-1" />}
                
                <div className="space-y-1 text-sm mt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">Rs. {venue.pricePerHour || 1500}/hr</span>
                  </div>
                  {venue.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{venue.phone}</span>
                    </div>
                  )}
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Facilities:</span>
                      <span className="font-medium line-clamp-1 text-right max-w-[150px]">{venue.amenities.join(", ")}</span>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full mt-6 bg-[#60bb46] hover:bg-[#4d9638]" disabled={venue.isActive === false}>
                  <a href={`/dashboard/location/${venue._id}`}>Book Now</a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No venues found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
