"use client";
import { useSession } from "next-auth/react";
import { AppTopbar } from "@/components/layout/AppTopbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, User, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div>
      <AppTopbar title="Settings" />
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-steel-800 flex items-center justify-center">
            <Settings className="w-6 h-6 text-steel-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-steel-100">Account Settings</h2>
            <p className="text-sm text-steel-400">Manage your profile and preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-brand-400" />Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Name" defaultValue={user?.name ?? ""} />
            <Input label="Email" type="email" defaultValue={user?.email ?? ""} disabled className="opacity-60" />
            <div className="flex items-center gap-3 text-xs text-steel-400 bg-steel-800/50 rounded-lg px-3 py-2">
              <Shield className="w-4 h-4 text-brand-400" />
              Role: <span className="text-steel-200 font-medium">{user?.role ?? "—"}</span>
              {user?.companyId && <> · Company linked</>}
            </div>
            <Button size="sm">Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-400" />Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm Password" type="password" placeholder="••••••••" />
            <Button variant="secondary" size="sm">Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
