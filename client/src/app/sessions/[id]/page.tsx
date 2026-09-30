import type { Metadata } from "next";
import { AuthGuard } from "@/components/AuthGuard";
import { SessionDetailContent } from "@/components/SessionDetailContent";

export const metadata: Metadata = {
  title: "session | Mentaura",
  description: "A single learning session",
};

export default function SessionDetailPage() {
  return (
    <AuthGuard>
      <SessionDetailContent />
    </AuthGuard>
  );
}