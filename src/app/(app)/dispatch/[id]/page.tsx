"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useParams } from "next/navigation";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency, formatDateTime, DISPATCH_STATUS_COLORS } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

const ORDER_QUERY = gql`
  query DispatchOrder($id: ID!) {
    dispatchOrder(id: $id) {
      id orderNumber status
      originAddress originCity originState originZip
      destAddress destCity destState destZip distanceMiles
      pickupAt deliveryAt actualPickupAt actualDeliveryAt
      loadDescription weightLbs pieces pallets hazmat hazmatClass
      specialInstructions referenceNumber
      rate rateType fuelSurcharge totalCharge driverPay notes
      client { id name contactName email phone }
      truck { id unitNumber make model year }
      driver { id firstName lastName phone licenseClass }
      statusHistory { id status note occurredAt }
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateDispatchStatus($id: ID!, $status: DispatchStatus!, $note: String) {
    updateDispatchStatus(id: $id, status: $status, note: $note) { id status statusHistory { id status note occurredAt } }
  }
`;

const STATUSES = ["PENDING","CONFIRMED","IN_TRANSIT","AT_PICKUP","LOADED","AT_DELIVERY","DELIVERED","COMPLETED","CANCELLED","ON_HOLD"];

const STATUS_ICONS: Record<string, string> = {
  PENDING: "⏳", CONFIRMED: "✅", IN_TRANSIT: "🚛", AT_PICKUP: "📍",
  LOADED: "📦", AT_DELIVERY: "🎯", DELIVERED: "🏁", COMPLETED: "✔️", CANCELLED: "❌", ON_HOLD: "⏸️",
};

export default function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery<any>(ORDER_QUERY, { variables: { id } });
  const [updateStatus] = useMutation<any>(UPDATE_STATUS);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  if (loading) return <div className="p-6 text-steel-400">Loading order...</div>;
  const order = data?.dispatchOrder;
  if (!order) return <div className="p-6 text-steel-400">Order not found.</div>;

  async function handleStatusUpdate() {
    if (!newStatus) return;
    await updateStatus({ variables: { id, status: newStatus, note: statusNote || undefined } });
    setShowStatusDialog(false);
    setStatusNote("");
    setNewStatus("");
  }

  return (
    <div>
      <AppTopbar title={`Order ${order.orderNumber}`} />
      <div className="p-6 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dispatch" className="flex items-center gap-2 text-sm text-steel-400 hover:text-steel-200">
            <ArrowLeft className="w-4 h-4" /> Back to Dispatch
          </Link>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1.5 rounded-lg border font-medium ${DISPATCH_STATUS_COLORS[order.status]}`}>
              {STATUS_ICONS[order.status]} {order.status.replace(/_/g," ")}
            </span>
            <Button onClick={() => { setNewStatus(order.status); setShowStatusDialog(true); }}>Update Status</Button>
          </div>
        </div>

        {/* Route Hero */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-steel-400 mb-1">Origin</p>
              <p className="text-lg font-bold text-steel-100">{order.originCity}, {order.originState}</p>
              <p className="text-sm text-steel-400">{order.originAddress}</p>
              {order.pickupAt && <p className="text-xs text-brand-400 mt-1">Pickup: {formatDateTime(order.pickupAt)}</p>}
            </div>
            <div className="flex flex-col items-center gap-1 px-6">
              <ArrowRight className="w-8 h-8 text-brand-400" />
              {order.distanceMiles && <p className="text-xs text-steel-400">{order.distanceMiles.toLocaleString()} mi</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-steel-400 mb-1">Destination</p>
              <p className="text-lg font-bold text-steel-100">{order.destCity}, {order.destState}</p>
              <p className="text-sm text-steel-400">{order.destAddress}</p>
              {order.deliveryAt && <p className="text-xs text-green-400 mt-1">Delivery: {formatDateTime(order.deliveryAt)}</p>}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {order.client && (
                <Card className="p-4">
                  <p className="text-xs text-steel-400 mb-2">Client</p>
                  <p className="font-semibold text-steel-100">{order.client.name}</p>
                  {order.client.contactName && <p className="text-xs text-steel-400">{order.client.contactName}</p>}
                  {order.client.phone && <p className="text-xs text-steel-400">{order.client.phone}</p>}
                </Card>
              )}
              {order.truck && (
                <Card className="p-4">
                  <p className="text-xs text-steel-400 mb-2">Truck</p>
                  <p className="font-semibold text-steel-100">{order.truck.unitNumber}</p>
                  <p className="text-xs text-steel-400">{order.truck.year} {order.truck.make} {order.truck.model}</p>
                </Card>
              )}
              {order.driver && (
                <Card className="p-4">
                  <p className="text-xs text-steel-400 mb-2">Driver</p>
                  <p className="font-semibold text-steel-100">{order.driver.firstName} {order.driver.lastName}</p>
                  {order.driver.licenseClass && <p className="text-xs text-steel-400">{order.driver.licenseClass}</p>}
                  {order.driver.phone && <p className="text-xs text-steel-400">{order.driver.phone}</p>}
                </Card>
              )}
              <Card className="p-4">
                <p className="text-xs text-steel-400 mb-2">Financial</p>
                {order.totalCharge && <p className="text-lg font-bold text-green-400">{formatCurrency(order.totalCharge)}</p>}
                {order.rate && <p className="text-xs text-steel-400">${order.rate} {order.rateType.replace(/_/g," ")}</p>}
                {order.driverPay && <p className="text-xs text-steel-400">Driver: {formatCurrency(order.driverPay)}</p>}
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Load Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Description", order.loadDescription],
                  ["Weight", order.weightLbs ? `${order.weightLbs.toLocaleString()} lbs` : null],
                  ["Pieces", order.pieces],
                  ["Pallets", order.pallets],
                  ["Hazmat", order.hazmat ? `Yes${order.hazmatClass ? ` (${order.hazmatClass})` : ""}` : "No"],
                  ["Reference #", order.referenceNumber],
                ].filter(([, v]) => v != null).map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-xs text-steel-400">{k}</p>
                    <p className="text-steel-100">{String(v)}</p>
                  </div>
                ))}
                {order.specialInstructions && (
                  <div className="col-span-2">
                    <p className="text-xs text-steel-400">Special Instructions</p>
                    <p className="text-steel-100 text-sm">{order.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline */}
          <div>
            <Card className="h-full">
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-400" />Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory?.map((event: any, i: number) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${i === order.statusHistory.length - 1 ? "bg-brand-400" : "bg-steel-600"}`} />
                        {i < order.statusHistory.length - 1 && <div className="w-px flex-1 bg-steel-800 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-medium text-steel-200">{event.status.replace(/_/g," ")}</p>
                        {event.note && <p className="text-xs text-steel-400 mt-0.5">{event.note}</p>}
                        <p className="text-xs text-steel-500 mt-0.5">{formatDateTime(event.occurredAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)} title="Update Order Status">
        <div className="space-y-4">
          <Select label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="">Select status...</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_ICONS[s]} {s.replace(/_/g," ")}</option>)}
          </Select>
          <Textarea label="Note (optional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Add a note..." rows={2} />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleStatusUpdate} disabled={!newStatus}>Update</Button>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
