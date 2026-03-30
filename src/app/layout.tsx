import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: {
    default: "Savori — Recipe & Menu Planner",
    template: "%s | Savori",
  },
  description:
    "Discover, save and plan your meals with Savori. Create weekly, bi-weekly and monthly menus from your personal recipe collection.",
  keywords: ["recipes", "meal planning", "menu planner", "cooking", "food"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Savori. Crafted with love for food lovers.
              </p>
            </div>
          </footer>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
