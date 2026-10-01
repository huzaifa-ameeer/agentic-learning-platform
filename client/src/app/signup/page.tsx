import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  description: "Create your Mentaura account",
};

export default function SignupPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <AuthForm mode="signup" />
    </section>
  );
}