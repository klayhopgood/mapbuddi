import { InfoCard } from "@/components/admin/info-card";
import { Box } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";

export default async function OrdersPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "No email";

  return (
    <div>
      <div className="mb-6">
        <HeadingAndSubheading
          heading="Your purchases"
          subheading="View and manage purchases you've made"
        />
      </div>
      <InfoCard
        heading="Debug Info"
        subheading={`User email: ${userEmail}`}
        icon={<Box size={30} />}
      />
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Debug:</h3>
        <p>User ID: {user?.id}</p>
        <p>Email: {userEmail}</p>
        <p>Page is loading successfully!</p>
      </div>
    </div>
  );
}
