"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Props = {
  routeGeometry: any | null;
  origin: { lat: number; lon: number; display: string } | null;
  dest: { lat: number; lon: number; display: string } | null;
  waypoints: { lat: number; lon: number; label: string; weather?: any }[];
};

export default function MapView({ routeGeometry, origin, dest, waypoints }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons (webpack/turbopack breaks the default paths)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [39.5, -98.35],
        zoom: 4,
        zoomControl: true,
      });

      // Dark tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update route when geometry changes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      // Clear previous route
      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
      markersRef.current = [];

      if (!routeGeometry || !origin || !dest) return;

      // Draw route polyline
      const coords: [number, number][] = routeGeometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      const polyline = L.polyline(coords, {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.85,
        dashArray: undefined,
      }).addTo(mapRef.current);
      routeLayerRef.current = polyline;

      // Origin marker (green)
      const originIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });
      const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon })
        .bindPopup(`<strong>Origin</strong><br/>${origin.display.split(",").slice(0, 2).join(",")}`)
        .addTo(mapRef.current);
      markersRef.current.push(originMarker);

      // Destination marker (red)
      const destIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });
      const destMarker = L.marker([dest.lat, dest.lon], { icon: destIcon })
        .bindPopup(`<strong>Destination</strong><br/>${dest.display.split(",").slice(0, 2).join(",")}`)
        .addTo(mapRef.current);
      markersRef.current.push(destMarker);

      // Weather waypoint markers
      waypoints.forEach((wp) => {
        if (!wp.weather) return;
        const w = wp.weather;
        const color = w.condition?.severity === "severe" ? "#ef4444"
          : w.condition?.severity === "warning" ? "#f97316"
          : w.condition?.severity === "caution" ? "#eab308"
          : "#22c55e";
        const wpIcon = L.divIcon({
          html: `<div style="background:${color};color:white;border-radius:8px;padding:2px 6px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.3)">${w.condition?.icon ?? "☁️"} ${w.temp}°F</div>`,
          className: "",
          iconAnchor: [20, 10],
        });
        const m = L.marker([wp.lat, wp.lon], { icon: wpIcon })
          .bindPopup(`<strong>${wp.label}</strong><br/>${w.condition?.label}<br/>${w.temp}°F · Wind ${w.windSpeed} mph${w.alert ? `<br/>⚠️ ${w.alert}` : ""}`)
          .addTo(mapRef.current);
        markersRef.current.push(m);
      });

      // Fit map to route
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    });
  }, [routeGeometry, origin, dest, waypoints]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
