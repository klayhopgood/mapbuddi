import { NavBar } from "@/components/navbar";
import "../../styles/globals.css";
import { Footer } from "@/components/footer";
import React from "react";
import { FloatingStar } from "@/components/floating-star";

export const metadata = {
  title: "MapBuddi - Seller Profile",
  description: "Seller profile page",
};

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <FloatingStar />
      <NavBar showSecondAnnouncementBar={true} />
      <div className="h-full flex-1 mb-8">{children}</div>
      <Footer />
    </div>
  );
}
