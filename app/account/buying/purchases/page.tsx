import { BuyersOrderTable } from "@/lib/types";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { db } from "@/db/db";
import { orders, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InfoCard } from "@/components/admin/info-card";
import { Box } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";

async function getData(): Promise<BuyersOrderTable[]> {
  const user = await currentUser();
  const userEmailAddress = user?.emailAddresses[0].emailAddress;
  if (!userEmailAddress) return [];
  
  console.log("=== PURCHASE HISTORY DEBUG ===");
  console.log("User email:", userEmailAddress);
  
  try {
    const storeOrders = await db
      .select({
        id: orders.prettyOrderId,
        sellerName: stores.name,
        items: orders.items,
        total: orders.total,
        stripePaymentIntentStatus: orders.stripePaymentIntentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(stores, eq(orders.storeId, stores.id))
      .where(eq(orders.email, userEmailAddress));
    
    console.log("Raw orders found:", storeOrders.length);
    console.log("Orders data:", JSON.stringify(storeOrders, null, 2));
    
    return (storeOrders as BuyersOrderTable[]).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  } catch (error) {
    console.error("=== PURCHASE HISTORY ERROR ===", error);
    return [];
  }
}

export default async function OrdersPage() {
  const data = await getData();

  return (
    <div>
      <div className="mb-6">
        <HeadingAndSubheading
          heading="Your purchases"
          subheading="View and manage purchases you've made"
        />
      </div>
      {data.length > 0 ? (
        <DataTable columns={columns} data={data} />
      ) : (
        <InfoCard
          heading="No orders"
          subheading="You haven't placed any orders yet."
          icon={<Box size={30} />}
        />
      )}
    </div>
  );
}
