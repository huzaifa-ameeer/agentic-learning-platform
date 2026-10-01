import type { Metadata } from "next";
import { AdminGate } from "@/components/AdminGate";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "admin console | Mentaura",
  description: "Mentaura mentor operations console",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminPanel />
    </AdminGate>
  );
}
