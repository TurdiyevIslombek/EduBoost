"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TagIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  VideoIcon,
  UploadIcon,
  DownloadIcon,
  BarChart3Icon,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { ConfirmDialog } from "../components/confirm-dialog";

export const AdminCategoriesView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const { data: categories, isLoading, error } = trpc.admin.getAllCategories.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2">
            Organize content with categories
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <PlusIcon className="size-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 backdrop-blur-sm border-white/60 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 rounded-full shadow-sm transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Form */}
      {showAddForm && <AddCategoryForm onClose={() => setShowAddForm(false)} />}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 py-8">
            <p>Error loading categories</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        ) : categories && categories.length > 0 ? (
          categories
            .filter(category => 
              searchTerm === "" || 
              category.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category}
                isEditing={editingCategory === category.id}
                onEdit={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                onEditComplete={() => setEditingCategory(null)}
              />
            ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            <TagIcon className="size-12 mx-auto mb-4 text-gray-400" />
            <p>No categories found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="size-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <BulkImportDialog />
            <Button
              variant="outline"
              className="hover:bg-emerald-50 hover:border-emerald-300"
              onClick={() => {
                if (!categories || categories.length === 0) {
                  toast.error("No categories to export");
                  return;
                }
                const exportData = categories.map(({ name, description }) => ({ name, description }));
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `categories-${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                toast.success(`Exported ${categories.length} categories`);
              }}
            >
              <DownloadIcon className="size-4 mr-2" />
              Export Categories
            </Button>
            <Link href="/admin/analytics">
              <Button variant="outline" className="hover:bg-teal-50 hover:border-teal-300">
                <BarChart3Icon className="size-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Bulk-imports categories from a JSON array of { name, description? }.
// The format matches what "Export Categories" produces.
const BulkImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const utils = trpc.useUtils();

  const bulkMutation = trpc.admin.createCategoriesBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.created} categories${data.skipped ? ` (${data.skipped} already existed)` : ""}`);
      utils.admin.getAllCategories.invalidate();
      setOpen(false);
      setJsonText("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleImport = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      toast.error("Invalid JSON — expected an array like [{\"name\": \"Math\"}]");
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      toast.error("Expected a non-empty JSON array of categories");
      return;
    }

    const items = parsed
      .filter((c): c is { name: string; description?: string } =>
        !!c && typeof c === "object" && typeof (c as { name?: unknown }).name === "string" && !!(c as { name: string }).name.trim()
      )
      .map((c) => ({
        name: c.name.trim().slice(0, 100),
        description: typeof c.description === "string" ? c.description.slice(0, 500) : undefined,
      }));

    if (items.length === 0) {
      toast.error("No valid entries found — each item needs a \"name\"");
      return;
    }

    bulkMutation.mutate({ categories: items.slice(0, 100) });
  };

  return (
    <>
      <Button
        variant="outline"
        className="hover:bg-emerald-50 hover:border-emerald-300"
        onClick={() => setOpen(true)}
      >
        <UploadIcon className="size-4 mr-2" />
        Bulk Import
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Import Categories</DialogTitle>
            <DialogDescription>
              Paste a JSON array. Existing names are skipped automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  { "name": "Mathematics", "description": "Algebra, calculus…" },\n  { "name": "Programming" }\n]`}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleImport}
              disabled={bulkMutation.isPending || !jsonText.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {bulkMutation.isPending ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Add Category Form Component
const AddCategoryForm = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const utils = trpc.useContext();
  const createMutation = trpc.admin.createCategory.useMutation({
    onSuccess: () => {
      utils.admin.getAllCategories.invalidate();
      setName("");
      setDescription("");
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch {
      // Mutation error handled by tRPC
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="size-5" />
          Add New Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description (optional)"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !name.trim()}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {createMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Category Card Component
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    videoCount: number;
  };
  isEditing: boolean;
  onEdit: () => void;
  onEditComplete: () => void;
}

const CategoryCard = ({ category, isEditing, onEdit, onEditComplete }: CategoryCardProps) => {
  const [editName, setEditName] = useState(category.name);
  const [editDescription, setEditDescription] = useState(category.description || "");
  
  const utils = trpc.useContext();
  const updateMutation = trpc.admin.updateCategory.useMutation({
    onSuccess: () => {
      utils.admin.getAllCategories.invalidate();
      onEditComplete();
    },
  });
  
  const deleteMutation = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => {
      utils.admin.getAllCategories.invalidate();
    },
  });

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
    } catch {
      // Mutation error handled by tRPC
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: category.id });
  };

  if (isEditing) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardContent className="p-6 space-y-4">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Category name"
            maxLength={100}
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Category description (optional)"
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleUpdate}
              disabled={updateMutation.isPending || !editName.trim()}
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{category.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {category.description || "No description"}
            </p>
            <p className="text-xs text-gray-400">
              Created {formatDistanceToNow(new Date(category.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white ml-4">
            <TagIcon className="size-4" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VideoIcon className="size-4 text-gray-500" />
            <span className="text-sm font-medium">{category.videoCount} videos</span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="hover:bg-emerald-100"
              onClick={onEdit}
              title="Edit Category"
            >
              <EditIcon className="size-4" />
            </Button>
            <ConfirmDialog
              title={`Delete "${category.name}"?`}
              description={`The category will be removed from ${category.videoCount} video(s); the videos themselves are kept.`}
              confirmLabel="Delete category"
              onConfirm={handleDelete}
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-red-100 text-red-600"
                  disabled={deleteMutation.isPending}
                  title="Delete Category"
                >
                  {deleteMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <TrashIcon className="size-4" />
                  )}
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CategoryCardSkeleton = () => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <TagIcon className="size-4" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VideoIcon className="size-4 text-gray-500" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="hover:bg-emerald-100">
              <EditIcon className="size-4" />
            </Button>
            <Button size="sm" variant="ghost" className="hover:bg-red-100 text-red-600">
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
