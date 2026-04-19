"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Plus, UserCircle, Trash2, Pencil, Phone, Mail } from "lucide-react";
import Link from "next/link";

const DRIVERS_QUERY = gql`
  query Drivers {
    drivers(pageSize: 100) {
      nodes { id firstName lastName email phone licenseClass licenseExpiry status assignedTruckId }
    }
  }
`;

const DELETE_DRIVER = gql`mutation DeleteDriver($id: ID!) { deleteDriver(id: $id) }`;

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-500/20 text-green-400 border-green-500/30",
  ON_DUTY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  OFF_DUTY: "bg-steel-700 text-steel-300 border-steel-600",
  ON_LEAVE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  TERMINATED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DriversPage() {
  const { data, loading, refetch } = useQuery<any>(DRIVERS_QUERY);
  const [deleteDriver] = useMutation<any>(DELETE_DRIVER);

  const drivers = data?.drivers?.nodes ?? [];

  return (
    <div>
      <AppTopbar title="Drivers" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-steel-100">Driver Roster</h2>
            <p className="text-sm text-steel-400 mt-0.5">{drivers.length} drivers</p>
          </div>
          <Link href="/drivers/new"><Button><Plus className="w-4 h-4" />Add Driver</Button></Link>
        </div>

        {loading && <p className="text-steel-400 text-sm">Loading...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {drivers.map((d: any) => {
            const expiry = d.licenseExpiry ? new Date(d.licenseExpiry) : null;
            const licExpired = expiry && expiry < new Date();
            const licExpiringSoon = expiry && !licExpired && expiry < new Date(Date.now() + 30 * 86400000);
            return (
              <Card key={d.id} className="p-5 flex flex-col gap-4 hover:border-steel-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-steel-100">{d.firstName} {d.lastName}</p>
                      <p className="text-xs text-steel-400">{d.licenseClass ?? "No CDL"}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[d.status]}`}>{d.status.replace("_"," ")}</span>
                </div>
                {(d.email || d.phone) && (
                  <div className="space-y-1 text-xs text-steel-400">
                    {d.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{d.email}</div>}
                    {d.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{d.phone}</div>}
                  </div>
                )}
                {expiry && (
                  <div className={`text-xs px-2 py-1 rounded border ${licExpired ? "bg-red-500/10 text-red-400 border-red-500/20" : licExpiringSoon ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-steel-800 text-steel-400 border-steel-700"}`}>
                    CDL expires: {formatDate(d.licenseExpiry)}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-steel-800">
                  <Link href={`/drivers/${d.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Pencil className="w-3 h-3" />View</Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={async () => { if (confirm(`Delete ${d.firstName} ${d.lastName}?`)) { await deleteDriver({ variables: { id: d.id } }); refetch(); } }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        {!loading && drivers.length === 0 && (
          <Card className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No drivers yet.</p>
            <Link href="/drivers/new"><Button className="mt-4"><Plus className="w-4 h-4" />Add Driver</Button></Link>
          </Card>
        )}
      </div>
    </div>
  );
}
