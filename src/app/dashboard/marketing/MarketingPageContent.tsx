"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Customer } from "@/types";

// Placeholder WhatsApp sender — replace with real API integration when ready
async function sendWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean }> {
  // TODO: Replace with actual WhatsApp Business API call
  console.log(`[WhatsApp] Sending to ${phone}: ${message}`);
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}

type SendStatus = "idle" | "sending" | "done";

interface SendResult {
  customerId: string;
  name: string;
  phone: string;
  status: "sent" | "failed" | "no-phone";
}

export default function MarketingPageContent() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [results, setResults] = useState<SendResult[]>([]);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers?pageSize=500");
      const data = await res.json();
      if (data.success) setCustomers(data.data.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search) ||
      (c.businessName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  async function handleSend() {
    if (selected.size === 0) {
      toast("Please select at least one customer", "error");
      return;
    }
    if (!message.trim()) {
      toast("Please enter a message", "error");
      return;
    }

    setSendStatus("sending");
    setResults([]);

    const targets = customers.filter((c) => selected.has(c.id));
    const sendResults: SendResult[] = [];

    for (const c of targets) {
      if (!c.phone) {
        sendResults.push({ customerId: c.id, name: c.name, phone: "—", status: "no-phone" });
        continue;
      }
      const { success } = await sendWhatsAppMessage(c.phone, message);
      sendResults.push({ customerId: c.id, name: c.name, phone: c.phone, status: success ? "sent" : "failed" });
    }

    setResults(sendResults);
    setSendStatus("done");

    const sentCount = sendResults.filter((r) => r.status === "sent").length;
    toast(`Message sent to ${sentCount} customer${sentCount !== 1 ? "s" : ""}`, "success");
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500 text-sm mt-0.5">Send bulk WhatsApp messages to your customers</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Customer selector */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 shrink-0">
              {selected.size} selected
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {/* Select all row */}
              {filtered.length > 0 && (
                <div
                  className="flex items-center gap-3 px-5 py-3 bg-gray-50/60 cursor-pointer hover:bg-gray-100/60 transition-colors"
                  onClick={toggleAll}
                >
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Select all ({filtered.length})
                  </span>
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                  No customers found
                </div>
              ) : (
                filtered.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSelect(c.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-gray-500 text-xs font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone ?? "No phone"}</p>
                    </div>
                    {!c.phone && (
                      <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">No phone</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Message composer */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your WhatsApp message here..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{message.length} chars</span>
              <span>{selected.size} recipient{selected.size !== 1 ? "s" : ""}</span>
            </div>
            <Button
              className="w-full"
              onClick={handleSend}
              loading={sendStatus === "sending"}
              disabled={sendStatus === "sending"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {sendStatus === "sending" ? "Sending..." : "Send WhatsApp Message"}
            </Button>
          </div>

          {/* Send results */}
          {results.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Send Status</h2>
                <button
                  onClick={() => { setResults([]); setSendStatus("idle"); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {results.map((r) => (
                  <div key={r.customerId} className="flex items-center gap-3 text-sm">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        r.status === "sent" ? "bg-green-400" :
                        r.status === "failed" ? "bg-red-400" : "bg-amber-400"
                      }`}
                    />
                    <span className="flex-1 truncate text-gray-700">{r.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {r.status === "sent" ? "Sent" : r.status === "failed" ? "Failed" : "No phone"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-50 text-xs text-gray-400 flex gap-4">
                <span className="text-green-600 font-medium">{results.filter(r => r.status === "sent").length} sent</span>
                <span className="text-red-500 font-medium">{results.filter(r => r.status === "failed").length} failed</span>
                <span className="text-amber-500 font-medium">{results.filter(r => r.status === "no-phone").length} no phone</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
