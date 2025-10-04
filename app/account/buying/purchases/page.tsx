import { InfoCard } from "@/components/admin/info-card";
import { Box } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { orders, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getData() {
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
    
    return storeOrders.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  } catch (error) {
    console.error("=== PURCHASE HISTORY ERROR ===", error);
    return [];
  }
}

export default async function OrdersPage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "No email";
  const data = await getData();

  return (
    <div>
      <div className="mb-6">
        <HeadingAndSubheading
          heading="Your purchases"
          subheading="View and manage purchases you've made"
        />
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold">Debug Info:</h3>
        <p>User email: {userEmail}</p>
        <p>Orders found: {data.length}</p>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((order, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Store:</strong> {order.sellerName || 'Unknown Store'}</p>
                  <p><strong>Total:</strong> ${order.total}</p>
                </div>
                <div>
                  <p><strong>Status:</strong> {order.stripePaymentIntentStatus}</p>
                  <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt * 1000).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              <div className="mt-2">
                <p><strong>Items:</strong> {typeof order.items === 'string' ? order.items : JSON.stringify(order.items)}</p>
              </div>
            </div>
          ))}
        </div>
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
