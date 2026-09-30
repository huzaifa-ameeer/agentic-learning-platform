import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "login | Mentaura",
  description: "Sign in to Mentaura",
};

export default function LoginPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <AuthForm mode="login" />
    </section>
  );
}