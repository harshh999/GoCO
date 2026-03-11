"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Textarea } from "@/components/ui/FormFields";
import { useToast } from "@/components/ui/Toast";
import { Category } from "@/types";

export default function CategoriesPageContent() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openForm(category?: Category) {
    setForm({ name: category?.name ?? "", description: category?.description ?? "" });
    setErrors({});
    setFormModal({ open: true, category });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Category name is required" });
      return;
    }
    setSaving(true);
    try {
      const url = formModal.category
        ? `/api/categories/${formModal.category.id}`
        : "/api/categories";
      const method = formModal.category ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast(formModal.category ? "Category updated!" : "Category created!", "success");
        setFormModal({ open: false });
        fetchCategories();
      } else {
        toast(data.error ?? "Something went wrong", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.category) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteModal.category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Category deleted", "success");
        setDeleteModal({ open: false });
        fetchCategories();
      } else {
        toast(data.error ?? "Delete failed", "error");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <Button onClick={() => openForm()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-500 text-sm">No categories yet.</p>
            <Button className="mt-3" size="sm" onClick={() => openForm()}>
              Add first category
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="default">
                    {(cat as Category & { _count?: { products: number } })._count?.products ?? 0} products
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => openForm(cat)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setDeleteModal({ open: true, category: cat })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.category ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              if (errors.name) setErrors({});
            }}
            placeholder="e.g. Electronics"
            error={errors.name}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional description..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormModal({ open: false })}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {formModal.category ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false })}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{deleteModal.category?.name}</span>?
          Products in this category will become uncategorized.
        </p>
      </Modal>
    </div>
  );
}
