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
import { Dialog } from "@/components/ui/dialog";
import { TRUCK_SIZE_LABELS, TRUCK_STATUS_COLORS, formatDate } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import Link from "next/link";

const TRUCK_QUERY = gql`
  query Truck($id: ID!) {
    truck(id: $id) {
      id unitNumber make model year vin licensePlate licensePlateState color
      size usageType segment status loadCapacityLbs maxWeightLbs lengthFt widthFt heightFt distanceRange notes
      licenses { id licenseType licenseNumber issuedBy issuedAt expiresAt notes }
    }
  }
`;

const ADD_LICENSE = gql`
  mutation AddLicense($truckId: ID!, $input: TruckLicenseInput!) {
    addTruckLicense(truckId: $truckId, input: $input) { id }
  }
`;

const DELETE_LICENSE = gql`mutation DeleteLicense($id: ID!) { deleteTruckLicense(id: $id) }`;
const UPDATE_STATUS = gql`mutation UpdateStatus($id: ID!, $status: TruckStatus!) { updateTruckStatus(id: $id, status: $status) { id status } }`;

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, refetch } = useQuery<any>(TRUCK_QUERY, { variables: { id } });
  const [addLicense] = useMutation<any>(ADD_LICENSE);
  const [deleteLicense] = useMutation<any>(DELETE_LICENSE);
  const [updateStatus] = useMutation<any>(UPDATE_STATUS);
  const [showLicDialog, setShowLicDialog] = useState(false);
  const [licForm, setLicForm] = useState({ licenseType: "", licenseNumber: "", issuedBy: "", issuedAt: "", expiresAt: "", notes: "" });

  const truck = data?.truck;

  async function handleAddLicense(e: React.FormEvent) {
    e.preventDefault();
    await addLicense({ variables: { truckId: id, input: { ...licForm, issuedAt: licForm.issuedAt || undefined, expiresAt: licForm.expiresAt || undefined } } });
    setShowLicDialog(false);
    setLicForm({ licenseType: "", licenseNumber: "", issuedBy: "", issuedAt: "", expiresAt: "", notes: "" });
    refetch();
  }

  if (loading) return <div className="p-6 text-steel-400">Loading...</div>;
  if (!truck) return <div className="p-6 text-steel-400">Truck not found.</div>;

  return (
    <div>
      <AppTopbar title={`Truck ${truck.unitNumber}`} />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/trucks" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200">
            <ArrowLeft className="w-4 h-4" /> Back to Fleet
          </Link>
          <Select value={truck.status} onChange={async (e) => { await updateStatus({ variables: { id, status: e.target.value } }); refetch(); }} className="w-40">
            {["AVAILABLE","ON_ROUTE","MAINTENANCE","OUT_OF_SERVICE","RESERVED"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[["Unit", truck.unitNumber], ["Make", truck.make], ["Model", truck.model], ["Year", truck.year], ["VIN", truck.vin], ["Plate", truck.licensePlate], ["Plate State", truck.licensePlateState], ["Color", truck.color]].map(([k, v]) => v && (
                <div key={k as string} className="flex justify-between"><span className="text-steel-400">{k}</span><span className="text-steel-100">{v}</span></div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Classification & Capacity</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["Size", TRUCK_SIZE_LABELS[truck.size] ?? truck.size],
                ["Usage", truck.usageType?.replace("_"," ")],
                ["Segment", truck.segment],
                ["Range", truck.distanceRange?.replace("_"," ")],
                ["Load Cap.", truck.loadCapacityLbs ? `${truck.loadCapacityLbs.toLocaleString()} lbs` : null],
                ["Max Weight", truck.maxWeightLbs ? `${truck.maxWeightLbs.toLocaleString()} lbs` : null],
                ["Dimensions", truck.lengthFt ? `${truck.lengthFt}L × ${truck.widthFt}W × ${truck.heightFt}H ft` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex justify-between"><span className="text-steel-400">{k}</span><span className="text-steel-100">{v}</span></div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Licenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand-400" />Permits & Licenses</CardTitle>
            <Button size="sm" onClick={() => setShowLicDialog(true)}><Plus className="w-4 h-4" />Add License</Button>
          </CardHeader>
          <CardContent>
            {truck.licenses?.length === 0 && <p className="text-sm text-steel-400">No licenses added yet.</p>}
            <div className="space-y-3">
              {truck.licenses?.map((lic: any) => {
                const expired = lic.expiresAt && new Date(lic.expiresAt) < new Date();
                const expiringSoon = lic.expiresAt && !expired && new Date(lic.expiresAt) < new Date(Date.now() + 30 * 86400000);
                return (
                  <div key={lic.id} className="flex items-center justify-between p-3 rounded-lg bg-steel-800/50 border border-steel-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-steel-100 text-sm">{lic.licenseType}</span>
                        {lic.licenseNumber && <span className="text-xs text-steel-400">#{lic.licenseNumber}</span>}
                        {expired && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">Expired</span>}
                        {expiringSoon && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded">Expiring Soon</span>}
                      </div>
                      {lic.issuedBy && <p className="text-xs text-steel-400 mt-0.5">Issued by {lic.issuedBy}</p>}
                      {lic.expiresAt && <p className="text-xs text-steel-500 mt-0.5">Expires: {formatDate(lic.expiresAt)}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={async () => { await deleteLicense({ variables: { id: lic.id } }); refetch(); }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {truck.notes && (
          <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-steel-300">{truck.notes}</p></CardContent></Card>
        )}
      </div>

      <Dialog open={showLicDialog} onClose={() => setShowLicDialog(false)} title="Add License / Permit">
        <form onSubmit={handleAddLicense} className="space-y-4">
          <Input label="License Type *" value={licForm.licenseType} onChange={(e) => setLicForm((f) => ({ ...f, licenseType: e.target.value }))} placeholder="IFTA, IRP, Overweight Permit..." required />
          <Input label="License Number" value={licForm.licenseNumber} onChange={(e) => setLicForm((f) => ({ ...f, licenseNumber: e.target.value }))} />
          <Input label="Issued By" value={licForm.issuedBy} onChange={(e) => setLicForm((f) => ({ ...f, issuedBy: e.target.value }))} placeholder="State or Authority" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Issued Date" type="date" value={licForm.issuedAt} onChange={(e) => setLicForm((f) => ({ ...f, issuedAt: e.target.value }))} />
            <Input label="Expiry Date" type="date" value={licForm.expiresAt} onChange={(e) => setLicForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Add License</Button>
            <Button type="button" variant="outline" onClick={() => setShowLicDialog(false)}>Cancel</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
