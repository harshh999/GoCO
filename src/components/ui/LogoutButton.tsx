"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function LogoutButton({ className, redirectTo = "/login" }: { className?: string; redirectTo?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function performLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      // close modal regardless
      setConfirmOpen(false);
      toast("You have been signed out.", "success");
      // navigate to login page so user can pick role
      router.push(redirectTo || "/login");
      router.refresh();
    } catch {
      // on error, still attempt navigation
      setConfirmOpen(false);
      router.push(redirectTo || "/login");
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className={className ?? "px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"}
      >
        Sign out
      </button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm sign out"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-3.5 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={performLogout}
              className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500"
            >
              Yes, sign out
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to sign out?</p>
      </Modal>
    </>
  );
}
