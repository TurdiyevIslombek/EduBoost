"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  SettingsIcon, 
  ShieldIcon,
  BellIcon,
  ServerIcon,
  AlertTriangleIcon
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const AdminSettingsView = () => {
  // Notification settings (persisted locally for now)
  const [notifNewUser, setNotifNewUser] = useState(true);
  const [notifUpload, setNotifUpload] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);

  // Admin allowlist (read-only display; source of truth is ADMIN_EMAILS)
  const adminEmailsQuery = trpc.admin.getAdminEmails.useQuery();
  const adminEmails = adminEmailsQuery.data ?? [];

  // Maintenance banner (stored in Redis via tRPC)
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const bannerQuery = trpc.admin.getMaintenanceBanner.useQuery();
  const bannerMutation = trpc.admin.setMaintenanceBanner.useMutation({
    onSuccess: () => {
      toast.success("Maintenance banner settings saved");
      bannerQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (bannerQuery.data) {
      setBannerEnabled(bannerQuery.data.enabled);
      setBannerMessage(bannerQuery.data.message);
    }
  }, [bannerQuery.data]);

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const s = JSON.parse(localStorage.getItem("adminNotifSettings") || "{}");
      if (typeof s.notifNewUser === "boolean") setNotifNewUser(s.notifNewUser);
      if (typeof s.notifUpload === "boolean") setNotifUpload(s.notifUpload);
      if (typeof s.notifSystem === "boolean") setNotifSystem(s.notifSystem);
    } catch {}
  }, []);

  const saveNotifSettings = () => {
    const payload = { notifNewUser, notifUpload, notifSystem };
    localStorage.setItem("adminNotifSettings", JSON.stringify(payload));
    toast.success("Notification settings saved");
  };

  const saveBannerSettings = () => {
    bannerMutation.mutate({ enabled: bannerEnabled, message: bannerMessage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Admin Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Maintenance Banner */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5" />
            Maintenance Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Banner</Label>
              <p className="text-sm text-gray-500">Show a maintenance message on the home page</p>
            </div>
            <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-message">Banner Message</Label>
            <Textarea
              id="banner-message"
              value={bannerMessage}
              onChange={(e) => setBannerMessage(e.target.value)}
              placeholder="We're working to improve the experience. Videos will return soon."
              rows={3}
            />
          </div>

          {bannerEnabled && bannerMessage && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Preview:</p>
              <p className="text-sm text-amber-700 mt-1">{bannerMessage}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600" onClick={saveBannerSettings}>
              Save Banner Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="EduBoost" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">Site Description</Label>
              <Input id="site-description" defaultValue="The best platform to boost your education" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email{adminEmails.length > 1 ? "s" : ""}</Label>
            <Input
              id="admin-email"
              readOnly
              value={adminEmailsQuery.isLoading ? "Loading…" : adminEmails.join(", ") || "Not configured"}
            />
            <p className="text-xs text-gray-500">
              Managed via the <code className="font-mono">ADMIN_EMAILS</code> environment variable.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>User Registration</Label>
              <p className="text-sm text-gray-500">Allow new users to register</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Verification</Label>
              <p className="text-sm text-gray-500">Require email verification for new users</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
              Save General Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="size-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Login Attempts Limit</Label>
              <p className="text-sm text-gray-500">Limit failed login attempts</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" type="number" defaultValue="60" className="w-32" />
          </div>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-red-500 to-red-600">
              Save Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="size-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New User Notifications</Label>
              <p className="text-sm text-gray-500">Get notified when new users register</p>
            </div>
            <Switch checked={notifNewUser} onCheckedChange={setNotifNewUser} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Video Upload Notifications</Label>
              <p className="text-sm text-gray-500">Get notified about new video uploads</p>
            </div>
            <Switch checked={notifUpload} onCheckedChange={setNotifUpload} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>System Alerts</Label>
              <p className="text-sm text-gray-500">Receive system maintenance alerts</p>
            </div>
            <Switch checked={notifSystem} onCheckedChange={setNotifSystem} />
          </div>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-green-500 to-green-600" onClick={saveNotifSettings}>
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="size-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Platform Version</Label>
                <p className="text-lg font-semibold">EduBoost v1.0.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Database Status</Label>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Backup</Label>
                <p className="text-lg font-semibold">Never</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Server Uptime</Label>
                <p className="text-lg font-semibold text-emerald-600">100%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
