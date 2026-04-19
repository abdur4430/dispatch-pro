"use client";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Truck, Weight, Ruler, MapPin, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Info, Shield, Wrench, DollarSign, FileText, Clock } from "lucide-react";

type Tab = "types" | "regulations" | "cargo" | "maintenance" | "permits";

const TRUCK_DATA = [
  {
    id: "cargo-van",
    name: "Cargo Van",
    category: "Light Commercial",
    catColor: "text-sky-400",
    catBg: "bg-sky-500/10",
    catBorder: "border-sky-500/30",
    specs: { gvwr: "Up to 8,500 lbs", payload: "2,000–3,500 lbs", length: "8–10 ft cargo bay", width: "5.5 ft", height: "4.5–5.5 ft", fuel: "Gas/Diesel", mpg: "14–22 MPG", cdl: "None required", driverAge: "21+ interstate" },
    uses: ["E-commerce last-mile", "Food & grocery delivery", "Medical supplies", "Documents & parcels", "HVAC parts", "Flower delivery"],
    bestFor: "Urban last-mile delivery in metro areas. Ideal when speed, parking flexibility, and low overhead matter more than payload.",
    avoid: "Palletized freight. Anything over 3,500 lbs. Long interstate hauls where payload efficiency suffers.",
    rateRange: "$0.80–$1.40/mile (courier) | $80–$180/day (rental markets)",
    topBrokers: ["Amazon Flex", "DoorDash Drive", "Roadie", "uShip (small)", "GoShip"],
    insurance: "$300,000 liability (FMCSA minimum for interstate) | Cargo: $5,000–$20,000",
    regulations: ["No CDL for under 10,001 lbs GVWR", "FMCSA registration if crossing state lines with compensation", "DOT medical card may be required interstate", "Hours of Service apply if GVWR >10,000 lbs OR for-hire interstate"],
    tips: ["Roof racks multiply cargo space", "Partition wall protects cab from shifting loads", "Cargo tie-down rings should be floor-mounted", "Temperature control units available for food delivery"],
  },
  {
    id: "sprinter",
    name: "Sprinter Van (144\"–170\" WB)",
    category: "Light Commercial",
    catColor: "text-sky-400",
    catBg: "bg-sky-500/10",
    catBorder: "border-sky-500/30",
    specs: { gvwr: "8,550–11,030 lbs", payload: "3,000–5,500 lbs", length: "144–170\" wheelbase", width: "6.5 ft", height: "5.5–6.5 ft standing", fuel: "Diesel", mpg: "20–25 MPG highway", cdl: "None (under 26,001 GVWR)", driverAge: "21+ interstate" },
    uses: ["Expedited freight", "Medical equipment", "Trade show logistics", "Luxury van conversion", "Mobile office", "Airport shuttle cargo"],
    bestFor: "High-value per-mile expedited freight where a semi isn't justified. Excellent ROI per dollar of truck cost.",
    avoid: "Loads requiring lift gate (unless aftermarket). Anything requiring a forklift for loading.",
    rateRange: "$1.20–$2.50/mile (expedited) | $180–$350/day",
    topBrokers: ["Coyote (expedited)", "Landstar (owner-op)", "XPO Express", "Echo Global (expedited)", "Arrive Logistics"],
    insurance: "$750,000 liability (expedited carriers often require this) | Cargo: $25,000–$100,000",
    regulations: ["Class B CDL if over 26,000 lbs GVWR (rare for sprinters)", "FMCSA Operating Authority (MC number) required for interstate for-hire", "IFTA fuel tax if operating in multiple states", "Annual DOT inspection required"],
    tips: ["High-roof models allow standing — reduces load/unload fatigue", "Diesel gives 30% better fuel economy than gas equivalent", "Consider a 2-door rear vs. barn doors based on dock access needs", "Wheel chair lift accessories available for medical transport"],
  },
  {
    id: "box-16",
    name: "Box Truck 16 ft",
    category: "Medium Duty",
    catColor: "text-blue-400",
    catBg: "bg-blue-500/10",
    catBorder: "border-blue-500/30",
    specs: { gvwr: "12,500–19,500 lbs", payload: "5,000–10,000 lbs", length: "16 ft box", width: "7.5 ft", height: "7 ft interior", fuel: "Gas/Diesel", mpg: "8–13 MPG", cdl: "Class B if over 26,000 GVWR", driverAge: "21+ interstate" },
    uses: ["Furniture delivery (single pieces)", "Appliances", "Local LTL", "Retail store restocking", "Office moves", "Catering & events"],
    bestFor: "Urban and suburban metro delivery where a 26ft truck won't fit or isn't needed. High activity density in cities.",
    avoid: "Multi-pallet loads (inefficient). Interstate hauls over 500 miles.",
    rateRange: "$1.20–$2.00/mile | $180–$350/day",
    topBrokers: ["GoShip", "uShip", "Convoy (small loads)", "Uber Freight", "Flock Freight"],
    insurance: "$300,000–$1M liability | Cargo: $10,000–$50,000",
    regulations: ["CDL Class B if GVWR exceeds 26,000 lbs", "DOT number required for interstate commerce", "Annual vehicle inspection", "Hours of Service if commercial motor vehicle"],
    tips: ["Liftgate models are critical for residential delivery", "12V 110V inverters for refrigerated goods", "GPS tracking mandatory for fleet management", "Cargo tracking systems (scanning) improve delivery efficiency"],
  },
  {
    id: "box-26",
    name: "Box Truck 24–26 ft",
    category: "Medium Duty",
    catColor: "text-blue-400",
    catBg: "bg-blue-500/10",
    catBorder: "border-blue-500/30",
    specs: { gvwr: "19,500–26,000 lbs", payload: "10,000–14,000 lbs", length: "24–26 ft box", width: "8 ft", height: "8 ft interior", fuel: "Diesel", mpg: "7–10 MPG", cdl: "Class B required over 26,000 lbs GVWR", driverAge: "21+ interstate" },
    uses: ["Regional LTL freight", "Appliance multi-stop delivery", "Trade show & exhibition", "White-glove furniture delivery", "Distribution center replenishment", "Agricultural produce"],
    bestFor: "The most versatile medium-duty truck. Dominant in retail supply chains and white-glove delivery operations.",
    avoid: "Loads over 14,000 lbs. Do not attempt to exceed GVWR — this is a common and dangerous mistake.",
    rateRange: "$1.80–$3.00/mile | $300–$700/day",
    topBrokers: ["XPO Logistics", "Echo Global", "CH Robinson (LTL division)", "Estes Express", "Saia"],
    insurance: "$1M liability minimum for most loads | Cargo: $25,000–$100,000",
    regulations: ["Class B CDL mandatory if GVWR exceeds 26,000 lbs", "Tandem axle models may require axle weight verification", "Bridge formula compliance required", "Oversized load flags if load overhangs more than 4 ft rear"],
    tips: ["Air-ride suspension reduces product damage on fragile freight", "Side doors enable dock loading without rear access", "Strapping system: minimum 4 per 26 ft (1 strap per 400 lbs)", "E-track systems are far superior to rope hooks for cargo control"],
  },
  {
    id: "flatbed-48",
    name: "Flatbed 48 ft",
    category: "Heavy Duty",
    catColor: "text-orange-400",
    catBg: "bg-orange-500/10",
    catBorder: "border-orange-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "48,000 lbs legal", length: "48 ft deck", width: "8.5 ft", height: "5 ft deck height", fuel: "Diesel", mpg: "5.5–7 MPG", cdl: "Class A required", driverAge: "21+ interstate CDL" },
    uses: ["Steel & metal products", "Lumber & building materials", "Heavy machinery", "Construction equipment", "Military equipment", "Prefabricated structures"],
    bestFor: "Open-deck loads that can't be enclosed. Construction industry is the biggest customer — consistent year-round demand in growth markets.",
    avoid: "Rain-sensitive cargo without tarping. Anything requiring temperature control.",
    rateRange: "$2.50–$4.50/mile | premium for oversize",
    topBrokers: ["Landstar", "CH Robinson", "Coyote", "Mercer Transportation", "Echo Global"],
    insurance: "$750,000–$1M liability | Cargo: $100,000+ (equipment-specific)",
    regulations: ["Class A CDL mandatory", "Annual DOT inspection", "Cargo securement: FMCSA Part 392.9 and Part 393", "Minimum 4 tie-downs for 48 ft load", "Width > 8.5 ft requires oversize permit", "Height > 13.6 ft requires permit in most states"],
    tips: ["Tarping is an art — practice before solo runs", "Chains vs. straps: straps for most loads, chains for machinery", "Coil racks prevent steel coil rolling — essential safety equipment", "Corner protectors prevent strap damage to lumber"],
  },
  {
    id: "step-deck",
    name: "Step Deck / Drop Deck",
    category: "Heavy Duty",
    catColor: "text-orange-400",
    catBg: "bg-orange-500/10",
    catBorder: "border-orange-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "42,000–46,000 lbs", length: "48–53 ft (upper + lower deck)", width: "8.5 ft", height: "Upper: 3.5 ft | Lower: 10 ft", fuel: "Diesel", mpg: "5.5–6.5 MPG", cdl: "Class A required", driverAge: "21+ interstate CDL" },
    uses: ["Tall construction equipment (8.5–10 ft tall)", "Farm equipment", "Industrial machinery", "Large vehicles (UTVs, excavators)", "Mobile homes (some)", "Precast concrete"],
    bestFor: "Equipment too tall for a standard flatbed but not heavy enough to need a lowboy. Commands premium rates — specialized equipment knowledge required.",
    avoid: "Very heavy loads (use lowboy). Loads over 10 ft tall without permits.",
    rateRange: "$2.75–$5.00/mile | $3,500–$8,000/load (dedicated)",
    topBrokers: ["Landstar", "Worldwide Express", "Mode Transportation", "AIT Worldwide", "Universal Truckload"],
    insurance: "$1M liability | Cargo: $150,000+",
    regulations: ["Class A CDL mandatory", "Upper deck load height: stays under 13.6 ft typically", "Lower deck: allows up to 10 ft tall loads (varies by state)", "Rear axle weight: 34,000 lbs tandem limit", "Cargo securement critical — load shifts cause rollovers"],
    tips: ["Know your bridge heights on planned route before departure", "Ramps allow drive-on of small equipment — faster than crane loading", "Check state-specific height limits: some states are 13.5 ft, not 13.6 ft", "Agricultural equipment may have seasonal permit availability"],
  },
  {
    id: "lowboy",
    name: "Lowboy / RGN (Removable Gooseneck)",
    category: "Heavy Haul",
    catColor: "text-red-400",
    catBg: "bg-red-500/10",
    catBorder: "border-red-500/30",
    specs: { gvwr: "80,000+ lbs (with permits up to 200,000 lbs)", payload: "40,000–80,000 lbs (standard) | 200,000 lbs (heavy haul permits)", length: "29 ft well + 10 ft neck + 5 ft tail", width: "8.5 ft standard (wider with permits)", height: "Well deck: 18–24 inches (very low!)", fuel: "Diesel", mpg: "4–6 MPG (loaded)", cdl: "Class A + possible double/triple endorsement", driverAge: "21+ interstate CDL" },
    uses: ["Heavy construction equipment (excavators, dozers)", "Industrial generators & transformers", "Military tanks & vehicles", "Large mining equipment", "Offshore oil equipment", "Bridge girders & large structures"],
    bestFor: "Highest-paying freight in the industry. Specialized carriers with proper permits can charge $5–$15/mile. High barrier to entry = less competition.",
    avoid: "Without proper permits, oversize/overweight loads are illegal and dangerous. Never attempt without route survey, pilot cars, and state permits.",
    rateRange: "$4.00–$15.00/mile | $8,000–$50,000+/load",
    topBrokers: ["Heavy haul specialists only", "Anderson Trucking Service", "Landstar Heavy Haul", "Quality Carriers", "Custom broker contracts"],
    insurance: "$1M+ liability | Cargo: $250,000–$500,000+ (equipment-specific riders)",
    regulations: ["Class A CDL mandatory", "Oversize/overweight permits from EACH state crossed", "Pilot/escort cars required: typically 1 front + 1 rear for wide/tall loads", "Route survey required for loads over 200,000 lbs", "State patrol escort for some loads (varies by state)", "Travel restrictions: usually weekday daylight only, no holidays"],
    tips: ["Build relationships with permit agencies in each state you run", "GPS route planning must account for bridge weight ratings", "Removable gooseneck allows equipment to drive on — eliminates crane cost", "Retractable axles for empty moves improve fuel economy dramatically"],
  },
  {
    id: "dry-van",
    name: "Dry Van Semi 53 ft",
    category: "Class 8 Semi",
    catColor: "text-brand-400",
    catBg: "bg-brand-500/10",
    catBorder: "border-brand-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "44,000–48,000 lbs", length: "53 ft trailer", width: "8.5 ft", height: "13.6 ft (clearance)", fuel: "Diesel", mpg: "5.5–7.5 MPG (loaded)", cdl: "Class A required", driverAge: "21+ interstate CDL" },
    uses: ["Consumer packaged goods", "Food & beverage (non-temp)", "Electronics & appliances", "Retail distribution", "E-commerce fulfillment", "Paper & packaging", "Automotive parts (non-OEM)"],
    bestFor: "The backbone of American freight. Highest volume load type — finding freight is easiest in this category. Suitable for most shippers.",
    avoid: "Temperature-sensitive cargo. Hazmat without proper endorsement and placard. Overweight loads without permits.",
    rateRange: "$2.20–$3.80/mile (market-dependent) | spot vs. contract rates vary significantly",
    topBrokers: ["CH Robinson", "Echo Global", "Coyote Logistics", "Convoy", "Uber Freight", "Transplace", "GlobalTranz"],
    insurance: "$750,000–$1M liability | Cargo: $100,000 standard",
    regulations: ["Class A CDL mandatory", "FMCSA Operating Authority (MC number)", "UCR (Unified Carrier Registration) annual", "BOC-3 process agent filing", "Annual DOT inspection (vehicle)", "Quarterly IFTA fuel tax filing", "ELD (Electronic Logging Device) mandatory"],
    tips: ["Load bars prevent shifting — use minimum 2 per load", "Weight distribution: heavier freight toward nose of trailer", "Pintle hook vs. kingpin — know which landing gear your dolly needs", "Pre-trip inspection: lights, tires, brakes, coupling — takes 15–20 min"],
  },
  {
    id: "reefer",
    name: "Refrigerated (Reefer) 53 ft",
    category: "Class 8 Semi",
    catColor: "text-brand-400",
    catBg: "bg-brand-500/10",
    catBorder: "border-brand-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "42,000–44,000 lbs (reefer unit reduces payload)", length: "53 ft", width: "8.5 ft", height: "13.6 ft", fuel: "Diesel (truck + Thermo King/Carrier unit)", mpg: "5.0–6.5 MPG + reefer fuel", cdl: "Class A required", driverAge: "21+ interstate CDL" },
    uses: ["Fresh produce (berries, leafy greens, citrus)", "Meat & poultry", "Dairy & frozen foods", "Pharmaceuticals & vaccines", "Flowers & floral", "Temperature-sensitive chemicals", "Confectionery & chocolate"],
    bestFor: "Premium rates over dry van ($0.30–$0.80/mile more). Consistent demand from grocery chains. Produce season creates rate spikes.",
    avoid: "Loads requiring below -10°F (need super freezer units). Dry freight where reefer isn't needed — you're wasting fuel running the unit.",
    rateRange: "$2.60–$4.50/mile | produce season spikes to $5.00+",
    topBrokers: ["CH Robinson Produce", "Coyote (reefer)", "Echo Global", "Produce Junction", "MoLo Solutions", "RXO"],
    insurance: "$750,000–$1M liability | Cargo: $100,000+ (perishable spoilage rider)",
    regulations: ["Class A CDL mandatory", "Continuous temperature logs required (FDA FSMA)", "Pre-cooling trailer to set point before loading mandatory", "Produce loads: set point and load temp must be documented on BOL", "Reefer unit maintenance logs required by some shippers", "Annual CARB compliance (California reefer units)"],
    tips: ["Set reefer to 'continuous' not 'cycle-sentry' for sensitive produce", "Pre-cool to 2°F below set point before loading", "Return air temp matters as much as discharge air — understand the difference", "Fuel reefer unit separately — it's your second engine", "Temperature recorders (data loggers) are required by pharma shippers"],
  },
  {
    id: "tanker",
    name: "Tanker (Liquid / Dry Bulk)",
    category: "Class 8 Specialized",
    catColor: "text-purple-400",
    catBg: "bg-purple-500/10",
    catBorder: "border-purple-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "40,000–44,000 lbs (liquid) | 45,000+ lbs (dry bulk)", length: "40–45 ft (stainless/aluminum)", width: "8.5 ft", height: "13.5 ft typically", fuel: "Diesel", mpg: "4.5–6.5 MPG (loaded)", cdl: "Class A + Tanker (N) endorsement", driverAge: "21+ interstate CDL" },
    uses: ["Petroleum & fuel delivery", "Food-grade liquids (dairy, oils, juice)", "Industrial chemicals", "Water & potable liquids", "Dry bulk: grain, flour, cement, sand", "Pharmaceutical liquids"],
    bestFor: "Specialized endorsement commands 15–25% premium over dry van rates. Petroleum tankers have near-recession-proof demand.",
    avoid: "Mixed commodity loads (stainless food-grade tank cannot haul petroleum). Chemical incompatibility is a serious safety issue.",
    rateRange: "$3.00–$5.50/mile | chemical tankers $4.00–$7.00/mile",
    topBrokers: ["Kenan Advantage Group", "Quality Distribution", "Trimac Transportation", "Odyssey Logistics", "Martin Transport"],
    insurance: "$1M liability minimum | Hazmat endorsement required for flammables | Cargo: $100,000+",
    regulations: ["Class A CDL + Tanker (N) endorsement mandatory", "HAZMAT (H) endorsement for flammable/corrosive materials", "TSA background check for HAZMAT endorsement", "Placarding required based on commodity and quantity", "Bottom loading vs. top loading protocols per terminal", "Vapor recovery systems required at fuel terminals"],
    tips: ["Surge in liquid tankers affects braking — drive defensively", "Baffle tanks (internal baffles) are safer but harder to clean than unbaffled", "Know your tank's previous cargo — contamination is a costly mistake", "Pressure testing and leakage inspection before each load", "Bung wrench and API coupling tools always in cab"],
  },
  {
    id: "hazmat",
    name: "HAZMAT Carrier",
    category: "Class 8 Specialized",
    catColor: "text-purple-400",
    catBg: "bg-purple-500/10",
    catBorder: "border-purple-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "Varies by commodity and container", length: "Varies", width: "8.5 ft", height: "13.6 ft", fuel: "Diesel", mpg: "5.0–6.5 MPG", cdl: "Class A + HAZMAT endorsement (H)", driverAge: "21+ with clean record" },
    uses: ["Flammable liquids (fuel, paint, solvents)", "Corrosives (acids, batteries)", "Explosives", "Radioactive materials", "Compressed gases", "Oxidizers", "Poisons & toxic materials"],
    bestFor: "Premium rates and less competition. Chemical and manufacturing industries need reliable HAZMAT carriers year-round.",
    avoid: "Without proper training and endorsement, HAZMAT hauling is illegal and extremely dangerous.",
    rateRange: "$3.50–$8.00/mile (commodity-dependent)",
    topBrokers: ["Dedicated chemical carrier contracts", "Odyssey Logistics", "Univar Solutions", "Clean Harbors", "Veolia"],
    insurance: "$1M–$5M liability (depends on class of HAZMAT) | Pollution liability rider essential",
    regulations: ["Class A CDL + HAZMAT endorsement (H) mandatory", "TSA threat assessment (background check) — 30–60 day process", "Biennial HAZMAT endorsement re-certification", "49 CFR hazardous materials regulations training", "Placarding per DOT placard table (9 classes of hazmat)", "Emergency response info (CHEMTREC card) in cab at all times", "Route restrictions: tunnels, bridges, populated areas — varies by material", "Shipping papers (BOL) must list proper shipping name, class, ID number"],
    tips: ["CHEMTREC 24hr emergency line: 1-800-424-9300 — memorize it", "Placard early — incorrect placarding is a major violation", "Know your Class: 1 (explosives) through 9 (misc dangerous goods)", "ERP (Emergency Response Plan) must be in cab for certain commodities", "Never co-load incompatible materials — check segregation tables"],
  },
  {
    id: "auto-hauler",
    name: "Auto Transport / Car Hauler",
    category: "Class 8 Specialized",
    catColor: "text-purple-400",
    catBg: "bg-purple-500/10",
    catBorder: "border-purple-500/30",
    specs: { gvwr: "80,000 lbs (federal max)", payload: "7–10 vehicles per load", length: "75–80 ft overall (multi-level)", width: "8.5 ft", height: "13.6 ft (varies by load config)", fuel: "Diesel", mpg: "4.5–6 MPG (loaded)", cdl: "Class A required", driverAge: "21+ interstate CDL" },
    uses: ["New vehicle delivery (OEM dealer transport)", "Used vehicle dealer-to-dealer", "Auction transport (Manheim, ADESA)", "Insurance salvage vehicles", "Classic & specialty vehicle transport", "Fleet vehicle relocation"],
    bestFor: "OEM contracts are long-term and stable. Auction transport is high-volume. Single-car enclosed transport (exotic cars) commands $2–$4/mile.",
    avoid: "Loading damage is common — inspect every vehicle before loading. Damage claims are costly and complex.",
    rateRange: "$0.60–$1.20/vehicle/mile (OEM) | $1.50–$4.00/mile (enclosed specialty)",
    topBrokers: ["United Road", "Montway Auto Transport", "AmeriFreight", "Sherpa Auto Transport", "Direct OEM contracts"],
    insurance: "$750,000 liability | Vehicle damage cargo: $250,000–$500,000 (per vehicle rider)",
    regulations: ["Class A CDL mandatory", "Multi-level haulers exceed 53 ft length — length permits may be required in some states", "Height varies with load — always measure loaded height", "Tie-down per vehicle: minimum 4 chains/straps per vehicle", "State length limits: most allow 75–80 ft combinations for auto haulers"],
    tips: ["Condition report on every vehicle — sign and get shipper signature before loading", "Tires: check pressure on every vehicle to prevent blowouts while on deck", "Drive-line vehicles: check they start before loading (battery disconnect for long haul)", "Wheel straps: use properly rated straps (minimum 10,000 lb WLL per strap)"],
  },
];

