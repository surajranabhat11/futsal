"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface Venue {
  _id: string
  name: string
  address: string
  location: {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
  }
  rating: number
  price: string
  facilities: string[]
  availability: boolean
  availableSlots?: {
    date: string
    slots: {
      time: string
      isBooked: boolean
    }[]
  }[]
  createdAt: string
}

interface VenueContextType {
  venues: Venue[]
  selectedVenue: Venue | null
  isLoading: boolean
  isSearching: boolean
  isBooking: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchVenues: (query: string) => Promise<void>
  selectVenue: (venueId: string) => void
  bookVenue: (venueId: string, date: string, time: string) => Promise<boolean>
  refreshVenues: () => Promise<void>
}

const VenueContext = createContext<VenueContextType | null>(null)

export function useVenue() {
  const context = useContext(VenueContext)
  if (!context) {
    throw new Error("useVenue must be used within a VenueProvider")
  }
  return context
}

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch venues
  const fetchVenues = useCallback(async () => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/venues")

      if (!response.ok) {
        throw new Error("Failed to fetch venues")
      }

      const data = await response.json()

      if (data.venues) {
        setVenues(data.venues)
      }
    } catch (error) {
      console.error("Error fetching venues:", error)
      toast({
        title: "Error",
        description: "Failed to load venues",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchVenues()
    }
  }, [session, fetchVenues])

  // Search venues
  const searchVenues = useCallback(
    async (query: string) => {
      if (!session?.user) return

      setIsSearching(true)

      try {
        const response = await fetch(`/api/venues?name=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error("Failed to search venues")
        }

        const data = await response.json()

        if (data.venues) {
          setVenues(data.venues)
        }
      } catch (error) {
        console.error("Error searching venues:", error)
        toast({
          title: "Error",
          description: "Failed to search venues",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    },
    [session, toast],
  )

  // Select venue
  const selectVenue = useCallback(
    (venueId: string) => {
      const venue = venues.find((v) => v._id === venueId)
      setSelectedVenue(venue || null)
    },
    [venues],
  )

  // Book venue
  const bookVenue = useCallback(
    async (venueId: string, date: string, time: string) => {
      if (!session?.user) return false

      setIsBooking(true)

      try {
        const response = await fetch("/api/venues/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venueId,
            date,
            time,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to book venue")
        }

        toast({
          title: "Booking Confirmed",
          description: "Your venue has been booked successfully",
          variant: "success",
        })

        // Refresh venues to update availability
        await fetchVenues()

        return true
      } catch (error) {
        console.error("Error booking venue:", error)
        toast({
          title: "Error",
          description: "Failed to book venue",
          variant: "destructive",
        })
        return false
      } finally {
        setIsBooking(false)
      }
    },
    [session, fetchVenues, toast],
  )

  const value = {
    venues,
    selectedVenue,
    isLoading,
    isSearching,
    isBooking,
    searchQuery,
    setSearchQuery,
    searchVenues,
    selectVenue,
    bookVenue,
    refreshVenues: fetchVenues,
  }

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>
}
