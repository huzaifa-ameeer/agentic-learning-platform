import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { NewSessionContent } from "@/components/NewSessionContent";

export const metadata: Metadata = {
  description: "Start a new learning session",
};

type Props = {
  searchParams: Promise<{ agent?: string }>;
};

export default async function NewSessionPage({ searchParams }: Props) {
  const { agent } = await searchParams;

  if (!agent) {
    redirect("/play-area");
  }

  return (
    <AuthGuard>
      <NewSessionContent agentId={agent} />
    </AuthGuard>
  );
}