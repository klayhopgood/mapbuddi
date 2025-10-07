import "../styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "@/components/ui/Toaster";

export const metadata = {
  title: "MapBuddi - Online marketplace",
  description: "Online marketplace",
  icons: {
    icon: "https://52cbfztl89.ufs.sh/f/VxEv67daUjR4qaHzWA7GWGiPb30BOxEIS2D1Mh4kLQlYAC8r",
    shortcut: "https://52cbfztl89.ufs.sh/f/VxEv67daUjR4qaHzWA7GWGiPb30BOxEIS2D1Mh4kLQlYAC8r",
    apple: "https://52cbfztl89.ufs.sh/f/VxEv67daUjR4qaHzWA7GWGiPb30BOxEIS2D1Mh4kLQlYAC8r",
  },
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
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
