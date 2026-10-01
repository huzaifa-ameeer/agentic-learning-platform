import type { Metadata } from "next";
import { Geist, Roboto_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // no page overrides this, so every route keeps the same title
  title: "Mentaura",
  description: "Learn with AI mentors",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      id="top"
      lang="en"
      className={`${geistSans.variable} ${robotoMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Navbar />
          <ScrollToTop />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}