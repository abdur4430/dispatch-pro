"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Save, CheckCircle } from "lucide-react";

const COMPANY_QUERY = gql`query Company { company { id name dotNumber mcNumber address city state zip country phone email website logoUrl } }`;
const UPSERT_COMPANY = gql`mutation UpsertCompany($input: CompanyInput!) { upsertCompany(input: $input) { id name } }`;

export default function CompanyPage() {
  const { data, loading } = useQuery<any>(COMPANY_QUERY);
  const [upsertCompany, { loading: saving }] = useMutation<any>(UPSERT_COMPANY);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>(null);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <div className="p-6 text-steel-400">Loading...</div>;

  const company = data?.company;
  const f = form ?? company ?? {};

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: any = {
      name: f.name ?? "",
      dotNumber: f.dotNumber || undefined, mcNumber: f.mcNumber || undefined,
      address: f.address || undefined, city: f.city || undefined,
      state: f.state || undefined, zip: f.zip || undefined,
      country: f.country || "US", phone: f.phone || undefined,
      email: f.email || undefined, website: f.website || undefined,
    };
    await upsertCompany({ variables: { input } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <AppTopbar title="Company Setup" />
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-steel-100">{company?.name ?? "Set Up Your Company"}</h2>
            <p className="text-sm text-steel-400">Configure your carrier profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Company Identity</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Company Name *" value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Acme Trucking LLC" required className="col-span-2" />
              <Input label="DOT Number" value={f.dotNumber ?? ""} onChange={(e) => set("dotNumber", e.target.value)} placeholder="1234567" />
              <Input label="MC Number" value={f.mcNumber ?? ""} onChange={(e) => set("mcNumber", e.target.value)} placeholder="MC-123456" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Street Address" value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} className="col-span-2" />
              <Input label="City" value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" value={f.state ?? ""} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
                <Input label="ZIP" value={f.zip ?? ""} onChange={(e) => set("zip", e.target.value)} />
              </div>
              <Input label="Country" value={f.country ?? "US"} onChange={(e) => set("country", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Phone" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
              <Input label="Email" type="email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="info@company.com" />
              <Input label="Website" value={f.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://..." className="col-span-2" />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={saving}>
            {saved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />{saving ? "Saving..." : "Save Company"}</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
