"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useState } from "react";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDateTime, DISPATCH_STATUS_COLORS } from "@/lib/utils";
import { Plus, Navigation, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

const DISPATCH_QUERY = gql`
  query DispatchOrders($filters: DispatchFiltersInput) {
    dispatchOrders(filters: $filters, pageSize: 100) {
      nodes {
        id orderNumber status pickupAt deliveryAt
        originCity originState destCity destState
        distanceMiles totalCharge
        client { name }
        driver { firstName lastName }
        truck { unitNumber }
      }
      pageInfo { total }
    }
  }
`;

const DELETE_ORDER = gql`mutation DeleteOrder($id: ID!) { deleteDispatchOrder(id: $id) }`;

export default function DispatchPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, refetch } = useQuery<any>(DISPATCH_QUERY, { variables: { filters: statusFilter ? { status: statusFilter } : {} } });
  const [deleteOrder] = useMutation<any>(DELETE_ORDER);
  const orders = data?.dispatchOrders?.nodes ?? [];

  const statuses = ["PENDING","CONFIRMED","IN_TRANSIT","AT_PICKUP","LOADED","AT_DELIVERY","DELIVERED","COMPLETED","CANCELLED","ON_HOLD"];

  return (
    <div>
      <AppTopbar title="Dispatch" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-steel-100">Dispatch Orders</h2>
            <p className="text-sm text-steel-400 mt-0.5">{data?.dispatchOrders?.pageInfo?.total ?? "..."} orders</p>
          </div>
          <Link href="/dispatch/new"><Button><Plus className="w-4 h-4" />New Order</Button></Link>
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
          </Select>
        </div>

        {loading && <p className="text-steel-400 text-sm">Loading orders...</p>}

        <Card>
          <div className="divide-y divide-steel-800">
            {orders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-4 hover:bg-steel-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-steel-100">{order.orderNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${DISPATCH_STATUS_COLORS[order.status]}`}>
                        {order.status.replace(/_/g," ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-steel-400 mt-0.5">
                      <span>{order.originCity}, {order.originState}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{order.destCity}, {order.destState}</span>
                      {order.distanceMiles && <span className="text-steel-500">· {order.distanceMiles.toLocaleString()} mi</span>}
                    </div>
                    <p className="text-xs text-steel-500 mt-0.5">
                      {order.client?.name ?? "No client"}{order.truck ? ` · ${order.truck.unitNumber}` : ""}{order.driver ? ` · ${order.driver.firstName} ${order.driver.lastName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    {order.totalCharge && <p className="text-sm font-semibold text-steel-100">{formatCurrency(order.totalCharge)}</p>}
                    {order.pickupAt && <p className="text-xs text-steel-400">{formatDateTime(order.pickupAt)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dispatch/${order.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={async () => { if (confirm(`Delete order ${order.orderNumber}?`)) { await deleteOrder({ variables: { id: order.id } }); refetch(); } }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && orders.length === 0 && (
              <div className="p-12 text-center">
                <Navigation className="w-12 h-12 text-steel-600 mx-auto mb-3" />
                <p className="text-steel-400">No dispatch orders found.</p>
                <Link href="/dispatch/new"><Button className="mt-4"><Plus className="w-4 h-4" />Create First Order</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
