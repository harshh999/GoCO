"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Customer } from "@/types";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
  address: "",
  city: "",
  notes: "",
};

export default function CustomersPageContent() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<{ open: boolean; customer?: Customer }>({ open: false });
  const [viewModal, setViewModal] = useState<{ open: boolean; customer?: Customer }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; customer?: Customer }>({ open: false });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&pageSize=100`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.items);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormModal({ open: true });
  }

  function openEdit(c: Customer) {
    setForm({
      name: c.name,
      phone: c.phone ?? "",
      email: c.email ?? "",
      businessName: c.businessName ?? "",
      address: c.address ?? "",
      city: c.city ?? "",
      notes: c.notes ?? "",
    });
    setFormModal({ open: true, customer: c });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast("Name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!formModal.customer;
      const url = isEdit ? `/api/customers/${formModal.customer!.id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast(isEdit ? "Customer updated" : "Customer added", "success");
        setFormModal({ open: false });
        fetchCustomers();
      } else {
        toast(data.error ?? "Save failed", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.customer) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteModal.customer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Customer deleted", "success");
        setDeleteModal({ open: false });
        fetchCustomers();
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} customers total</p>
        </div>
        <Button onClick={openAdd}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, phone or business..."
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
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">No customers yet</p>
            <p className="text-gray-300 text-xs mt-1">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Business</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Total Purchases</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Purchase</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-gray-500 text-xs font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          {c.city && <p className="text-xs text-gray-400">{c.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.phone ?? "—"}</td>
                    <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{c.businessName ?? "—"}</td>
                    <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">
                      {c.totalPurchases > 0 ? `$${c.totalPurchases.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden lg:table-cell">
                      {formatDate(c.lastPurchaseDate)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewModal({ open: true, customer: c })}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, customer: c })}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.customer ? "Edit Customer" : "Add Customer"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setFormModal({ open: false })}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {formModal.customer ? "Save Changes" : "Add Customer"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 890"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Company or shop name"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* View Customer Modal */}
      <Modal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false })}
        title="Customer Details"
        size="md"
        footer={
          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => { setViewModal({ open: false }); openEdit(viewModal.customer!); }}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setViewModal({ open: false })}>Close</Button>
          </div>
        }
      >
        {viewModal.customer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-gray-600 text-xl font-bold">{viewModal.customer.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewModal.customer.name}</h3>
                {viewModal.customer.businessName && (
                  <p className="text-sm text-gray-500">{viewModal.customer.businessName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Phone", value: viewModal.customer.phone },
                { label: "Email", value: viewModal.customer.email },
                { label: "City", value: viewModal.customer.city },
                { label: "Address", value: viewModal.customer.address },
                { label: "Total Purchases", value: viewModal.customer.totalPurchases > 0 ? `$${viewModal.customer.totalPurchases.toFixed(2)}` : null },
                { label: "Last Purchase", value: formatDate(viewModal.customer.lastPurchaseDate) !== "—" ? formatDate(viewModal.customer.lastPurchaseDate) : null },
                { label: "Customer Since", value: formatDate(viewModal.customer.createdAt) },
              ].map(({ label, value }) => value ? (
                <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-gray-800 font-medium mt-0.5">{value}</p>
                </div>
              ) : null)}
            </div>
            {viewModal.customer.notes && (
              <div className="bg-amber-50 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wider mb-1">Notes</p>
                <p className="text-gray-700 text-sm">{viewModal.customer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Customer"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false })}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
          </div>
        }
      >
        <p className="text-gray-600 text-sm">
          Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteModal.customer?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
