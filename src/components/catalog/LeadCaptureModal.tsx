"use client";

import { useState, useEffect } from "react";

interface Props {
  storeId: string;
  storeName: string;
  delayMs?: number;
}

interface FormState {
  name: string;
  phone: string;
}

const EMPTY: FormState = { name: "", phone: "" };

export default function LeadCaptureModal({ storeId, storeName, delayMs = 30000 }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    const key = `lead_shown_${storeId}`;
    if (sessionStorage.getItem(key)) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(key, "1");
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [storeId, delayMs]);

  function handleClose() {
    setOpen(false);
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          storeId,
          notes: `Lead captured from ${storeName} catalog`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("done");
        setTimeout(() => handleClose(), 2500);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!open || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Top gradient strip */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors z-10"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pt-6 pb-7">
          {status === "done" ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">You&apos;re on the list!</h3>
              <p className="text-sm text-gray-500">We&apos;ll be in touch soon with exclusive offers.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Like what you see?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get exclusive deals from {storeName}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp number"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-200"
                >
                  {status === "sending" ? "Saving..." : "Get Exclusive Offers →"}
                </button>

                {status === "error" && (
                  <p className="text-xs text-red-500 text-center">Something went wrong, please try again.</p>
                )}
              </form>

              <p className="text-[11px] text-gray-400 text-center mt-3">
                No spam, ever. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
