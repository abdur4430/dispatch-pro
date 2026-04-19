"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, DISPATCH_STATUS_COLORS } from "@/lib/utils";
import { Truck, Users, Navigation, DollarSign, CheckCircle, Clock, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";

const DashboardGlobe = dynamic(() => import("@/components/three/DashboardGlobe"), { ssr: false });

const DASHBOARD_QUERY = gql`
  query Dashboard {
    dashboardStats {
      totalTrucks availableTrucks trucksOnRoute
      totalDrivers availableDrivers activeDispatches
      completedThisMonth revenueThisMonth pendingOrders
    }
    recentDispatchOrders(limit: 8) {
      id orderNumber status pickupAt destCity destState
      client { name }
      truck { unitNumber }
    }
  }
`;

function StatCard({ label, value, sub, icon: Icon, color = "blue" }: any) {
  const colors: any = {
    blue: "text-brand-400 bg-brand-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-steel-100">{value}</p>
        <p className="text-sm text-steel-400">{label}</p>
        {sub && <p className="text-xs text-steel-500 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading } = useQuery<any>(DASHBOARD_QUERY);
  const stats = data?.dashboardStats;

  return (
    <div>
      <AppTopbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Fleet" value={loading ? "—" : stats?.totalTrucks} sub={`${stats?.availableTrucks ?? "—"} available`} icon={Truck} color="blue" />
          <StatCard label="Active Dispatches" value={loading ? "—" : stats?.activeDispatches} sub={`${stats?.pendingOrders ?? "—"} pending`} icon={Navigation} color="yellow" />
          <StatCard label="Drivers" value={loading ? "—" : stats?.totalDrivers} sub={`${stats?.availableDrivers ?? "—"} available`} icon={Users} color="green" />
          <StatCard label="Revenue This Month" value={loading ? "—" : formatCurrency(stats?.revenueThisMonth)} sub={`${stats?.completedThisMonth ?? "—"} completed`} icon={DollarSign} color="purple" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-steel-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-400" /> Recent Dispatches
              </h2>
              <Link href="/dispatch" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
            </div>
            <Card>
              <div className="divide-y divide-steel-800">
                {loading && <div className="p-4 text-steel-400 text-sm">Loading...</div>}
                {data?.recentDispatchOrders?.map((order: any) => (
                  <Link key={order.id} href={`/dispatch/${order.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-steel-800/50 transition-colors group">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-steel-100 group-hover:text-brand-400 transition-colors">{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${DISPATCH_STATUS_COLORS[order.status]}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-steel-400 mt-0.5">
                        {order.client?.name ?? "No client"} → {order.destCity}, {order.destState}
                        {order.truck && ` · Truck ${order.truck.unitNumber}`}
                      </p>
                    </div>
                    <span className="text-xs text-steel-500">{formatDateTime(order.pickupAt)}</span>
                  </Link>
                ))}
                {!loading && !data?.recentDispatchOrders?.length && (
                  <div className="p-8 text-center text-steel-400 text-sm">
                    No dispatches yet. <Link href="/dispatch/new" className="text-brand-400 hover:underline">Create your first order</Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Globe */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-steel-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" /> Route Activity
            </h2>
            <Card className="h-72 overflow-hidden p-0">
              <DashboardGlobe />
            </Card>
            <Card className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-brand-400">{stats?.trucksOnRoute ?? "—"}</p>
                  <p className="text-xs text-steel-400 mt-1">On Route</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats?.completedThisMonth ?? "—"}</p>
                  <p className="text-xs text-steel-400 mt-1">Completed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
