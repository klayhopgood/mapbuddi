import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { sellerPayouts, stores, sellerPayoutMethods, orders } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { currencyFormatter } from "@/lib/currency";
import { CheckCircle, XCircle, DollarSign, User, Mail, CreditCard } from "lucide-react";
import { markPayoutAsPaid, undoPayout } from "@/server-actions/admin-payouts";

interface StorePayoutSummary {
  storeId: number;
  storeName: string;
  sellerName: string;
  sellerEmail: string;
  socialLinks: any;
  totalSalesEver: number;
  totalRevenueEver: number;
  salesSinceLastPayout: number;
  revenueSinceLastPayout: number;
  pendingPayoutAmount: number;
  payoutMethod: string;
  payoutDetails: any;
  lastPayoutDate: string | null;
}

async function getStorePayoutSummaries(): Promise<StorePayoutSummary[]> {
  // Get all stores with their payout methods
  const storesWithPayouts = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      sellerName: sql<string>`CONCAT(${stores.firstName}, ' ', ${stores.lastName})`,
      sellerEmail: sql<string>`''`, // We'll need to get this from Clerk or add to stores table
      socialLinks: stores.socialLinks,
      payoutMethod: sellerPayoutMethods.preferredMethod,
      payoutDetails: sellerPayoutMethods.paypalEmail,
    })
    .from(stores)
    .leftJoin(sellerPayoutMethods, eq(stores.id, sellerPayoutMethods.storeId));

  const summaries: StorePayoutSummary[] = [];

  for (const store of storesWithPayouts) {
    // Get total sales and revenue ever
    const totalStats = await db
      .select({
        totalSales: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, store.storeId),
          eq(orders.stripePaymentIntentStatus, 'succeeded')
        )
      );

    // Get last payout date
    const lastPayout = await db
      .select({
        payoutDate: sellerPayouts.payoutDate,
      })
      .from(sellerPayouts)
      .where(
        and(
          eq(sellerPayouts.storeId, store.storeId),
          eq(sellerPayouts.status, 'paid')
        )
      )
      .orderBy(desc(sellerPayouts.payoutDate))
      .limit(1);

    // Get sales since last payout
    const lastPayoutDate = lastPayout[0]?.payoutDate;
    const salesSinceLastPayout = lastPayoutDate 
      ? await db
          .select({
            count: sql<number>`COUNT(*)`,
            revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
          })
          .from(orders)
          .where(
            and(
              eq(orders.storeId, store.storeId),
              eq(orders.stripePaymentIntentStatus, 'succeeded'),
              sql`${orders.createdAt} > ${Math.floor(new Date(lastPayoutDate).getTime() / 1000)}`
            )
          )
      : totalStats;

    // Get pending payout amount
    const pendingPayouts = await db
      .select({
        amount: sellerPayouts.amount,
      })
      .from(sellerPayouts)
      .where(
        and(
          eq(sellerPayouts.storeId, store.storeId),
          eq(sellerPayouts.status, 'pending')
        )
      );

    const pendingAmount = pendingPayouts.reduce((sum, payout) => 
      sum + parseFloat(payout.amount), 0
    );

    summaries.push({
      storeId: store.storeId,
      storeName: store.storeName || `Store ${store.storeId}`,
      sellerName: store.sellerName || 'Unknown',
      sellerEmail: store.sellerEmail || 'No email',
      socialLinks: store.socialLinks,
      totalSalesEver: totalStats[0]?.totalSales || 0,
      totalRevenueEver: totalStats[0]?.totalRevenue || 0,
      salesSinceLastPayout: salesSinceLastPayout[0]?.count || 0,
      revenueSinceLastPayout: salesSinceLastPayout[0]?.revenue || 0,
      pendingPayoutAmount: pendingAmount,
      payoutMethod: store.payoutMethod || 'Not set',
      payoutDetails: store.payoutDetails || 'Not configured',
      lastPayoutDate: lastPayoutDate ? new Date(lastPayoutDate).toLocaleDateString() : 'Never',
    });
  }

  return summaries.sort((a, b) => b.pendingPayoutAmount - a.pendingPayoutAmount);
}

export default async function AdminPayoutsPage() {
  const storeSummaries = await getStorePayoutSummaries();

  return (
    <div className="space-y-6">
      <HeadingAndSubheading
        heading="Admin Payout Management"
        subheading="Track and manage seller payouts manually"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeSummaries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter(
                storeSummaries.reduce((sum, store) => sum + store.pendingPayoutAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores with Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeSummaries.filter(store => store.pendingPayoutAmount > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter(
                storeSummaries.reduce((sum, store) => sum + store.totalRevenueEver, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Store Payout Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Store</th>
                  <th className="text-left p-3 font-medium">Seller</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Sales Since Last Payout</th>
                  <th className="text-left p-3 font-medium">Revenue Since Last Payout</th>
                  <th className="text-left p-3 font-medium">Pending Amount</th>
                  <th className="text-left p-3 font-medium">Total Sales Ever</th>
                  <th className="text-left p-3 font-medium">Total Revenue Ever</th>
                  <th className="text-left p-3 font-medium">Payment Method</th>
                  <th className="text-left p-3 font-medium">Last Payout</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {storeSummaries.map((store) => (
                  <tr key={store.storeId} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{store.storeName}</div>
                      <div className="text-sm text-gray-500">ID: {store.storeId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{store.sellerName}</div>
                      {store.socialLinks && (
                        <div className="text-sm text-gray-500">
                          {(() => {
                            try {
                              const socials = JSON.parse(store.socialLinks);
                              return [
                                socials.youtube && 'YouTube',
                                socials.tiktok && 'TikTok',
                                socials.instagram && 'Instagram'
                              ].filter(Boolean).join(' ');
                            } catch {
                              return '';
                            }
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {store.sellerEmail}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">{store.salesSinceLastPayout}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{currencyFormatter(store.revenueSinceLastPayout)}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-green-600">
                        {currencyFormatter(store.pendingPayoutAmount)}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{store.totalSalesEver}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{currencyFormatter(store.totalRevenueEver)}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {store.payoutMethod === 'paypal' && 'PayPal'}
                          {store.payoutMethod === 'bank_us' && 'US Bank'}
                          {store.payoutMethod === 'bank_uk' && 'UK Bank'}
                          {store.payoutMethod === 'bank_eu' && 'EU Bank'}
                          {store.payoutMethod === 'bank_au' && 'AU Bank'}
                          {!store.payoutMethod && 'Not set'}
                        </div>
                        <div className="text-gray-500 text-xs">{store.payoutDetails}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {store.lastPayoutDate}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {store.pendingPayoutAmount > 0 && (
                          <form action={markPayoutAsPaid}>
                            <input type="hidden" name="storeId" value={store.storeId} />
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                          </form>
                        )}
                        <form action={undoPayout}>
                          <input type="hidden" name="storeId" value={store.storeId} />
                          <Button 
                            type="submit" 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Undo Last
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
