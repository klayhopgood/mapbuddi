import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "@/components/ui/Toaster";
import Script from "next/script";

export const metadata = {
  title: "MapBuddi - WanderList marketplace",
  description: "Discover and share curated WanderLists from local experts. Find the best places to visit and sync them directly to Google Maps.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            defer
            data-domain="mapbuddi.com"
            src="https://plausible.io/js/script.tagged-events.js"
          ></script>
        </head>
        <body>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-78X0XMB9JS"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-78X0XMB9JS');
            `}
          </Script>
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
