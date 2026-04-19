"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TRUCK_SIZE_LABELS, TRUCK_STATUS_COLORS } from "@/lib/utils";
import { Plus, Pencil, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TRUCKS_QUERY = gql`
  query Trucks($filters: TruckFiltersInput) {
    trucks(filters: $filters, pageSize: 50) {
      nodes { id unitNumber make model year size segment status distanceRange loadCapacityLbs licenses { id licenseType expiresAt } }
      pageInfo { total }
    }
  }
`;

const DELETE_TRUCK = gql`mutation DeleteTruck($id: ID!) { deleteTruck(id: $id) }`;

export default function TrucksPage() {
  const [filters, setFilters] = useState<any>({});
  const { data, loading, refetch } = useQuery<any>(TRUCKS_QUERY, { variables: { filters } });
  const [deleteTruck] = useMutation<any>(DELETE_TRUCK);

  async function handleDelete(id: string, unit: string) {
    if (!confirm(`Delete truck ${unit}? This cannot be undone.`)) return;
    await deleteTruck({ variables: { id } });
    refetch();
  }

  const trucks = data?.trucks?.nodes ?? [];

  return (
    <div>
      <AppTopbar title="Fleet Management" />
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-steel-100">Your Fleet</h2>
            <p className="text-sm text-steel-400 mt-0.5">{data?.trucks?.pageInfo?.total ?? "..."} trucks registered</p>
          </div>
          <Link href="/trucks/new"><Button><Plus className="w-4 h-4" />Add Truck</Button></Link>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select label="Size" className="w-44" value={filters.size ?? ""} onChange={(e) => setFilters((f: any) => ({ ...f, size: e.target.value || undefined }))}>
              <option value="">All Sizes</option>
              {Object.entries(TRUCK_SIZE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select label="Status" className="w-36" value={filters.status ?? ""} onChange={(e) => setFilters((f: any) => ({ ...f, status: e.target.value || undefined }))}>
              <option value="">All Status</option>
              {["AVAILABLE","ON_ROUTE","MAINTENANCE","OUT_OF_SERVICE","RESERVED"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </Select>
            <Select label="Segment" className="w-40" value={filters.segment ?? ""} onChange={(e) => setFilters((f: any) => ({ ...f, segment: e.target.value || undefined }))}>
              <option value="">All Segments</option>
              {["LTL","FTL","PARTIAL_LOAD","EXPEDITED","SPECIALIZED","HAZMAT"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </Select>
            <Select label="Distance" className="w-36" value={filters.distanceRange ?? ""} onChange={(e) => setFilters((f: any) => ({ ...f, distanceRange: e.target.value || undefined }))}>
              <option value="">Any Range</option>
              {["LOCAL","REGIONAL","LONG_HAUL","ANY"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </Select>
          </div>
        </Card>

        {/* Trucks Grid */}
        {loading && <div className="text-steel-400 text-sm">Loading fleet...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trucks.map((truck: any) => (
            <Card key={truck.id} className="p-5 flex flex-col gap-4 hover:border-steel-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-steel-100">{truck.unitNumber}</p>
                    <p className="text-xs text-steel-400">{truck.year} {truck.make} {truck.model}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${TRUCK_STATUS_COLORS[truck.status]}`}>
                  {truck.status.replace("_", " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-steel-800/50 rounded-lg px-3 py-2">
                  <p className="text-steel-500">Size</p>
                  <p className="text-steel-200 font-medium">{TRUCK_SIZE_LABELS[truck.size] ?? truck.size}</p>
                </div>
                <div className="bg-steel-800/50 rounded-lg px-3 py-2">
                  <p className="text-steel-500">Segment</p>
                  <p className="text-steel-200 font-medium">{truck.segment}</p>
                </div>
                <div className="bg-steel-800/50 rounded-lg px-3 py-2">
                  <p className="text-steel-500">Range</p>
                  <p className="text-steel-200 font-medium">{truck.distanceRange.replace("_", " ")}</p>
                </div>
                <div className="bg-steel-800/50 rounded-lg px-3 py-2">
                  <p className="text-steel-500">Capacity</p>
                  <p className="text-steel-200 font-medium">{truck.loadCapacityLbs ? `${truck.loadCapacityLbs.toLocaleString()} lbs` : "—"}</p>
                </div>
              </div>
              {truck.licenses?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {truck.licenses.slice(0, 3).map((lic: any) => (
                    <span key={lic.id} className="text-xs bg-steel-800 text-steel-300 px-2 py-0.5 rounded">{lic.licenseType}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 border-t border-steel-800">
                <Link href={`/trucks/${truck.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full"><Pencil className="w-3 h-3" />View</Button>
                </Link>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(truck.id, truck.unitNumber)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {!loading && trucks.length === 0 && (
          <Card className="p-12 text-center">
            <Truck className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No trucks found.</p>
            <Link href="/trucks/new"><Button className="mt-4"><Plus className="w-4 h-4" />Add Your First Truck</Button></Link>
          </Card>
        )}
      </div>
    </div>
  );
}
