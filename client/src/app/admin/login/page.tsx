import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  description: "Mentaura mentor operations console",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <AdminLoginForm />
    </section>
  );
}