const FEDERAL_REGS = [
  { rule: "Maximum Gross Vehicle Weight", detail: "80,000 lbs on Interstate Highway System (23 USC 127). Overweight permits issued by states individually.", icon: Weight, color: "text-red-400" },
  { rule: "Bridge Formula (FHWA)", detail: "W = 500(LN/N-1 + 12N + 36). Limits axle group weights based on spacing. Prevents bridge damage.", icon: AlertTriangle, color: "text-orange-400" },
  { rule: "Steer Axle: 12,000 lbs max", detail: "Federal steer axle weight limit. Many state scales check this specifically. Cannot be adjusted with load redistribution.", icon: Info, color: "text-yellow-400" },
  { rule: "Single Axle: 20,000 lbs max", detail: "Any single axle cannot exceed 20,000 lbs on the Interstate. State highways may differ.", icon: Info, color: "text-yellow-400" },
  { rule: "Tandem Axle: 34,000 lbs max", detail: "Two axles spaced 40–96 inches apart. The most common rear configuration on Class 8 trucks.", icon: Info, color: "text-yellow-400" },
  { rule: "Width: 8.5 ft (102 inches)", detail: "Federal limit. California allows 8.5 ft. Some states allow wider with permits. Load overhang counted.", icon: Ruler, color: "text-brand-400" },
  { rule: "Height: 13.6 ft (varies by state)", detail: "No federal height limit, but 13.6 ft is de facto standard. Some states: 13.5 ft. 14 ft in some western states.", icon: Ruler, color: "text-brand-400" },
  { rule: "Length: 53 ft max trailer on Interstate", detail: "Trailer max 53 ft on National Network. Combination length typically 65–75 ft. State laws vary significantly.", icon: Ruler, color: "text-brand-400" },
  { rule: "Hours of Service (HOS) — Property", detail: "11hr driving max in 14hr window. Must have 10hr off-duty break. 60/70hr weekly limits. 30-min break after 8hr.", icon: Clock, color: "text-green-400" },
  { rule: "ELD Mandate", detail: "Electronic Logging Device required for most CDL drivers. Exceptions: short-haul (within 150 air miles, return same day), vehicles manufactured before 2000.", icon: Shield, color: "text-green-400" },
];

