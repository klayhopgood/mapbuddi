import { InfoCard } from "@/components/admin/info-card";
import { Box } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { db } from "@/db/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStoreId } from "@/server-actions/store-details";
import { currentUser } from "@clerk/nextjs/server";

async function getData() {
  try {
    const storeId = await getStoreId();
    console.log("=== SELLER ORDERS DEBUG ===");
    console.log("Store ID:", storeId);
    
    if (isNaN(Number(storeId))) {
      console.log("Invalid store ID");
      return [];
    }
    
    const storeOrders = await db
      .select({
        id: orders.prettyOrderId,
        name: orders.name,
        items: orders.items,
        total: orders.total,
        stripePaymentIntentStatus: orders.stripePaymentIntentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.storeId, Number(storeId)));
    
    console.log("Orders found:", storeOrders.length);
    console.log("Orders data:", JSON.stringify(storeOrders, null, 2));
    
    return storeOrders.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  } catch (error) {
    console.error("=== SELLER ORDERS ERROR ===", error);
    return [];
  }
}

export default async function OrdersPage() {
  const user = await currentUser();
  const data = await getData();

  return (
    <div>
      <Heading size="h4">All orders</Heading>
      
      <div className="mb-4 p-4 bg-green-50 rounded">
        <h3 className="font-semibold">Debug Info:</h3>
        <p>User email: {user?.emailAddresses[0]?.emailAddress}</p>
        <p>Orders found: {data.length}</p>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((order, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Customer:</strong> {order.name}</p>
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
          subheading="You don't have any orders yet."
          icon={<Box size={30} />}
        />
      )}
    </div>
  );
}
