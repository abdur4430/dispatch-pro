import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/providers/SessionProvider";
import { ApolloProviderWrapper } from "@/providers/ApolloProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DispatchPro — Truck Dispatching Platform",
  description: "Professional truck dispatching management system for modern fleets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased" style={{ background: "var(--dp-bg)", color: "var(--dp-text)" }}>
        <SessionProviderWrapper>
          <ApolloProviderWrapper>
            <ThemeProvider>{children}</ThemeProvider>
          </ApolloProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