const CARGO_SECUREMENT = [
  { cargo: "General Freight (Standard)", straps: "1 per 10 ft of load length, min 2", method: "E-track, J-hooks, or load bars", notes: "Working Load Limit: total aggregate ≥ 50% of cargo weight" },
  { cargo: "Steel Coils", straps: "Chains in cradle configuration", method: "Coil racks + 4 chains minimum", notes: "Eye up or eye forward for coils. Cradle angles must match coil diameter." },
  { cargo: "Lumber / Building Materials", straps: "1 per 10 ft of load, plus front header board", method: "Ratchet straps + corner protectors", notes: "Bunk boards prevent lateral movement. Headache rack protects cab." },
  { cargo: "Machinery", straps: "Chains preferred over straps for steel machinery", method: "4-point tie-down minimum", notes: "Block and brace wheels. Block prevents rolling. Drain fluids if required." },
  { cargo: "Vehicles", straps: "4 straps/chains per vehicle minimum", method: "Wheel straps (axle straps) preferred", notes: "Working Load Limit per strap ≥ vehicle weight / 4. Use rub rails only for secondary." },
  { cargo: "Concrete Pipe & Precast", straps: "Chained banding minimum", method: "Dunnage under pipe, chain over apex", notes: "Block all pipe sections. Never allow pipe-to-pipe contact without blocking." },
  { cargo: "Hazmat Packages", straps: "Per 49 CFR Part 393 and HAZMAT regulations", method: "Package-specific per DOT class", notes: "Labels must be visible. Segregation from incompatible materials." },
  { cargo: "Oversized / Heavy Haul", straps: "State permit specifies requirements", method: "Heavy chains, D-rings, load binders", notes: "Surveyor often required for loads >200,000 lbs. Route-specific securement plan." },
];

