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
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

const CREATE_ORDER = gql`
  mutation CreateDispatch($input: DispatchOrderInput!) {
    createDispatchOrder(input: $input) { id orderNumber }
  }
`;
const RESOURCES_QUERY = gql`
  query Resources {
    trucks(pageSize: 100) { nodes { id unitNumber make model status } }
    drivers(pageSize: 100) { nodes { id firstName lastName status } }
    clients(pageSize: 100) { nodes { id name } }
  }
`;

const STEPS = ["Assignment", "Route", "Schedule", "Load Details", "Financial", "Review"];

export default function NewDispatchPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [createOrder, { loading }] = useMutation<any>(CREATE_ORDER);
  const { data } = useQuery<any>(RESOURCES_QUERY);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    truckId: "", driverId: "", clientId: "",
    originAddress: "", originCity: "", originState: "", originZip: "",
    destAddress: "", destCity: "", destState: "", destZip: "",
    distanceMiles: "", pickupAt: "", deliveryAt: "",
    loadDescription: "", weightLbs: "", pieces: "", pallets: "",
    hazmat: false, hazmatClass: "", specialInstructions: "", referenceNumber: "",
    rate: "", rateType: "FLAT", fuelSurcharge: "", totalCharge: "", driverPay: "", notes: "",
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const trucks = data?.trucks?.nodes ?? [];
  const drivers = data?.drivers?.nodes ?? [];
  const clients = data?.clients?.nodes ?? [];

  async function handleSubmit() {
    setError("");
    try {
      const { data: res } = await createOrder({
        variables: {
          input: {
            truckId: form.truckId || undefined, driverId: form.driverId || undefined, clientId: form.clientId || undefined,
            originAddress: form.originAddress, originCity: form.originCity, originState: form.originState, originZip: form.originZip || undefined,
            destAddress: form.destAddress, destCity: form.destCity, destState: form.destState, destZip: form.destZip || undefined,
            distanceMiles: form.distanceMiles ? parseFloat(form.distanceMiles) : undefined,
            pickupAt: form.pickupAt || undefined, deliveryAt: form.deliveryAt || undefined,
            loadDescription: form.loadDescription || undefined,
            weightLbs: form.weightLbs ? parseFloat(form.weightLbs) : undefined,
            pieces: form.pieces ? parseInt(form.pieces) : undefined,
            pallets: form.pallets ? parseInt(form.pallets) : undefined,
            hazmat: form.hazmat, hazmatClass: form.hazmatClass || undefined,
            specialInstructions: form.specialInstructions || undefined,
            referenceNumber: form.referenceNumber || undefined,
            rate: form.rate ? parseFloat(form.rate) : undefined,
            rateType: form.rateType || "FLAT",
            fuelSurcharge: form.fuelSurcharge ? parseFloat(form.fuelSurcharge) : undefined,
            totalCharge: form.totalCharge ? parseFloat(form.totalCharge) : undefined,
            driverPay: form.driverPay ? parseFloat(form.driverPay) : undefined,
            notes: form.notes || undefined,
          },
        },
      });
      router.push(`/dispatch/${(res as any).createDispatchOrder.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create order");
    }
  }

  return (
    <div>
      <AppTopbar title="New Dispatch Order" />
      <div className="p-6 max-w-3xl">
        <Link href="/dispatch" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dispatch
        </Link>

        {/* Step progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <button onClick={() => setStep(i)} className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${i === step ? "bg-brand-600/20 text-brand-400" : i < step ? "text-green-400" : "text-steel-500"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === step ? "bg-brand-600 text-white" : i < step ? "bg-green-500 text-white" : "bg-steel-800 text-steel-400"}`}>{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-green-500" : "bg-steel-800"}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle>Step 1: Assignment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Select label="Client" value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
                  <option value="">Select client...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Select label="Truck" value={form.truckId} onChange={(e) => set("truckId", e.target.value)}>
                  <option value="">Select truck...</option>
                  {trucks.filter((t: any) => t.status === "AVAILABLE").map((t: any) => <option key={t.id} value={t.id}>{t.unitNumber} — {t.make} {t.model} ({t.status})</option>)}
                  {trucks.filter((t: any) => t.status !== "AVAILABLE").length > 0 && <option disabled>── Unavailable ──</option>}
                  {trucks.filter((t: any) => t.status !== "AVAILABLE").map((t: any) => <option key={t.id} value={t.id}>{t.unitNumber} — {t.status}</option>)}
                </Select>
                <Select label="Driver" value={form.driverId} onChange={(e) => set("driverId", e.target.value)}>
                  <option value="">Select driver...</option>
                  {drivers.filter((d: any) => d.status === "AVAILABLE").map((d: any) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </Select>
                <Input label="Reference / BOL #" value={form.referenceNumber} onChange={(e) => set("referenceNumber", e.target.value)} placeholder="Customer PO or BOL number" />
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>Step 2: Route</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium text-brand-400">Origin (Pickup)</p>
                <Input label="Address *" value={form.originAddress} onChange={(e) => set("originAddress", e.target.value)} required />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City *" value={form.originCity} onChange={(e) => set("originCity", e.target.value)} required />
                  <Input label="State *" value={form.originState} onChange={(e) => set("originState", e.target.value)} placeholder="TX" required />
                  <Input label="ZIP" value={form.originZip} onChange={(e) => set("originZip", e.target.value)} />
                </div>
                <div className="border-t border-steel-800 pt-4">
                  <p className="text-sm font-medium text-green-400">Destination (Delivery)</p>
                </div>
                <Input label="Address *" value={form.destAddress} onChange={(e) => set("destAddress", e.target.value)} required />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="City *" value={form.destCity} onChange={(e) => set("destCity", e.target.value)} required />
                  <Input label="State *" value={form.destState} onChange={(e) => set("destState", e.target.value)} placeholder="CA" required />
                  <Input label="ZIP" value={form.destZip} onChange={(e) => set("destZip", e.target.value)} />
                </div>
                <Input label="Distance (miles)" type="number" value={form.distanceMiles} onChange={(e) => set("distanceMiles", e.target.value)} placeholder="Calculate or enter manually" />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>Step 3: Schedule</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Input label="Pickup Date & Time" type="datetime-local" value={form.pickupAt} onChange={(e) => set("pickupAt", e.target.value)} />
                <Input label="Delivery Date & Time" type="datetime-local" value={form.deliveryAt} onChange={(e) => set("deliveryAt", e.target.value)} />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader><CardTitle>Step 4: Load Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input label="Load Description" value={form.loadDescription} onChange={(e) => set("loadDescription", e.target.value)} placeholder="General freight, electronics, produce..." />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Weight (lbs)" type="number" value={form.weightLbs} onChange={(e) => set("weightLbs", e.target.value)} />
                  <Input label="Pieces" type="number" value={form.pieces} onChange={(e) => set("pieces", e.target.value)} />
                  <Input label="Pallets" type="number" value={form.pallets} onChange={(e) => set("pallets", e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="hazmat" checked={form.hazmat} onChange={(e) => set("hazmat", e.target.checked)} className="w-4 h-4 accent-brand-500" />
                  <label htmlFor="hazmat" className="text-sm text-steel-300">Hazardous Materials</label>
                  {form.hazmat && <Input placeholder="Hazmat class (e.g. Class 3)" value={form.hazmatClass} onChange={(e) => set("hazmatClass", e.target.value)} className="flex-1" />}
                </div>
                <Textarea label="Special Instructions" value={form.specialInstructions} onChange={(e) => set("specialInstructions", e.target.value)} rows={3} />
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader><CardTitle>Step 5: Financial</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Input label="Rate ($)" type="number" step="0.01" value={form.rate} onChange={(e) => set("rate", e.target.value)} />
                <Select label="Rate Type" value={form.rateType} onChange={(e) => set("rateType", e.target.value)}>
                  {["FLAT","PER_MILE","PER_HUNDREDWEIGHT","PER_PALLET"].map((r) => <option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                </Select>
                <Input label="Fuel Surcharge ($)" type="number" step="0.01" value={form.fuelSurcharge} onChange={(e) => set("fuelSurcharge", e.target.value)} />
                <Input label="Total Charge ($)" type="number" step="0.01" value={form.totalCharge} onChange={(e) => set("totalCharge", e.target.value)} />
                <Input label="Driver Pay ($)" type="number" step="0.01" value={form.driverPay} onChange={(e) => set("driverPay", e.target.value)} className="col-span-2" />
                <Textarea label="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="col-span-2" />
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader><CardTitle>Step 6: Review & Create</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Client", clients.find((c: any) => c.id === form.clientId)?.name ?? "—"],
                    ["Truck", trucks.find((t: any) => t.id === form.truckId)?.unitNumber ?? "—"],
                    ["Driver", (() => { const d = drivers.find((d: any) => d.id === form.driverId); return d ? `${d.firstName} ${d.lastName}` : "—"; })()],
                    ["Route", form.originCity && form.destCity ? `${form.originCity}, ${form.originState} → ${form.destCity}, ${form.destState}` : "—"],
                    ["Distance", form.distanceMiles ? `${form.distanceMiles} mi` : "—"],
                    ["Pickup", form.pickupAt ? new Date(form.pickupAt).toLocaleString() : "—"],
                    ["Load", form.loadDescription ?? "—"],
                    ["Weight", form.weightLbs ? `${parseFloat(form.weightLbs).toLocaleString()} lbs` : "—"],
                    ["Total Charge", form.totalCharge ? `$${parseFloat(form.totalCharge).toLocaleString()}` : "—"],
                    ["Hazmat", form.hazmat ? `Yes${form.hazmatClass ? ` (${form.hazmatClass})` : ""}` : "No"],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-xs text-steel-400">{k}</p>
                      <p className="text-steel-100 font-medium mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} size="lg">
                {loading ? "Creating..." : "Create Order"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
