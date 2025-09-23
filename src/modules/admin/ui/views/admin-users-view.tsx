"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UsersIcon, 
  UserPlusIcon, 
  BanIcon, 
  VideoIcon,
  UserIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminImage } from "@/components/admin-image";

export const AdminUsersView = () => {
  const { data: users, isLoading, error } = trpc.admin.getAllUsers.useQuery();
  const { data: userStats, isLoading: statsLoading } = trpc.admin.getUserStats.useQuery();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage platform users and permissions
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => {
            const email = prompt("Enter email address to invite user:");
            if (email) {
              alert("User invitation functionality coming soon! For now, users can sign up directly on the platform.");
            }
          }}
        >
          <UserPlusIcon className="size-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <UsersIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : userStats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <UserPlusIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New This Week</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : userStats?.newThisWeek || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <VideoIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Content Creators</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : userStats?.contentCreators || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white">
                <BanIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Banned Users</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : userStats?.bannedUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 rounded-lg font-medium text-sm text-gray-700">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Join Date</div>
              <div className="col-span-2">Videos</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* User Rows */}
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
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <UsersIcon className="size-12 mx-auto mb-4 text-gray-400" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
    videoCount: number;
  };
}

const UserRow = ({ user }: UserRowProps) => {
  const utils = trpc.useContext();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      utils.admin.getAllUsers.invalidate();
    },
  });

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync({ id: user.id });
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <AdminImage
          src={user.imageUrl}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
          fallback="/user-placeholder.svg"
        />
        <div className="space-y-1">
          <p className="font-medium text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <p className="text-sm">
          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </p>
      </div>
      <div className="col-span-2 flex items-center">
        <p className="text-sm font-medium">{user.videoCount}</p>
      </div>
      <div className="col-span-2 flex items-center">
        <Badge variant="default" className="bg-green-100 text-green-800">
          Active
        </Badge>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <Button size="sm" variant="ghost" className="hover:bg-blue-100" title="View User">
          <UserIcon className="size-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="hover:bg-red-100 text-red-600"
          onClick={handleDeleteUser}
          disabled={deleteUserMutation.isPending}
          title="Delete User"
        >
          {deleteUserMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <BanIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const UserRowSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
      </div>
    </div>
  );
};
