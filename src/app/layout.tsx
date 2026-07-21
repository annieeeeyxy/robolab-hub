import type { Metadata } from "next";
import localFont from "next/font/local";
import { NavBar } from "@/components/nav/NavBar";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

// Iosevka Custom — private build plan (term spacing, slab serifs, ss17-derived design).
const iosevka = localFont({
  src: [
    { path: "./fonts/IosevkaCustom-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/IosevkaCustom-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IosevkaCustom-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/IosevkaCustom-ThinItalic.woff2", weight: "100", style: "italic" },
    { path: "./fonts/IosevkaCustom-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/IosevkaCustom-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-iosevka",
  display: "swap",
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
    // Dark-only: colorScheme is declared here so form controls, scrollbars and
    // the like render dark from the first paint. There is no theme class to
    // apply and so no pre-hydration script and no flash to guard against.
    <html lang="en" className={`${iosevka.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <NavBar />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
