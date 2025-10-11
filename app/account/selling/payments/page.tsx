import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { InfoCard } from "@/components/admin/info-card";
import { DollarSign, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { getStoreId } from "@/server-actions/store-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PayoutMethodsManager from "@/components/admin/payout-methods-manager";
import { getPayoutMethods, savePayoutMethods } from "@/server-actions/payout-methods";
import { db } from "@/db/db";
import { sellerPayouts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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

  // Get last payout date
  const lastPayout = await db
    .select({
      payoutDate: sellerPayouts.payoutDate,
    })
    .from(sellerPayouts)
    .where(
      and(
        eq(sellerPayouts.storeId, storeId),
        eq(sellerPayouts.status, 'paid')
      )
    )
    .orderBy(desc(sellerPayouts.payoutDate))
    .limit(1);

  // Calculate next payout date (1st or 3rd Tuesday of the month)
  const getNextPayoutTuesday = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Helper to find the Nth Tuesday of a month
    const getNthTuesday = (year: number, month: number, n: number) => {
      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay();
      // Days until first Tuesday (2 = Tuesday)
      const daysUntilFirstTuesday = firstDayOfWeek <= 2 ? (2 - firstDayOfWeek) : (9 - firstDayOfWeek);
      const firstTuesday = 1 + daysUntilFirstTuesday;
      return new Date(year, month, firstTuesday + (n - 1) * 7);
    };
    
    // Get 1st and 3rd Tuesday of current month
    const firstTuesday = getNthTuesday(currentYear, currentMonth, 1);
    const thirdTuesday = getNthTuesday(currentYear, currentMonth, 3);
    
    // If today is before or on 1st Tuesday, next payout is 1st Tuesday
    if (today <= firstTuesday) {
      return firstTuesday;
    }
    // If today is after 1st Tuesday but before or on 3rd Tuesday, next payout is 3rd Tuesday
    if (today <= thirdTuesday) {
      return thirdTuesday;
    }
    // Otherwise, next payout is 1st Tuesday of next month
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return getNthTuesday(nextYear, nextMonth, 1);
  };

  const lastPayoutDate = lastPayout[0]?.payoutDate;
  const nextPayoutDate = getNextPayoutTuesday();

  // Server actions need to be imported, not defined inline

  return (
    <div className="space-y-8">
      <HeadingAndSubheading
        heading="Payouts"
        subheading="Manage how you receive payments from your location list sales"
      />

      {/* Payout Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payout Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Twice-Monthly Payouts</h3>
              <p className="text-blue-800">
                Payouts are processed twice monthly on the <strong>1st Tuesday</strong> and <strong>3rd Tuesday</strong> of each month. Any sales made during the period will be included in the next scheduled payout.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Pending payouts below will be processed on the next scheduled payout date.
              </p>
          </div>
        </CardContent>
      </Card>

      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {lastPayoutDate ? new Date(lastPayoutDate).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastPayoutDate ? new Date(lastPayoutDate).toLocaleTimeString() : 'No payouts yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {nextPayoutDate.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tuesday • {nextPayoutDate.toLocaleTimeString()}
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
