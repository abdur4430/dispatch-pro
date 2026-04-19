"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useParams } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const DRIVER_QUERY = gql`
  query Driver($id: ID!) {
    driver(id: $id) {
      id firstName lastName email phone address city state zip
      licenseNumber licenseState licenseClass licenseExpiry
      status hireDate assignedTruckId notes
    }
    trucks(pageSize: 100) { nodes { id unitNumber make model } }
  }
`;

const UPDATE_DRIVER = gql`mutation UpdateDriver($id: ID!, $input: DriverInput!) { updateDriver(id: $id, input: $input) { id } }`;

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery<any>(DRIVER_QUERY, { variables: { id } });
  const [updateDriver, { loading: saving }] = useMutation<any>(UPDATE_DRIVER);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>(null);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <div className="p-6 text-steel-400">Loading...</div>;
  const driver = data?.driver;
  if (!driver) return <div className="p-6 text-steel-400">Driver not found.</div>;

  const f = form ?? driver;
  const trucks = data?.trucks?.nodes ?? [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateDriver({
      variables: {
        id,
        input: {
          firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone,
          address: f.address, city: f.city, state: f.state, zip: f.zip,
          licenseNumber: f.licenseNumber, licenseState: f.licenseState, licenseClass: f.licenseClass,
          licenseExpiry: f.licenseExpiry || undefined, hireDate: f.hireDate || undefined,
          assignedTruckId: f.assignedTruckId || undefined, notes: f.notes,
        },
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <AppTopbar title={`${driver.firstName} ${driver.lastName}`} />
      <div className="p-6 max-w-3xl">
        <Link href="/drivers" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Drivers
        </Link>
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={f.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
              <Input label="Last Name" value={f.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
              <Input label="Email" type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              <Input label="Phone" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
              <Input label="Address" value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} className="col-span-2" />
              <Input label="City" value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" value={f.state ?? ""} onChange={(e) => set("state", e.target.value)} />
                <Input label="ZIP" value={f.zip ?? ""} onChange={(e) => set("zip", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>License & Assignment</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Select label="License Class" value={f.licenseClass ?? "CDL-A"} onChange={(e) => set("licenseClass", e.target.value)}>
                {["CDL-A","CDL-B","CDL-C","Non-CDL"].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input label="License #" value={f.licenseNumber ?? ""} onChange={(e) => set("licenseNumber", e.target.value)} />
              <Input label="License State" value={f.licenseState ?? ""} onChange={(e) => set("licenseState", e.target.value)} />
              <Input label="Expiry" type="date" value={f.licenseExpiry ? f.licenseExpiry.split("T")[0] : ""} onChange={(e) => set("licenseExpiry", e.target.value)} />
              <Select label="Assigned Truck" value={f.assignedTruckId ?? ""} onChange={(e) => set("assignedTruckId", e.target.value)}>
                <option value="">Unassigned</option>
                {trucks.map((t: any) => <option key={t.id} value={t.id}>{t.unitNumber} — {t.make} {t.model}</option>)}
              </Select>
              <Input label="Hire Date" type="date" value={f.hireDate ? f.hireDate.split("T")[0] : ""} onChange={(e) => set("hireDate", e.target.value)} />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={saving}>
            <Save className="w-4 h-4" />{saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
