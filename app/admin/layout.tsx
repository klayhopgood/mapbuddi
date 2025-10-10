import { ContentWrapper } from "@/components/content-wrapper";
import { Footer } from "@/components/footer";
import { NavBar } from "@/components/navbar";
import { Heading } from "@/components/ui/heading";
import { PropsWithChildren } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import SignInWrapper from "@/components/sign-in";
import { Line } from "@/components/line";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Admin access restricted to specific email through Clerk
const ADMIN_EMAILS = [
  "klaychop1@gmail.com", // Only admin email with access
];

export default async function AdminLayout({ children }: PropsWithChildren) {
  const user = await currentUser();
  
  // Check if user is authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Check if user is admin
  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/account");
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <NavBar showSecondAnnouncementBar={false} />

      <div>
        <div className="bg-red-50 py-2 md:px-6 border-b border-red-200">
          <ContentWrapper className="flex items-center justify-between">
            <Heading size="h2" className="text-red-800">Admin Panel</Heading>
            <div className="p-[1px] bg-gray-400 rounded-full">
              <UserButton afterSignOutUrl={process.env.NEXT_PUBLIC_APP_URL} />
            </div>
          </ContentWrapper>
        </div>
        <div className="bg-red-50">
          <ContentWrapper className="w-full py-2">
            <div className="text-sm text-red-700">
              ⚠️ Admin access only - Handle sensitive data with care
            </div>
          </ContentWrapper>
        </div>
        <Line />
      </div>

      <ContentWrapper className="w-full flex items-start flex-col flex-1 mb-8">
        <SignedIn>
          <div className="w-full">{children}</div>
        </SignedIn>
        <SignedOut>
          <SignInWrapper />
        </SignedOut>
      </ContentWrapper>

      <Footer />
    </div>
  );
}
