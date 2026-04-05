"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Trash2, Search, Clock, Layers } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VenueRecord {
  _id: string
  name: string
  address: string
  description?: string
  amenities?: string[]
  openingHours?: string
  createdBy: { name: string; email: string }
  createdAt: string
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<VenueRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/venues?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => { setVenues(data.venues || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/admin/venues/${id}`, { method: "DELETE" })
    setVenues((prev) => prev.filter((v) => v._id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Venues</h2>
        <span className="text-sm text-gray-500">{venues.length} total</span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No venues found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Venue</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Amenities</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Hours</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Added By</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v._id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {v.amenities?.length ? v.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {a}
                          </span>
                        )) : <span className="text-gray-400">—</span>}
                        {(v.amenities?.length ?? 0) > 3 && (
                          <span className="text-xs text-gray-400">+{v.amenities!.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {v.openingHours || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {v.createdBy?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete <strong>{v.name}</strong>? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(v._id)}
                            >
                              {deleting === v._id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
