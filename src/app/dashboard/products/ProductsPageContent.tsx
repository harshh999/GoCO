"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ProductForm from "@/components/forms/ProductForm";
import { useToast } from "@/components/ui/Toast";
import { Product, Category } from "@/types";
import { formatPrice, getPrimaryImage } from "@/lib/utils";

export default function ProductsPageContent() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/products?search=${encodeURIComponent(search)}&pageSize=50`),
        fetch("/api/categories"),
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      if (pData.success) setProducts(pData.data.items);
      if (cData.success) setCategories(cData.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Product deleted", "success");
        setDeleteModal({ open: false });
        fetchData();
      } else {
        toast(data.error ?? "Delete failed", "error");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products total</p>
        </div>
        <Button onClick={() => setFormModal({ open: true })}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No products yet.</p>
            <Button className="mt-3" size="sm" onClick={() => setFormModal({ open: true })}>
              Add your first product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const imageUrl = getPrimaryImage(product.images);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-gray-400">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {product.category?.name ?? <span className="text-gray-300">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
                          {product.comparePrice && (
                            <span className="text-xs text-gray-400 ml-1.5 line-through">{formatPrice(product.comparePrice)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <Badge variant={product.inStock ? "green" : "red"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                          {product.featured && <Badge variant="yellow">Featured</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormModal({ open: true, product })}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteModal({ open: true, product })}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.product ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <ProductForm
          product={formModal.product}
          categories={categories}
          onSuccess={() => {
            setFormModal({ open: false });
            fetchData();
          }}
          onCancel={() => setFormModal({ open: false })}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Product"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false })}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{deleteModal.product?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
