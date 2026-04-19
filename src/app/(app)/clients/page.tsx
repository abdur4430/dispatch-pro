"use client";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, Trash2, Pencil, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const CLIENTS_QUERY = gql`
  query Clients {
    clients(pageSize: 100) {
      nodes { id name contactName email phone city state isActive }
    }
  }
`;
const DELETE_CLIENT = gql`mutation DeleteClient($id: ID!) { deleteClient(id: $id) }`;

export default function ClientsPage() {
  const { data, loading, refetch } = useQuery<any>(CLIENTS_QUERY);
  const [deleteClient] = useMutation<any>(DELETE_CLIENT);
  const clients = data?.clients?.nodes ?? [];

  return (
    <div>
      <AppTopbar title="Clients" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-steel-100">Client Directory</h2>
            <p className="text-sm text-steel-400 mt-0.5">{clients.length} clients</p>
          </div>
          <Link href="/clients/new"><Button><Plus className="w-4 h-4" />Add Client</Button></Link>
        </div>

        {loading && <p className="text-steel-400 text-sm">Loading...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c: any) => (
            <Card key={c.id} className="p-5 flex flex-col gap-3 hover:border-steel-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-steel-100">{c.name}</p>
                  {c.contactName && <p className="text-xs text-steel-400 mt-0.5">{c.contactName}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${c.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-steel-700 text-steel-400 border-steel-600"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-steel-400">
                {c.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{c.phone}</div>}
                {c.city && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" />{c.city}, {c.state}</div>}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-steel-800">
                <Link href={`/clients/${c.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full"><Pencil className="w-3 h-3" />View</Button>
                </Link>
                <Button variant="destructive" size="icon" onClick={async () => { if (confirm(`Delete ${c.name}?`)) { await deleteClient({ variables: { id: c.id } }); refetch(); } }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {!loading && clients.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No clients yet.</p>
            <Link href="/clients/new"><Button className="mt-4"><Plus className="w-4 h-4" />Add Client</Button></Link>
          </Card>
        )}
      </div>
    </div>
  );
}
