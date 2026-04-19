import { NextRequest, NextResponse } from "next/server";

// Open-Meteo: completely free, no API key needed
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const lat = params.get("lat");
  const lon = params.get("lon");

  if (!lat || !lon) return NextResponse.json({ error: "lat and lon required" }, { status: 400 });

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code,visibility,surface_pressure&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const data = await res.json();

    const c = data.current;
    return NextResponse.json({
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      windSpeed: Math.round(c.wind_speed_10m),
      windDir: c.wind_direction_10m,
      precipitation: c.precipitation,
      code: c.weather_code,
      condition: wmoToCondition(c.weather_code),
      alert: getAlert(c),
      visibility: c.visibility,
      pressure: c.surface_pressure,
    });
  } catch {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 500 });
  }
}

function wmoToCondition(code: number): { label: string; icon: string; severity: "good" | "caution" | "warning" | "severe" } {
  if (code === 0) return { label: "Clear sky", icon: "☀️", severity: "good" };
  if (code <= 2) return { label: "Partly cloudy", icon: "⛅", severity: "good" };
  if (code === 3) return { label: "Overcast", icon: "☁️", severity: "good" };
  if (code <= 49) return { label: "Foggy", icon: "🌫️", severity: "caution" };
  if (code <= 57) return { label: "Drizzle", icon: "🌦️", severity: "caution" };
  if (code <= 67) return { label: "Rain", icon: "🌧️", severity: "caution" };
  if (code <= 77) return { label: "Snow", icon: "❄️", severity: "warning" };
  if (code <= 82) return { label: "Rain showers", icon: "🌦️", severity: "caution" };
  if (code <= 86) return { label: "Snow showers", icon: "🌨️", severity: "warning" };
  if (code <= 95) return { label: "Thunderstorm", icon: "⛈️", severity: "severe" };
  return { label: "Hail storm", icon: "🌩️", severity: "severe" };
}

function getAlert(c: any): string | null {
  const alerts: string[] = [];
  if (c.wind_speed_10m >= 45) alerts.push(`High wind ${Math.round(c.wind_speed_10m)} mph — reduce speed`);
  if (c.wind_speed_10m >= 30) alerts.push(`Strong crosswind ${Math.round(c.wind_speed_10m)} mph`);
  if ([71, 73, 75, 77, 85, 86].includes(c.weather_code)) alerts.push("Snow/ice — allow extra time, check chains");
  if ([95, 96, 99].includes(c.weather_code)) alerts.push("Severe thunderstorm — consider delay");
  if (c.visibility < 1000) alerts.push("Low visibility — use hazard lights");
  if (c.precipitation > 0.5) alerts.push("Heavy precipitation — reduced traction");
  return alerts.length > 0 ? alerts[0] : null;
}
