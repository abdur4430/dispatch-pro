import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "loads";

  if (type === "loads") return NextResponse.json({ data: getMockLoads() });
  if (type === "jobs") return NextResponse.json({ data: getMockJobs() });
  if (type === "news") return NextResponse.json({ data: await fetchTruckingNews() });

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}

async function fetchTruckingNews() {
  try {
    // FreightwavesRSS and Trucking News RSS feeds (public, no key needed)
    const rssUrl = "https://api.rss2json.com/v1/api.json?rss_url=https://www.freightwaves.com/news/feed";
    const res = await fetch(rssUrl, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("RSS fetch failed");
    const data = await res.json();
    return (data.items ?? []).slice(0, 8).map((item: any) => ({
      title: item.title,
      summary: item.description?.replace(/<[^>]+>/g, "").slice(0, 160) + "…",
      url: item.link,
      published: item.pubDate,
      source: "FreightWaves",
    }));
  } catch {
    return getMockNews();
  }
}

function getMockLoads() {
  return [
    { id: "L1", origin: "Chicago, IL", dest: "Dallas, TX", distance: 917, weight: 42000, rate: 3200, ratePerMile: 3.49, equipment: "Dry Van", pickup: "2026-04-21", delivery: "2026-04-23", broker: "Echo Global Logistics", contact: "1-800-354-7993", loadId: "EGL-2847531" },
    { id: "L2", origin: "Los Angeles, CA", dest: "Phoenix, AZ", distance: 372, weight: 38000, rate: 1400, ratePerMile: 3.76, equipment: "Reefer", pickup: "2026-04-20", delivery: "2026-04-20", broker: "Coyote Logistics", contact: "1-877-669-9883", loadId: "COY-1938472" },
    { id: "L3", origin: "Atlanta, GA", dest: "Charlotte, NC", distance: 245, weight: 44000, rate: 1100, ratePerMile: 4.49, equipment: "Flatbed", pickup: "2026-04-22", delivery: "2026-04-22", broker: "CH Robinson", contact: "1-888-472-2456", loadId: "CHR-7261849" },
    { id: "L4", origin: "Houston, TX", dest: "Memphis, TN", distance: 485, weight: 36000, rate: 1650, ratePerMile: 3.40, equipment: "Dry Van", pickup: "2026-04-21", delivery: "2026-04-22", broker: "Transplace", contact: "1-888-428-0669", loadId: "TRP-3847291" },
    { id: "L5", origin: "Detroit, MI", dest: "Columbus, OH", distance: 167, weight: 40000, rate: 850, ratePerMile: 5.09, equipment: "Dry Van", pickup: "2026-04-20", delivery: "2026-04-20", broker: "XPO Logistics", contact: "1-800-755-2728", loadId: "XPO-9182736" },
    { id: "L6", origin: "Seattle, WA", dest: "Portland, OR", distance: 178, weight: 34000, rate: 800, ratePerMile: 4.49, equipment: "Reefer", pickup: "2026-04-23", delivery: "2026-04-23", broker: "Worldwide Express", contact: "1-800-758-3559", loadId: "WWE-5647382" },
    { id: "L7", origin: "Kansas City, MO", dest: "Denver, CO", distance: 601, weight: 45000, rate: 2100, ratePerMile: 3.49, equipment: "Flatbed", pickup: "2026-04-22", delivery: "2026-04-23", broker: "MoLo Solutions", contact: "1-312-462-0669", loadId: "MOL-2938471" },
    { id: "L8", origin: "Miami, FL", dest: "Orlando, FL", distance: 236, weight: 28000, rate: 1050, ratePerMile: 4.45, equipment: "Dry Van", pickup: "2026-04-21", delivery: "2026-04-21", broker: "GlobalTranz", contact: "1-866-275-1244", loadId: "GTZ-8374651" },
  ];
}

function getMockJobs() {
  return [
    { id: "J1", company: "Werner Enterprises", city: "Omaha", state: "NE", type: "OTR Driver", cdl: "Class A", pay: "$0.55–0.65/mile", sign_on_bonus: "$5,000", benefits: ["Medical", "Dental", "401k", "Paid vacation"], contact: "1-800-346-2818", url: "https://www.werner.com/drivers/" },
    { id: "J2", company: "J.B. Hunt Transport", city: "Lowell", state: "AR", type: "Regional Driver", cdl: "Class A", pay: "$65,000–$80,000/yr", sign_on_bonus: "$3,000", benefits: ["Medical", "Vision", "Life Insurance", "Pet policy"], contact: "1-800-523-9485", url: "https://www.jbhunt.com/careers/" },
    { id: "J3", company: "Schneider National", city: "Green Bay", state: "WI", type: "Dedicated Driver", cdl: "Class A", pay: "$70,000–$90,000/yr", sign_on_bonus: "$7,500", benefits: ["Medical", "Dental", "401k", "Tuition assistance"], contact: "1-800-477-7433", url: "https://www.schneider.com/driver-jobs/" },
    { id: "J4", company: "Swift Transportation", city: "Phoenix", state: "AZ", type: "OTR Driver", cdl: "Class A", pay: "$0.50–0.60/mile", sign_on_bonus: "$4,000", benefits: ["Medical", "Dental", "Vision", "401k"], contact: "1-888-977-9438", url: "https://www.swifttrans.com/drivers" },
    { id: "J5", company: "Landstar System", city: "Jacksonville", state: "FL", type: "Owner-Operator", cdl: "Class A", pay: "Up to 70% of load", sign_on_bonus: null, benefits: ["Fuel discounts", "Insurance programs", "Flexible schedule"], contact: "1-800-872-9677", url: "https://www.landstar.com/agents-and-drivers/" },
    { id: "J6", company: "Old Dominion Freight", city: "Thomasville", state: "NC", type: "LTL Driver", cdl: "Class A", pay: "$75,000–$95,000/yr", sign_on_bonus: "$2,500", benefits: ["Profit sharing", "Medical", "Dental", "Vision"], contact: "1-800-432-6335", url: "https://www.odfl.com/careers/" },
  ];
}

function getMockNews() {
  return [
    { title: "Freight rates show signs of recovery in Q2 2026", summary: "Spot market dry van rates have risen 4.2% week-over-week as spring produce season kicks off and capacity tightens in the Southeast corridor.", url: "#", published: "2026-04-19", source: "FreightWaves" },
    { title: "ELD mandate enforcement update: new guidance issued", summary: "FMCSA has issued clarification on short-haul exemptions and expanded the livestock provision to include additional commodity types.", url: "#", published: "2026-04-18", source: "TruckingInfo" },
    { title: "Diesel prices drop for third consecutive week", summary: "National average diesel price fell to $3.68/gallon, providing relief to carriers as fuel surcharge thresholds adjust downward.", url: "#", published: "2026-04-17", source: "DOE EIA" },
    { title: "Driver shortage projected to reach 82,000 by end of year", summary: "ATA's annual report highlights ongoing driver recruitment challenges, with turnover rates at large truckload carriers remaining above 90%.", url: "#", published: "2026-04-16", source: "ATA" },
    { title: "Bridge weight limit updates affect key Midwest corridors", summary: "Infrastructure improvement projects temporarily reduce load limits on key I-80 and I-94 segments through June 2026.", url: "#", published: "2026-04-15", source: "FHWA" },
  ];
}