const MAINTENANCE = [
  { interval: "Pre-Trip (Daily)", items: ["Engine oil level", "Coolant level", "Air filter restriction indicator", "Brake adjustment — push rod travel", "Tire pressure + tread depth", "All lights functional", "Coupling inspection (5th wheel/kingpin)", "Air leaks — listen for hissing", "Wiper blades + washer fluid"], priority: "Legal Requirement" },
  { interval: "Weekly / 1,000 miles", items: ["Grease chassis fittings (if applicable)", "Power steering fluid", "Check belts for cracking/wear", "Battery terminals — corrosion", "Exhaust system visual inspection", "Fluid leak check under vehicle", "Reefer unit check (hours run + fuel)"], priority: "Preventive" },
  { interval: "Oil Change / 15,000–25,000 miles", items: ["Engine oil & filter (HDEO — Heavy Duty Engine Oil)", "Fuel filter (primary + secondary)", "Air dryer cartridge (every 2 oil changes)", "DEF fluid check", "Transmission fluid (check level)", "DPF cleaning check (if diesel)", "Serpentine/drive belt inspection"], priority: "Scheduled Maintenance" },
  { interval: "Annual / DOT Inspection", items: ["Brake system (full adjustment, linings, drums)", "Steering system (king pins, tie rod ends)", "Frame inspection for cracks", "Fifth wheel inspection", "Suspension — spring hangers, shackles", "All lighting — headlights, brake lights, markers", "Windshield — cracks, wipers", "Exhaust — leaks, proximity to fuel lines", "Emergency equipment: triangles, fire extinguisher, spare fuses"], priority: "Federal Requirement" },
  { interval: "Major Service / 100,000 miles", items: ["Valve adjustment (if mechanical engine)", "Coolant flush & replace", "Transmission service", "Rear differential service", "Wheel bearing repack/inspect", "Clutch adjustment (manual)", "Injector cleaning/replacement assessment", "Turbocharger inspection", "Injector tips inspection (diesel)"], priority: "Major Maintenance" },
  { interval: "Tire Management (Ongoing)", items: ["Rotation: every 25,000 miles", "Retreading: only on drive/trailer positions (never steer)", "Alignment check: every 100,000 miles or after collision", "Balance: new tires only (steer axle)", "TPMS sensor battery: every 5–7 years", "Sidewall inspection: cuts, bubbles, damage after every load", "Lug nut torque: 450–500 ft-lbs typical Class 8"], priority: "Safety Critical" },
];

