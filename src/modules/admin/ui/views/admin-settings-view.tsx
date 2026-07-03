"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  SettingsIcon,
  ShieldIcon,
  BellIcon,
  ServerIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  XCircleIcon,
  DatabaseIcon,
  ZapIcon,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const externalTools = [
  { name: "Google Search Console", href: "https://search.google.com/search-console", description: "Indexing & search performance" },
  { name: "Clerk Dashboard", href: "https://dashboard.clerk.com", description: "Users, sessions, invitations" },
  { name: "Mux Dashboard", href: "https://dashboard.mux.com", description: "Video assets & streaming" },
  { name: "Vercel Dashboard", href: "https://vercel.com/dashboard", description: "Deployments, logs, cron jobs" },
  { name: "Neon Console", href: "https://console.neon.tech", description: "Postgres database" },
  { name: "Upstash Console", href: "https://console.upstash.com", description: "Redis, rate limits, QStash" },
];

export const AdminSettingsView = () => {
  // Notification settings (persisted per-browser)
  const [notifNewUser, setNotifNewUser] = useState(true);
  const [notifUpload, setNotifUpload] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);

  // Admin allowlist (read-only display; source of truth is ADMIN_EMAILS)
  const adminEmailsQuery = trpc.admin.getAdminEmails.useQuery();
  const adminEmails = adminEmailsQuery.data ?? [];

  // Real system status
  const systemStatus = trpc.admin.getSystemStatus.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

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
          Platform controls, live system status and admin access
        </p>
      </div>

      {/* System Status — real checks */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="size-5 text-emerald-600" />
            System Status
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => systemStatus.refetch()}
            disabled={systemStatus.isFetching}
            className="rounded-full border-emerald-200 hover:bg-emerald-50"
          >
            <RefreshCwIcon className={`size-3.5 mr-1.5 ${systemStatus.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {systemStatus.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : systemStatus.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusTile
                  label="Database"
                  ok={systemStatus.data.db}
                  icon={DatabaseIcon}
                  detail={systemStatus.data.db ? "Neon Postgres connected" : "Unreachable"}
                />
                <StatusTile
                  label="Redis"
                  ok={systemStatus.data.redis}
                  icon={ZapIcon}
                  detail={systemStatus.data.redis ? "Upstash connected" : "Unreachable"}
                />
                <StatusTile
                  label="Metric Schedules"
                  ok
                  icon={RefreshCwIcon}
                  detail={`${systemStatus.data.activeSchedules} active`}
                />
                <StatusTile
                  label="Admins"
                  ok={systemStatus.data.services.adminEmails > 0}
                  icon={ShieldIcon}
                  detail={`${systemStatus.data.services.adminEmails} configured`}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <ServiceBadge name="Clerk" configured={systemStatus.data.services.clerk} />
                <ServiceBadge name="Mux" configured={systemStatus.data.services.mux} />
                <ServiceBadge name="UploadThing" configured={systemStatus.data.services.uploadthing} />
                <ServiceBadge name="QStash" configured={systemStatus.data.services.qstash} />
                <ServiceBadge name="Cron Secret" configured={systemStatus.data.services.cronSecret} />
              </div>
              <p className="text-xs text-gray-400">
                Checked {new Date(systemStatus.data.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500">Failed to load system status</p>
          )}
        </CardContent>
      </Card>

      {/* Maintenance Banner */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-amber-500" />
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
              maxLength={500}
            />
          </div>

          {bannerEnabled && bannerMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">Preview:</p>
              <p className="text-sm text-amber-700 mt-1">{bannerMessage}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={saveBannerSettings}
              disabled={bannerMutation.isPending}
            >
              {bannerMutation.isPending ? "Saving…" : "Save Banner Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Access */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="size-5 text-emerald-600" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email{adminEmails.length > 1 ? "s" : ""}</Label>
            <Input
              id="admin-email"
              readOnly
              value={adminEmailsQuery.isLoading ? "Loading…" : adminEmails.join(", ") || "Not configured"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Managed via the <code className="font-mono bg-emerald-50 px-1 py-0.5 rounded">ADMIN_EMAILS</code> environment
              variable (comma-separated). Every admin API call is verified server-side against this list —
              changing it requires a redeploy, which is intentional.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="size-5 text-teal-600" />
            Notification Preferences
            <span className="text-xs font-normal text-gray-400">(stored in this browser)</span>
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
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              onClick={saveNotifSettings}
            >
              Save Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External tools */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5 text-emerald-600" />
            Service Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {externalTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-2 p-4 rounded-xl border border-emerald-100/80 bg-white/50 hover:bg-emerald-50/60 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{tool.name}</p>
                  <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                </div>
                <ExternalLinkIcon className="size-4 text-gray-300 group-hover:text-emerald-600 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatusTile = ({
  label,
  ok,
  detail,
  icon: Icon,
}: {
  label: string;
  ok: boolean;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div
    className={`p-4 rounded-2xl border transition-colors ${
      ok ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
    }`}
  >
    <div className="flex items-center gap-2">
      <Icon className={`size-4 ${ok ? "text-emerald-600" : "text-red-500"}`} />
      <span className="text-sm font-semibold text-gray-800">{label}</span>
    </div>
    <div className="flex items-center gap-1.5 mt-2">
      {ok ? (
        <CheckCircle2Icon className="size-4 text-emerald-600" />
      ) : (
        <XCircleIcon className="size-4 text-red-500" />
      )}
      <span className={`text-xs ${ok ? "text-emerald-700" : "text-red-600"}`}>{detail}</span>
    </div>
  </div>
);

const ServiceBadge = ({ name, configured }: { name: string; configured: boolean }) => (
  <Badge
    variant="outline"
    className={
      configured
        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-600"
    }
  >
    {configured ? <CheckCircle2Icon className="size-3 mr-1" /> : <XCircleIcon className="size-3 mr-1" />}
    {name}
  </Badge>
);
