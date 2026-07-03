"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UsersIcon,
  UserPlusIcon,
  VideoIcon,
  ExternalLinkIcon,
  SearchIcon,
  Trash2Icon,
  PencilIcon,
  ActivityIcon,
  MailIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminImage } from "@/components/admin-image";
import { AdminStatCard } from "../components/admin-stat-card";
import { ConfirmDialog } from "../components/confirm-dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export const AdminUsersView = () => {
  const { data: users, isLoading, error } = trpc.admin.getAllUsers.useQuery();
  const { data: userStats, isLoading: statsLoading } = trpc.admin.getUserStats.useQuery();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const inviteMutation = trpc.admin.inviteUser.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setInviteOpen(false);
      setInviteEmail("");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  const onlineCount = useMemo(() => {
    if (!users) return 0;
    const now = Date.now();
    return users.filter(
      (u) => u.lastSeenAt && now - new Date(u.lastSeenAt).getTime() < 5 * 60 * 1000
    ).length;
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage platform users and permissions
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlusIcon className="size-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Users"
          icon={UsersIcon}
          value={userStats?.totalUsers ?? 0}
          gradient="from-emerald-500 to-emerald-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="New This Week"
          icon={UserPlusIcon}
          value={userStats?.newThisWeek ?? 0}
          gradient="from-teal-500 to-teal-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="Content Creators"
          icon={VideoIcon}
          value={userStats?.contentCreators ?? 0}
          description="Users with videos"
          gradient="from-cyan-500 to-teal-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="Online Now"
          icon={ActivityIcon}
          value={onlineCount}
          description="Active in last 5 min"
          gradient="from-emerald-600 to-teal-700"
          isLoading={isLoading}
        />
      </div>

      {/* Users Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5 text-emerald-600" />
            All Users
            {users && (
              <span className="text-sm font-normal text-gray-500">
                ({filteredUsers.length}{search ? ` of ${users.length}` : ""})
              </span>
            )}
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-white/90"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-emerald-50/80 rounded-xl font-medium text-sm text-gray-700">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2">Videos</div>
              <div className="col-span-2">Subscribers</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {isLoading ? (
              <>
                <UserRowSkeleton />
                <UserRowSkeleton />
                <UserRowSkeleton />
              </>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading users</p>
                <p className="text-sm text-gray-500">{error.message}</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
            ) : (
              <div className="text-center text-gray-500 py-8">
                <UsersIcon className="size-12 mx-auto mb-4 text-gray-400" />
                <p>{search ? `No users match "${search}"` : "No users found"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite dialog — sends a real Clerk invitation email */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailIcon className="size-5 text-emerald-600" />
              Invite a User
            </DialogTitle>
            <DialogDescription>
              Sends an email invitation via Clerk. The recipient gets a sign-up
              link for the platform.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inviteEmail.trim()) {
                inviteMutation.mutate({ email: inviteEmail.trim() });
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                required
                placeholder="student@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {inviteMutation.isPending ? "Sending…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface UserRowProps {
  user: {
    id: string;
    clerkId: string;
    name: string;
    imageUrl: string;
    createdAt: Date;
    lastSeenAt: Date | null;
    videoCount: number;
    subscriberCountReal: number;
    subscriberCountAdded: number;
  };
}

function getOnlineStatus(lastSeenAt: Date | null): { isOnline: boolean; status: string; dotClass: string; textClass: string } {
  if (!lastSeenAt) {
    return { isOnline: false, status: "Never seen", dotClass: "bg-gray-400", textClass: "text-gray-400" };
  }

  const diffMins = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / (1000 * 60));

  if (diffMins < 5) {
    return { isOnline: true, status: "Online", dotClass: "bg-emerald-500", textClass: "text-emerald-600" };
  } else if (diffMins < 60) {
    return { isOnline: false, status: `${diffMins}m ago`, dotClass: "bg-amber-400", textClass: "text-amber-600" };
  }
  return {
    isOnline: false,
    status: formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true }),
    dotClass: "bg-gray-400",
    textClass: "text-gray-400",
  };
}