export default function TruckGuidePage() {
  const [tab, setTab] = useState<Tab>("types");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--dp-bg)", minHeight: "100vh" }}>
      <AppTopbar title="Truck Types Guide" subtitle="Complete reference — specs, regulations, cargo securement, maintenance" />

      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border w-fit" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
          {([
            { key: "types",       label: "Truck Types" },
            { key: "regulations", label: "Federal Regs" },
            { key: "cargo",       label: "Cargo Securement" },
            { key: "maintenance", label: "Maintenance" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", tab === key ? "bg-brand-600 text-white" : "hover:bg-[var(--dp-hover)]")}
              style={tab !== key ? { color: "var(--dp-text-muted)" } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── TRUCK TYPES ── */}
        {tab === "types" && (
          <div className="space-y-3">
            {["Light Commercial", "Medium Duty", "Heavy Duty", "Heavy Haul", "Class 8 Semi", "Class 8 Specialized"].map((cat) => {
              const trucks = TRUCK_DATA.filter((t) => t.category === cat);
              if (!trucks.length) return null;
              const sample = trucks[0];
              return (
                <div key={cat}>
                  <h2 className={cn("text-xs font-bold uppercase tracking-widest mb-2", sample.catColor)}>{cat}</h2>
                  <div className="space-y-2">
                    {trucks.map((truck) => {
                      const open = openId === truck.id;
                      return (
                        <div key={truck.id} className={cn("rounded-xl border transition-all", open ? truck.catBorder : "")} style={{ background: "var(--dp-surface)", borderColor: open ? undefined : "var(--dp-border)" }}>
                          <button onClick={() => setOpenId(open ? null : truck.id)} className="w-full flex items-center gap-4 p-4 text-left">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", truck.catBg)}>
                              <Truck className={cn("w-5 h-5", truck.catColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-sm" style={{ color: "var(--dp-text)" }}>{truck.name}</h3>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dp-hover)", color: "var(--dp-text-muted)" }}>{truck.specs.cdl}</span>
                              </div>
                              <div className="flex gap-4 mt-1 text-xs flex-wrap" style={{ color: "var(--dp-text-muted)" }}>
                                <span><Weight className="w-3 h-3 inline mr-0.5" />{truck.specs.payload}</span>
                                <span><MapPin className="w-3 h-3 inline mr-0.5" />{truck.specs.mpg}</span>
                                <span className="font-medium text-green-400">{truck.rateRange.split("|")[0].trim()}</span>
                              </div>
                            </div>
                            {open ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--dp-text-faint)" }} />}
                          </button>

                          {open && (
                            <div className="border-t px-4 pb-5 space-y-5" style={{ borderColor: "var(--dp-border)" }}>
                              {/* Specs Grid */}
                              <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(truck.specs).map(([k, v]) => (
                                  <div key={k} className="rounded-lg p-2.5" style={{ background: "var(--dp-hover)" }}>
                                    <p className="text-xs capitalize mb-0.5" style={{ color: "var(--dp-text-faint)" }}>{k.replace(/([A-Z])/g, " $1")}</p>
                                    <p className="text-xs font-semibold" style={{ color: "var(--dp-text)" }}>{v}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Best for / Avoid */}
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="rounded-xl p-3 bg-green-500/5 border border-green-500/20">
                                  <p className="text-xs font-semibold text-green-400 mb-1.5 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Best For</p>
                                  <p className="text-xs leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{truck.bestFor}</p>
                                </div>
                                <div className="rounded-xl p-3 bg-red-500/5 border border-red-500/20">
                                  <p className="text-xs font-semibold text-red-400 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Avoid When</p>
                                  <p className="text-xs leading-relaxed" style={{ color: "var(--dp-text-muted)" }}>{truck.avoid}</p>
                                </div>
                              </div>

                              {/* Use cases */}
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Common Load Types</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {truck.uses.map((u) => <span key={u} className={cn("text-xs px-2 py-1 rounded-md border", truck.catBg, truck.catColor, truck.catBorder)}>{u}</span>)}
                                </div>
                              </div>

                              {/* Rates & Brokers */}
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Rate Ranges</p>
                                  <p className="text-sm text-green-400 font-medium">{truck.rateRange}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Top Brokers</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {truck.topBrokers.map((b) => <span key={b} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)", background: "var(--dp-hover)" }}>{b}</span>)}
                                  </div>
                                </div>
                              </div>

                              {/* Insurance */}
                              <div className="rounded-xl p-3 border" style={{ borderColor: "var(--dp-border)", background: "var(--dp-hover)" }}>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--dp-text-faint)" }}><Shield className="w-3.5 h-3.5 inline mr-1 text-brand-400" />Insurance Requirements</p>
                                <p className="text-xs" style={{ color: "var(--dp-text-muted)" }}>{truck.insurance}</p>
                              </div>

                              {/* Regulations */}
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}><FileText className="w-3.5 h-3.5 inline mr-1 text-yellow-400" />Key Regulations</p>
                                <ul className="space-y-1">
                                  {truck.regulations.map((r) => (
                                    <li key={r} className="text-xs flex items-start gap-2" style={{ color: "var(--dp-text-muted)" }}>
                                      <span className="text-yellow-400 mt-0.5">›</span>{r}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Pro Tips */}
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--dp-text-faint)" }}>Pro Tips</p>
                                <ul className="space-y-1">
                                  {truck.tips.map((t) => (
                                    <li key={t} className="text-xs flex items-start gap-2" style={{ color: "var(--dp-text-muted)" }}>
                                      <span className="text-brand-400 mt-0.5">→</span>{t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FEDERAL REGULATIONS ── */}
        {tab === "regulations" && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-5" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
              <h3 className="font-bold mb-1" style={{ color: "var(--dp-text)" }}>Federal Trucking Regulations Reference</h3>
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Key rules governing commercial motor vehicles on US highways. Always verify with FMCSA and state DOT for current requirements.</p>
            </div>
            {FEDERAL_REGS.map(({ rule, detail, icon: Icon, color }) => (
              <div key={rule} className="rounded-xl border p-4" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-steel-800">
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--dp-text)" }}>{rule}</h4>
                    <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CARGO SECUREMENT ── */}
        {tab === "cargo" && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-5" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
              <h3 className="font-bold mb-1" style={{ color: "var(--dp-text)" }}>Cargo Securement Standards</h3>
              <p className="text-sm" style={{ color: "var(--dp-text-muted)" }}>Based on FMCSA 49 CFR Part 393 Subpart I. Violation of cargo securement rules is one of the most common causes of CMV out-of-service orders.</p>
            </div>
            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
              <div className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide border-b" style={{ color: "var(--dp-text-faint)", borderColor: "var(--dp-border)", background: "var(--dp-hover)" }}>
                <span>Cargo Type</span>
                <span>Tie-Downs</span>
                <span>Method</span>
                <span>Notes</span>
              </div>
              {CARGO_SECUREMENT.map(({ cargo, straps, method, notes }) => (
                <div key={cargo} className="grid grid-cols-4 px-4 py-3 border-b last:border-0 text-xs gap-2" style={{ borderColor: "var(--dp-border)", color: "var(--dp-text-muted)" }}>
                  <span className="font-medium" style={{ color: "var(--dp-text)" }}>{cargo}</span>
                  <span>{straps}</span>
                  <span>{method}</span>
                  <span>{notes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAINTENANCE ── */}
        {tab === "maintenance" && (
          <div className="space-y-4">
            {MAINTENANCE.map(({ interval, items, priority }) => {
              const priorityColor = priority === "Legal Requirement" || priority === "Federal Requirement" ? "text-red-400 bg-red-500/10 border-red-500/20"
                : priority === "Safety Critical" ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                : priority === "Major Maintenance" ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                : "text-brand-400 bg-brand-500/10 border-brand-500/20";
              return (
                <div key={interval} className="rounded-xl border overflow-hidden" style={{ background: "var(--dp-surface)", borderColor: "var(--dp-border)" }}>
                  <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--dp-border)", background: "var(--dp-hover)" }}>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-brand-400" />
                      <h3 className="font-semibold text-sm" style={{ color: "var(--dp-text)" }}>{interval}</h3>
                    </div>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", priorityColor)}>{priority}</span>
                  </div>
                  <div className="px-5 py-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {items.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm" style={{ color: "var(--dp-text-muted)" }}>
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
