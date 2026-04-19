"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useRouter } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CREATE_CLIENT = gql`mutation CreateClient($input: ClientInput!) { createClient(input: $input) { id } }`;

export default function NewClientPage() {
  const router = useRouter();
  const [createClient, { loading }] = useMutation(CREATE_CLIENT);
  const [form, setForm] = useState({
    name: "", contactName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "US",
    billingName: "", billingAddress: "", billingCity: "", billingState: "", billingZip: "", billingEmail: "",
    paymentTerms: "", creditLimit: "", notes: "",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createClient({ variables: { input: { ...form, creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined } } });
      router.push("/clients");
    } catch (err: any) {
      setError(err.message ?? "Failed to create client");
    }
  }

  return (
    <div>
      <AppTopbar title="Add Client" />
      <div className="p-6 max-w-3xl">
        <Link href="/clients" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Company Name *" value={form.name} onChange={(e) => set("name", e.target.value)} required className="col-span-2" />
              <Input label="Contact Person" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} className="col-span-2" />
              <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="State" value={form.state} onChange={(e) => set("state", e.target.value)} />
                <Input label="ZIP" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Billing Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input label="Billing Name" value={form.billingName} onChange={(e) => set("billingName", e.target.value)} className="col-span-2" />
              <Input label="Billing Email" type="email" value={form.billingEmail} onChange={(e) => set("billingEmail", e.target.value)} />
              <Input label="Payment Terms" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="Net 30" />
              <Input label="Credit Limit ($)" type="number" value={form.creditLimit} onChange={(e) => set("creditLimit", e.target.value)} placeholder="50000" />
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
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Saving..." : "Add Client"}</Button>
            <Link href="/clients"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
