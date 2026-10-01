import type { Metadata } from "next";
import { AuthGuard } from "@/components/AuthGuard";
import { PlayAreaContent } from "@/components/PlayAreaContent";

export const metadata: Metadata = {
  description: "Choose an AI mentor and start a session",
};

export default function PlayAreaPage() {
  return (
    <AuthGuard>
      <PlayAreaContent />
    </AuthGuard>
  );
}