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
  const [isMapLoading, setIsMapLoading] = useState(true)

  // Mock futsal venues data
  const mockVenues = [
    {
      id: 1,
      name: "Futsal Arena",
      address: "Thamel, Kathmandu",
      distance: 1.2,
      rating: 4.7,
      price: "Rs. 1500/hour",
      facilities: ["Covered Court", "Changing Rooms", "Parking"],
      availability: true,
    },
    {
      id: 2,
      name: "Sports Complex",
      address: "Lalitpur",
      distance: 3.5,
      rating: 4.5,
      price: "Rs. 1800/hour",
      facilities: ["Covered Court", "Changing Rooms", "Cafeteria", "Parking"],
      availability: true,
    },
    {
      id: 3,
      name: "Goal Zone Futsal",
      address: "Bhaktapur",
      distance: 5.2,
      rating: 4.3,
      price: "Rs. 1400/hour",
      facilities: ["Covered Court", "Changing Rooms"],
      availability: false,
    },
  ]

  const [venues, setVenues] = useState(mockVenues)

  // Simulate initial page loading
  useEffect(() => {
    const pageTimer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1200)

    const mapTimer = setTimeout(() => {
      setIsMapLoading(false)
    }, 2000)

    return () => {
      clearTimeout(pageTimer)
      clearTimeout(mapTimer)
    }
  }, [])

  const handleSearch = () => {
    setIsSearching(true)

    // Simulate API call with a delay
    setTimeout(() => {
      if (searchQuery) {
        const filteredVenues = mockVenues.filter(
          (venue) =>
            venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.address.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setVenues(filteredVenues)
      } else {
        setVenues(mockVenues)
      }
      setIsSearching(false)
    }, 800)
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

        <Skeleton className="h-[400px] w-full rounded-lg" />
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Nearby Venues</h2>
        {isSearching ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-[150px] w-full rounded-lg" />)
        ) : venues.length > 0 ? (
          venues.map((venue) => (
            <Card key={venue.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{venue.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${venue.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {venue.availability ? "Available" : "Booked"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {venue.address} ({venue.distance} km away)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rating:</span> {venue.rating}/5
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Price:</span> {venue.price}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Facilities:</span> {venue.facilities.join(", ")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 md:mt-0">
                    <Button disabled={!venue.availability}>Book Now</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No venues found matching your search.</p>
          </div>
        )}
      </div>

      <div className="h-[400px] rounded-lg border bg-muted flex items-center justify-center">
        {isMapLoading ? (
          <AnimatedLoader size="lg" text="Loading map..." />
        ) : (
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Map View</h3>
            <p className="mt-2 text-sm text-muted-foreground">Interactive map will be displayed here</p>
            <Button className="mt-4" variant="outline" onClick={() => alert("Google Maps integration coming soon!")}>
              Enable Location
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
