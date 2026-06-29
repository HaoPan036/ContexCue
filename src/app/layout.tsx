import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ContextCue",
  description: "Social context agent with privacy controlled memory."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
