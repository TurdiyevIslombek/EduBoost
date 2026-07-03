"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquareIcon,
  SearchIcon,
  Trash2Icon,
  ExternalLinkIcon,
  CornerDownRightIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminImage } from "@/components/admin-image";
import { ConfirmDialog } from "../components/confirm-dialog";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export const AdminCommentsView = () => {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data: comments, isLoading, error } = trpc.admin.getRecentComments.useQuery(
    { search: submittedSearch || undefined, limit: 100 },
    { staleTime: 30_000 }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.admin.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.admin.getRecentComments.invalidate();
      utils.admin.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Comment Moderation
          </h1>
          <p className="text-gray-600 mt-2">
            Review and remove comments across the platform
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittedSearch(search.trim());
            }}
            className="flex gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search comment text…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full bg-white/90"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="rounded-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Search
            </Button>
            {submittedSearch && (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-gray-500"
                onClick={() => {
                  setSearch("");
                  setSubmittedSearch("");
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="size-5 text-emerald-600" />
            {submittedSearch ? `Results for "${submittedSearch}"` : "Latest Comments"}
            {comments && (
              <span className="text-sm font-normal text-gray-500">({comments.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-40 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading comments</p>
                <p className="text-sm text-gray-500">{error.message}</p>
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 border border-emerald-100/80 rounded-xl bg-white/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all duration-200"
                >
                  <AdminImage
                    src={comment.user.imageUrl}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10 shrink-0"
                    fallback="/user-placeholder.svg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      {comment.parentId && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                          <CornerDownRightIcon className="size-3" /> reply
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 break-words">{comment.value}</p>
                    <Link
                      href={`/videos/${comment.video.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      <ExternalLinkIcon className="size-3" />
                      <span className="truncate max-w-[280px]">{comment.video.title}</span>
                    </Link>
                  </div>
                  <ConfirmDialog
                    title="Delete this comment?"
                    description={`"${comment.value.slice(0, 120)}${comment.value.length > 120 ? "…" : ""}" — replies to it are deleted too. This cannot be undone.`}
                    confirmLabel="Delete comment"
                    onConfirm={() => deleteMutation.mutate({ id: comment.id })}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-red-100 text-red-600 shrink-0 self-start"
                        title="Delete comment"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    }
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <MessageSquareIcon className="size-12 mx-auto mb-4 text-gray-300" />
                <p>{submittedSearch ? "No comments match your search" : "No comments yet"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