const UserRow = ({ user }: UserRowProps) => {
  const utils = trpc.useUtils();
  const [subsOpen, setSubsOpen] = useState(false);
  const [subsValue, setSubsValue] = useState(String(user.subscriberCountAdded));

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success(`Deleted ${user.name}`);
      utils.admin.getAllUsers.invalidate();
      utils.admin.getUserStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateSubsMutation = trpc.admin.updateUserSubscribers.useMutation({
    onSuccess: () => {
      toast.success("Subscriber count updated");
      utils.admin.getAllUsers.invalidate();
      setSubsOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSaveSubscribers = () => {
    const n = Number(subsValue);
    if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
      toast.error("Enter a non-negative whole number");
      return;
    }
    updateSubsMutation.mutate({ userId: user.id, subscribers: n });
  };

  const onlineStatus = getOnlineStatus(user.lastSeenAt);

  return (
    <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 p-4 border border-emerald-100/80 rounded-xl bg-white/50 hover:bg-emerald-50/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
      <div className="col-span-2 md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <AdminImage
            src={user.imageUrl}
            alt={user.name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
            fallback="/user-placeholder.svg"
          />
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${onlineStatus.dotClass}`}
            title={onlineStatus.status}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <span className={`text-xs whitespace-nowrap ${onlineStatus.textClass}`}>
              {onlineStatus.isOnline ? "● Online" : onlineStatus.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}…</p>
        </div>
      </div>
      <div className="hidden md:flex col-span-2 items-center">
        <p className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="flex md:col-span-2 items-center gap-1.5">
        <VideoIcon className="size-3.5 text-gray-400 md:hidden" />
        <p className="text-sm font-medium tabular-nums">{user.videoCount}</p>
      </div>
      <div className="flex md:col-span-2 items-center">
        <p className="text-sm font-medium tabular-nums">
          {(user.subscriberCountReal + user.subscriberCountAdded).toLocaleString()}
          <span className="text-xs text-gray-500 ml-1.5 font-normal">
            ({user.subscriberCountReal}+{user.subscriberCountAdded})
          </span>
        </p>
      </div>
      <div className="col-span-2 md:col-span-2 flex items-center gap-1 md:justify-end">
        <Link href={`/users/${user.id}`} target="_blank">
          <Button size="sm" variant="ghost" className="hover:bg-emerald-100 hover:text-emerald-700" title="View channel">
            <ExternalLinkIcon className="size-4" />
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-emerald-100 hover:text-emerald-700"
          title="Edit subscriber override"
          onClick={() => setSubsOpen(true)}
        >
          <PencilIcon className="size-4" />
        </Button>
        <ConfirmDialog
          title={`Delete ${user.name}?`}
          description="This permanently removes the user, their videos, comments and subscriptions from both Clerk and the database. This cannot be undone."
          confirmLabel="Delete user"
          onConfirm={() => deleteUserMutation.mutate({ id: user.id })}
          trigger={
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-red-100 text-red-600"
              disabled={deleteUserMutation.isPending}
              title="Delete user"
            >
              {deleteUserMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
            </Button>
          }
        />
      </div>

      {/* Subscriber override dialog */}
      <Dialog open={subsOpen} onOpenChange={setSubsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Subscribers — {user.name}</DialogTitle>
            <DialogDescription>
              Shown subscribers = real ({user.subscriberCountReal.toLocaleString()}) + override.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`subs-${user.id}`}>Override amount</Label>
            <Input
              id={`subs-${user.id}`}
              inputMode="numeric"
              value={subsValue}
              onChange={(e) => setSubsValue(e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Will display as {(user.subscriberCountReal + (Number(subsValue) || 0)).toLocaleString()} subscribers.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveSubscribers}
              disabled={updateSubsMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {updateSubsMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const UserRowSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-xl">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
      </div>
    </div>
  );
};
