"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useParams } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const CLIENT_QUERY = gql`query Client($id: ID!) { client(id: $id) { id name contactName email phone address city state zip country billingName billingAddress billingCity billingState billingZip billingEmail paymentTerms creditLimit notes isActive } }`;
const UPDATE_CLIENT = gql`mutation UpdateClient($id: ID!, $input: ClientInput!) { updateClient(id: $id, input: $input) { id } }`;

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery<any>(CLIENT_QUERY, { variables: { id } });
  const [updateClient, { loading: saving }] = useMutation<any>(UPDATE_CLIENT);
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  if (loading) return <div className="p-6 text-steel-400">Loading...</div>;
  const client = data?.client;
  if (!client) return <div className="p-6 text-steel-400">Client not found.</div>;
  const f = form ?? client;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { id: _id, __typename, ...input } = f;
    await updateClient({ variables: { id, input: { ...input, creditLimit: input.creditLimit ? parseFloat(input.creditLimit) : undefined } } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <AppTopbar title={client.name} />
      <div className="p-6 max-w-3xl">
        <Link href="/clients" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Company Name" value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} className="col-span-2" />
              <Input label="Contact Person" value={f.contactName ?? ""} onChange={(e) => set("contactName", e.target.value)} />
              <Input label="Email" value={f.email ?? ""} onChange={(e) => set("email", e.target.value)} />
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
            <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Billing Name" value={f.billingName ?? ""} onChange={(e) => set("billingName", e.target.value)} className="col-span-2" />
              <Input label="Billing Email" value={f.billingEmail ?? ""} onChange={(e) => set("billingEmail", e.target.value)} />
              <Input label="Payment Terms" value={f.paymentTerms ?? ""} onChange={(e) => set("paymentTerms", e.target.value)} />
              <Input label="Credit Limit ($)" type="number" value={f.creditLimit ?? ""} onChange={(e) => set("creditLimit", e.target.value)} />
            </CardContent>
          </Card>
          <Button type="submit" size="lg" disabled={saving}><Save className="w-4 h-4" />{saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}</Button>
        </form>
      </div>
    </div>
  );
}
