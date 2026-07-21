import type { Metadata } from "next";
import localFont from "next/font/local";
import { NavBar } from "@/components/nav/NavBar";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
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

// Runs before paint to set the theme class, preventing a light/dark flash on load.
const themeScript = `(function(){try{var k='robolab-hub-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${iosevka.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <NavBar />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
