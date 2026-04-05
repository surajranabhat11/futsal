/**
 * Geocoding utility using OpenStreetMap Nominatim API.
 * Free to use, no API key required.
 * Returns [longitude, latitude] for GeoJSON, or null if not found.
 */
export async function geocodeLocation(
  locationString: string
): Promise<[number, number] | null> {
  if (!locationString || locationString.trim() === "") return null;

  try {
    const encoded = encodeURIComponent(locationString.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent
        "User-Agent": "FutsalMatchmakingSystem/1.0 (herald-college-project)",
      },
    });

    if (!response.ok) return null;

    const results = await response.json();

    if (!results || results.length === 0) return null;

    const { lon, lat } = results[0];
    // GeoJSON uses [longitude, latitude] order
    return [parseFloat(lon), parseFloat(lat)];
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
