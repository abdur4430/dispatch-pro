"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TRUCK_SIZE_LABELS } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CREATE_TRUCK = gql`
  mutation CreateTruck($input: TruckInput!) {
    createTruck(input: $input) { id unitNumber }
  }
`;

export default function NewTruckPage() {
  const router = useRouter();
  const [createTruck, { loading }] = useMutation(CREATE_TRUCK);
  const [form, setForm] = useState({
    unitNumber: "", make: "", model: "", year: "", vin: "", licensePlate: "", licensePlateState: "", color: "",
    size: "SEMI_DRY_VAN", usageType: "DEDICATED", segment: "FTL", distanceRange: "LONG_HAUL",
    loadCapacityLbs: "", maxWeightLbs: "", lengthFt: "", widthFt: "", heightFt: "", notes: "",
  });
  const [error, setError] = useState("");

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createTruck({
        variables: {
          input: {
            ...form,
            year: form.year ? parseInt(form.year) : undefined,
            loadCapacityLbs: form.loadCapacityLbs ? parseFloat(form.loadCapacityLbs) : undefined,
            maxWeightLbs: form.maxWeightLbs ? parseFloat(form.maxWeightLbs) : undefined,
            lengthFt: form.lengthFt ? parseFloat(form.lengthFt) : undefined,
            widthFt: form.widthFt ? parseFloat(form.widthFt) : undefined,
            heightFt: form.heightFt ? parseFloat(form.heightFt) : undefined,
          },
        },
      });
      router.push("/trucks");
    } catch (err: any) {
      setError(err.message ?? "Failed to create truck");
    }
  }

  return (
    <div>
      <AppTopbar title="Add Truck" />
      <div className="p-6 max-w-3xl">
        <Link href="/trucks" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Unit Number *" value={form.unitNumber} onChange={(e) => set("unitNumber", e.target.value)} placeholder="T-101" required />
              <Input label="Color" value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="White" />
              <Input label="Make" value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="Freightliner" />
              <Input label="Model" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Cascadia" />
              <Input label="Year" type="number" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2022" />
              <Input label="VIN" value={form.vin} onChange={(e) => set("vin", e.target.value)} placeholder="1FUJGEDV..." />
              <Input label="License Plate" value={form.licensePlate} onChange={(e) => set("licensePlate", e.target.value)} placeholder="ABC1234" />
              <Input label="Plate State" value={form.licensePlateState} onChange={(e) => set("licensePlateState", e.target.value)} placeholder="TX" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Select label="Truck Size *" value={form.size} onChange={(e) => set("size", e.target.value)}>
                {Object.entries(TRUCK_SIZE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select label="Usage Type *" value={form.usageType} onChange={(e) => set("usageType", e.target.value)}>
                {["DEDICATED","SPOT_MARKET","OWNER_OPERATOR","LEASE","RENTAL"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </Select>
              <Select label="Segment *" value={form.segment} onChange={(e) => set("segment", e.target.value)}>
                {["LTL","FTL","PARTIAL_LOAD","EXPEDITED","SPECIALIZED","HAZMAT"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </Select>
              <Select label="Distance Range *" value={form.distanceRange} onChange={(e) => set("distanceRange", e.target.value)}>
                <option value="LOCAL">Local (&lt;100 mi)</option>
                <option value="REGIONAL">Regional (100-500 mi)</option>
                <option value="LONG_HAUL">Long Haul (&gt;500 mi)</option>
                <option value="ANY">Any Distance</option>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Capacity & Dimensions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Load Capacity (lbs)" type="number" value={form.loadCapacityLbs} onChange={(e) => set("loadCapacityLbs", e.target.value)} placeholder="45000" />
              <Input label="Max Weight (lbs)" type="number" value={form.maxWeightLbs} onChange={(e) => set("maxWeightLbs", e.target.value)} placeholder="80000" />
              <Input label="Length (ft)" type="number" value={form.lengthFt} onChange={(e) => set("lengthFt", e.target.value)} placeholder="53" />
              <Input label="Width (ft)" type="number" value={form.widthFt} onChange={(e) => set("widthFt", e.target.value)} placeholder="8.5" />
              <Input label="Height (ft)" type="number" value={form.heightFt} onChange={(e) => set("heightFt", e.target.value)} placeholder="13.5" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Saving..." : "Add Truck"}</Button>
            <Link href="/trucks"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
