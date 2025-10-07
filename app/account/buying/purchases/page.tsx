import { InfoCard } from "@/components/admin/info-card";
import { Box } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { orders, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getUserPurchasesData(userId: string, userEmail: string) {
  try {
    // Get user's orders
    const userOrders = await db
      .select({
        orderId: orders.id,
        prettyOrderId: orders.prettyOrderId,
        sellerName: stores.name,
        items: orders.items,
        total: orders.total,
        stripePaymentIntentStatus: orders.stripePaymentIntentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(stores, eq(orders.storeId, stores.id))
      .where(eq(orders.email, userEmail));

    return {
      orders: userOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    };
  } catch (error) {
    console.error("=== PURCHASE DATA ERROR ===", error);
    return {
      orders: [],
    };
  }
}

export default async function PurchasesPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <InfoCard
        heading="Authentication Required"
        subheading="Please sign in to view your purchases."
        icon={<Box size={30} />}
      />
    );
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    return (
      <InfoCard
        heading="Email Required"
        subheading="Unable to find your email address."
        icon={<Box size={30} />}
      />
    );
  }

  const { orders } = await getUserPurchasesData(
    user.id, 
    userEmail
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <HeadingAndSubheading
          heading="Order History"
          subheading="View your purchase history and order details"
        />
      </div>

      {/* Order History */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Orders</h2>
          
          <div className="space-y-3">
            {orders.map((order, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-medium">#{order.prettyOrderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Store</p>
                      <p className="font-medium">{order.sellerName || 'Unknown Store'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-medium">${order.total}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-sm">
                        {order.createdAt 
                          ? new Date(order.createdAt * 1000).toLocaleDateString() 
                          : 'Unknown'
                        }
                      </p>
                    </div>
                    <Badge 
                      variant={order.stripePaymentIntentStatus === 'succeeded' ? 'default' : 'secondary'}
                    >
                      {order.stripePaymentIntentStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <InfoCard
          heading="No Orders"
          subheading="You haven't made any purchases yet. Browse our marketplace to discover location lists."
          icon={<Box size={30} />}
        />
      )}
    </div>
  );
}