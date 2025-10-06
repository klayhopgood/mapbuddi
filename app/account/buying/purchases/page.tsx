import { InfoCard } from "@/components/admin/info-card";
import { Box, MapPin, Smartphone } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { orders, stores, locationLists, userMapsIntegration, purchasedListSync } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapsConnectionStatus } from "@/components/maps/maps-connection-status";
import { PurchasedListsManager } from "@/components/maps/purchased-lists-manager";

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

    // Get purchased lists details
    const purchasedLists = [];
    for (const order of userOrders) {
      if (order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (const item of items) {
          const listDetails = await db
            .select({
              id: locationLists.id,
              name: locationLists.name,
              description: locationLists.description,
              totalPois: locationLists.totalPois,
              sellerName: stores.name,
            })
            .from(locationLists)
            .leftJoin(stores, eq(locationLists.storeId, stores.id))
            .where(eq(locationLists.id, item.id));

          if (listDetails.length > 0) {
            purchasedLists.push({
              ...listDetails[0],
              orderId: order.orderId,
              purchaseDate: order.createdAt,
              price: item.price,
            });
          }
        }
      }
    }

    // Get maps integration status
    const mapsIntegration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    // Get sync status for purchased lists
    const syncStatuses = await db
      .select()
      .from(purchasedListSync)
      .where(eq(purchasedListSync.userId, userId));

    return {
      orders: userOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      purchasedLists,
      mapsIntegration: mapsIntegration[0] || null,
      syncStatuses,
    };
  } catch (error) {
    console.error("=== PURCHASE DATA ERROR ===", error);
    return {
      orders: [],
      purchasedLists: [],
      mapsIntegration: null,
      syncStatuses: [],
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

  const { orders, purchasedLists, mapsIntegration, syncStatuses } = await getUserPurchasesData(
    user.id, 
    userEmail
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <HeadingAndSubheading
          heading="Your Purchases"
          subheading="Manage your purchased location lists and sync them to your maps"
        />
      </div>

      {/* Maps Connection Status */}
      <MapsConnectionStatus 
        userId={user.id}
        mapsIntegration={mapsIntegration}
      />

      {/* Purchased Lists */}
      {purchasedLists.length > 0 ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Location Lists</h2>
            <p className="text-muted-foreground">
              Toggle sync for each list to add them to your connected maps apps
            </p>
          </div>
          
          <PurchasedListsManager
            userId={user.id}
            purchasedLists={purchasedLists}
            syncStatuses={syncStatuses}
            mapsIntegration={mapsIntegration}
          />
        </div>
      ) : (
        <InfoCard
          heading="No Location Lists"
          subheading="You haven't purchased any location lists yet. Browse our marketplace to discover curated POI collections."
          icon={<MapPin size={30} />}
        />
      )}

      {/* Order History */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Order History</h2>
          
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
      )}
    </div>
  );
}