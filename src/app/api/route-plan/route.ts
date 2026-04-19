import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const olat = params.get("olat");
  const olon = params.get("olon");
  const dlat = params.get("dlat");
  const dlon = params.get("dlon");
  const profile = params.get("profile") ?? "driving-hgv"; // heavy goods vehicle

  if (!olat || !olon || !dlat || !dlon) {
    return NextResponse.json({ error: "olat, olon, dlat, dlon required" }, { status: 400 });
  }

  try {
    // OSRM public API — completely free, no key required
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${olon},${olat};${dlon},${dlat}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(osrmUrl, { next: { revalidate: 0 } });
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) {
      return NextResponse.json({ error: "No route found" }, { status: 404 });
    }

    const route = data.routes[0];
    const distanceMeters: number = route.distance;
    const durationSeconds: number = route.duration;
    const geometry = route.geometry; // GeoJSON LineString

    const distanceMiles = distanceMeters * 0.000621371;
    const durationHours = durationSeconds / 3600;

    // Sample waypoints along route for weather (every ~33% of route)
    const coords: [number, number][] = geometry.coordinates;
    const step = Math.floor(coords.length / 3);
    const waypoints = [
      { lat: coords[0][1], lon: coords[0][0], label: "Origin" },
      { lat: coords[Math.min(step, coords.length - 1)][1], lon: coords[Math.min(step, coords.length - 1)][0], label: "Midpoint" },
      { lat: coords[coords.length - 1][1], lon: coords[coords.length - 1][0], label: "Destination" },
    ];

    return NextResponse.json({
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      durationHours: Math.round(durationHours * 10) / 10,
      geometry,
      waypoints,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
