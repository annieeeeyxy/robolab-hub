import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/nav/NavBar";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";
import "./ftc.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RoboLab Hub",
    template: "%s · RoboLab Hub",
  },
  description:
    "Build robot control plans with RoboPrompt and learn FTC programming in the RoboLab simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <NavBar />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
