"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { Textarea, Select } from "@/components/ui/FormFields";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { Product, Category } from "@/types";

interface UploadedImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(
    product?.images?.map((img) => ({
      url: img.url,
      alt: img.alt ?? undefined,
      isPrimary: img.isPrimary,
      order: img.order,
    })) ?? []
  );

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    comparePrice: product?.comparePrice?.toString() ?? "",
    sku: product?.sku ?? "",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    categoryId: product?.categoryId ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price) errs.price = "Price is required";
    else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      errs.price = "Enter a valid price";
    if (form.comparePrice && isNaN(parseFloat(form.comparePrice)))
      errs.comparePrice = "Enter a valid compare price";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        categoryId: form.categoryId || null,
        images,
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast(
          product ? "Product updated successfully!" : "Product created successfully!",
          "success"
        );
        onSuccess(data.data);
      } else {
        toast(data.error ?? "Something went wrong", "error");
      }
    } catch {
      toast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      {/* Name */}
      <Input
        label="Product Name"
        value={form.name}
        onChange={(e) => {
          setForm((f) => ({ ...f, name: e.target.value }));
          if (errors.name) setErrors((er) => ({ ...er, name: "" }));
        }}
        placeholder="e.g. Classic White Sneakers"
        error={errors.name}
        required
      />

      {/* Description */}
      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Describe your product..."
        rows={4}
      />

      {/* Price row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => {
            setForm((f) => ({ ...f, price: e.target.value }));
            if (errors.price) setErrors((er) => ({ ...er, price: "" }));
          }}
          placeholder="0.00"
          error={errors.price}
          required
        />
        <Input
          label="Compare Price"
          type="number"
          step="0.01"
          min="0"
          value={form.comparePrice}
          onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
          placeholder="0.00"
          hint="Original price before discount"
          error={errors.comparePrice}
        />
      </div>

      {/* SKU + Category */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          placeholder="e.g. PROD-001"
          hint="Stock keeping unit"
        />
        <Select
          label="Category"
          options={categoryOptions}
          placeholder="Select category"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        />
      </div>

      {/* Toggle options */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700 font-medium">In Stock</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700 font-medium">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
