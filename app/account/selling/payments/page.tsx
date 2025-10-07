import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { InfoCard } from "@/components/admin/info-card";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getStoreId } from "@/server-actions/store-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PayoutMethodsManager from "@/components/admin/payout-methods-manager";
import { getPayoutMethods, savePayoutMethods } from "@/server-actions/payout-methods";
import { db } from "@/db/db";
import { sellerPayouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currencyFormatter } from "@/lib/currency";

export default async function PaymentsPage() {
  const storeId = Number(await getStoreId());
  
  if (isNaN(storeId)) {
    return (
      <InfoCard
        heading="No store found"
        subheading="You need to create a store first before setting up payments."
        icon={<AlertCircle size={24} />}
        button={
          <Button>Create Store</Button>
        }
      />
    );
  }

  // Get current payout methods
  const payoutMethods = await getPayoutMethods(storeId);
  
  // Get pending payouts
  const pendingPayouts = await db
    .select()
    .from(sellerPayouts)
    .where(and(
      eq(sellerPayouts.storeId, storeId),
      eq(sellerPayouts.status, "pending")
    ));

  const totalPending = pendingPayouts.reduce((sum, payout) => 
    sum + parseFloat(payout.amount), 0
  );

  // Get recent payouts
  const recentPayouts = await db
    .select()
    .from(sellerPayouts)
    .where(eq(sellerPayouts.storeId, storeId))
    .orderBy(sellerPayouts.createdAt)
    .limit(5);

  // Server actions need to be imported, not defined inline

  return (
    <div className="space-y-8">
      <HeadingAndSubheading
        heading="Payouts"
        subheading="Manage how you receive payments from your location list sales"
      />

      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayouts.length} pending payout{pendingPayouts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout Method</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payoutMethods?.preferredMethod ? (
                <Badge variant="secondary">
                  {payoutMethods.preferredMethod === "paypal" && "PayPal"}
                  {payoutMethods.preferredMethod === "bank_us" && "US Bank"}
                  {payoutMethods.preferredMethod === "bank_uk" && "UK Bank"}
                  {payoutMethods.preferredMethod === "bank_eu" && "EU Bank"}
                  {payoutMethods.preferredMethod === "bank_au" && "AU Bank"}
                </Badge>
              ) : (
                <span className="text-sm text-gray-500">Not set</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {payoutMethods ? "Configured" : "Setup required"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter(
                recentPayouts
                  .filter(p => p.status === "paid")
                  .reduce((sum, payout) => sum + parseFloat(payout.amount), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Methods Setup */}
      <PayoutMethodsManager 
        storeId={storeId}
        currentMethods={payoutMethods}
        onSave={savePayoutMethods}
      />

      {/* Recent Payouts */}
      {recentPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{currencyFormatter(parseFloat(payout.amount))}</p>
                    <p className="text-sm text-gray-500">
                      Order #{payout.orderId} • {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      payout.status === "paid" ? "default" : 
                      payout.status === "pending" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {payout.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Platform Fee</h3>
              <p className="text-2xl font-bold text-blue-900">10%</p>
              <p className="text-sm text-blue-700">Deducted from each sale</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Processing Fee</h3>
              <p className="text-2xl font-bold text-green-900">2.9% + $0.30</p>
              <p className="text-sm text-green-700">Stripe payment processing</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Example: $10.00 Sale</h3>
            <div className="text-sm space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Sale amount:</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Platform fee (10%):</span>
                <span>-$1.00</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Processing fee:</span>
                <span>-$0.59</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>You receive:</span>
                <span className="text-green-600">$8.41</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
