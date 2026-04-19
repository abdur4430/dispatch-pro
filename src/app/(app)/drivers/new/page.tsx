"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CREATE_DRIVER = gql`mutation CreateDriver($input: DriverInput!) { createDriver(input: $input) { id } }`;
const TRUCKS_QUERY = gql`query TrucksForDriver { trucks(pageSize: 100) { nodes { id unitNumber make model } } }`;

export default function NewDriverPage() {
  const router = useRouter();
  const [createDriver, { loading }] = useMutation<any>(CREATE_DRIVER);
  const { data: trucksData } = useQuery<any>(TRUCKS_QUERY);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
    licenseNumber: "", licenseState: "", licenseClass: "CDL-A", licenseExpiry: "",
    hireDate: "", assignedTruckId: "", notes: "",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createDriver({
        variables: {
          input: {
            ...form,
            licenseExpiry: form.licenseExpiry || undefined,
            hireDate: form.hireDate || undefined,
            assignedTruckId: form.assignedTruckId || undefined,
          },
        },
      });
      router.push("/drivers");
    } catch (err: any) {
      setError(err.message ?? "Failed to create driver");
    }
  }

  const trucks = trucksData?.trucks?.nodes ?? [];

  return (
    <div>
      <AppTopbar title="Add Driver" />
      <div className="p-6 max-w-3xl">
        <Link href="/drivers" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Drivers
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="First Name *" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
              <Input label="Last Name *" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} className="col-span-2" />
              <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
                <Input label="ZIP" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>License & Employment</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Select label="License Class" value={form.licenseClass} onChange={(e) => set("licenseClass", e.target.value)}>
                {["CDL-A","CDL-B","CDL-C","Non-CDL"].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input label="License Number" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
              <Input label="License State" value={form.licenseState} onChange={(e) => set("licenseState", e.target.value)} placeholder="TX" />
              <Input label="License Expiry" type="date" value={form.licenseExpiry} onChange={(e) => set("licenseExpiry", e.target.value)} />
              <Input label="Hire Date" type="date" value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} />
              <Select label="Assign Truck" value={form.assignedTruckId} onChange={(e) => set("assignedTruckId", e.target.value)}>
                <option value="">No truck assigned</option>
                {trucks.map((t: any) => <option key={t.id} value={t.id}>{t.unitNumber} — {t.make} {t.model}</option>)}
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Saving..." : "Add Driver"}</Button>
            <Link href="/drivers"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
