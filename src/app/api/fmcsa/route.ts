import { NextRequest, NextResponse } from "next/server";

const FMCSA_KEY = process.env.FMCSA_WEB_KEY ?? "";
const BASE = "https://mobile.fmcsa.dot.gov/qc/services";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "name"; // name | dot | mc

  if (!query) return NextResponse.json({ error: "q is required" }, { status: 400 });

  if (!FMCSA_KEY) {
    // Return mock data when no API key configured
    return NextResponse.json({
      mock: true,
      results: getMockCarriers(query),
    });
  }

  try {
    let url: string;
    if (type === "dot") {
      url = `${BASE}/carriers/${query}?webKey=${FMCSA_KEY}`;
    } else if (type === "mc") {
      url = `${BASE}/carriers/docket-number/${query}?webKey=${FMCSA_KEY}`;
    } else {
      url = `${BASE}/carriers/name/${encodeURIComponent(query)}?webKey=${FMCSA_KEY}`;
    }

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await res.json();
    return NextResponse.json({ mock: false, results: data?.content ?? [] });
  } catch {
    return NextResponse.json({ mock: true, results: getMockCarriers(query) });
  }
}

function getMockCarriers(q: string) {
  const base = [
    { legalName: "Midwest Express Carriers LLC", dotNumber: "1234567", mcNumber: "MC-987654", city: "Chicago", state: "IL", phone: "312-555-0198", entityType: "CARRIER", safetyRating: "Satisfactory", powerUnits: 24, drivers: 31 },
    { legalName: "Great Lakes Freight Inc", dotNumber: "2345678", mcNumber: "MC-876543", city: "Detroit", state: "MI", phone: "313-555-0145", entityType: "CARRIER", safetyRating: "Satisfactory", powerUnits: 12, drivers: 15 },
    { legalName: "Lone Star Logistics", dotNumber: "3456789", mcNumber: "MC-765432", city: "Dallas", state: "TX", phone: "214-555-0172", entityType: "CARRIER", safetyRating: "Conditional", powerUnits: 8, drivers: 10 },
    { legalName: "Pacific Coast Transport", dotNumber: "4567890", mcNumber: "MC-654321", city: "Los Angeles", state: "CA", phone: "213-555-0134", entityType: "CARRIER", safetyRating: "Satisfactory", powerUnits: 45, drivers: 52 },
    { legalName: "Mountain West Hauling", dotNumber: "5678901", mcNumber: "MC-543210", city: "Denver", state: "CO", phone: "720-555-0156", entityType: "CARRIER", safetyRating: "Satisfactory", powerUnits: 6, drivers: 8 },
    { legalName: "Atlantic Freight Solutions", dotNumber: "6789012", mcNumber: "MC-432109", city: "Atlanta", state: "GA", phone: "404-555-0178", entityType: "CARRIER", safetyRating: "Satisfactory", powerUnits: 18, drivers: 22 },
  ];
  return base.filter((c) => c.legalName.toLowerCase().includes(q.toLowerCase()) || q.length < 3);
}
