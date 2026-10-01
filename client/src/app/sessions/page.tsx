import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { SessionsContent } from "@/components/SessionsContent";

export const metadata: Metadata = {
  description: "Sessions for this agent",
};

type Props = {
  searchParams: Promise<{ agent?: string }>;
};

export default async function SessionsPage({ searchParams }: Props) {
  const { agent } = await searchParams;

  if (!agent) {
    redirect("/play-area");
  }

  return (
    <AuthGuard>
      <SessionsContent agentId={agent} />
    </AuthGuard>
  );
}