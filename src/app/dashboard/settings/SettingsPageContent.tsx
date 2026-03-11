"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { StoreSettings } from "@/types";

const defaultSettings: Partial<StoreSettings> = {
  storeName: "",
  storeTagline: "",
  currency: "USD",
  currencySymbol: "$",
  primaryColor: "#000000",
  accentColor: "#6366f1",
};

export default function SettingsPageContent() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Partial<StoreSettings>>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSettings(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast("Settings saved!", "success");
      } else {
        toast(data.error ?? "Save failed", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure your store display and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Store Information</h2>
          <Input
            label="Store Name"
            value={settings.storeName ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, storeName: e.target.value }))}
            placeholder="GoRetail Store"
            required
          />
          <Input
            label="Tagline"
            value={settings.storeTagline ?? ""}
            onChange={(e) => setSettings((s) => ({ ...s, storeTagline: e.target.value }))}
            placeholder="Discover our collection"
          />
        </div>

        {/* Currency */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Currency</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Currency Code"
              value={settings.currency ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
              placeholder="USD"
              hint="e.g. USD, EUR, GBP"
            />
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, currencySymbol: e.target.value }))}
              placeholder="$"
              hint="e.g. $, €, £"
            />
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Branding Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor ?? "#000000"}
                  onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                />
                <Input
                  value={settings.primaryColor ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, primaryColor: e.target.value }))}
                  placeholder="#000000"
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor ?? "#6366f1"}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                />
                <Input
                  value={settings.accentColor ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  placeholder="#6366f1"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Catalog Access</h2>
          <p className="text-sm text-gray-500">
            Your public catalog is accessible at:
          </p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
            <span className="text-sm text-gray-700 font-mono">
              {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/catalog
            </span>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/catalog`;
                navigator.clipboard.writeText(url);
                toast("Catalog URL copied!", "success");
              }}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
