import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=us`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DispatchPro/1.0 (dispatch-pro-app)" },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return NextResponse.json(
      data.map((r: any) => ({
        display: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
        type: r.type,
      }))
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
