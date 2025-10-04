import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { InfoCard } from "@/components/admin/info-card";
import { CreditCard, DollarSign, Clock, CheckCircle } from "lucide-react";
import { CreateConnectedAccount } from "./components/create-connected-account";
import {
  createAccountLink,
  getStripeAccountDetails,
  hasConnectedStripeAccount,
  updateStripeAccountStatus,
} from "@/server-actions/stripe/account";
import { getStoreId } from "@/server-actions/store-details";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { currencyFormatter } from "@/lib/currency";

interface PayoutInfo {
  availableBalance: number;
  pendingBalance: number;
  recentPayouts: Array<{
    id: string;
    amount: number;
    status: string;
    arrivalDate: number;
    currency: string;
  }>;
}

async function getPayoutInfo(storeId: number): Promise<PayoutInfo | null> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.storeId, storeId));

    if (!payment.length || !payment[0]?.stripeAccountId) {
      return null;
    }

    const stripeAccountId = payment[0].stripeAccountId;

    // Get account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    });

    // Get recent payouts
    const payouts = await stripe.payouts.list(
      { limit: 5 },
      { stripeAccount: stripeAccountId }
    );

    const availableBalance = balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100;
    const pendingBalance = balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100;

    const recentPayouts = payouts.data.map(payout => ({
      id: payout.id,
      amount: payout.amount / 100,
      status: payout.status,
      arrivalDate: payout.arrival_date,
      currency: payout.currency,
    }));

    return {
      availableBalance,
      pendingBalance,
      recentPayouts,
    };
  } catch (error) {
    console.error("Error fetching payout info:", error);
    return null;
  }
}

export default async function PaymentsPage() {
  // Get storeId once to avoid multiple Clerk API calls
  const storeId = Number(await getStoreId());
  
  await updateStripeAccountStatus(storeId);
  const connectedStripeAccount = await hasConnectedStripeAccount(storeId);
  const stripeAccountDetails = await getStripeAccountDetails(storeId);
  const payoutInfo = connectedStripeAccount ? await getPayoutInfo(storeId) : null;

  return (
    <>
      <HeadingAndSubheading
        heading="Payments"
        subheading="View your payouts and manage your payment settings"
      />
      {connectedStripeAccount ? (
        <div className="space-y-6">
          {/* Payout Information */}
          {payoutInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-sm text-gray-600">Available Balance</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {currencyFormatter(payoutInfo.availableBalance)}
                </p>
                <p className="text-xs text-gray-500">Ready for payout</p>
              </div>

              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-sm text-gray-600">Pending Balance</h3>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {currencyFormatter(payoutInfo.pendingBalance)}
                </p>
                <p className="text-xs text-gray-500">Processing</p>
              </div>
            </div>
          )}

          {/* Recent Payouts */}
          {payoutInfo && payoutInfo.recentPayouts.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Payouts</h3>
              <div className="space-y-3">
                {payoutInfo.recentPayouts.map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 ${
                        payout.status === 'paid' ? 'text-green-600' : 
                        payout.status === 'pending' ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                      <div>
                        <p className="font-medium">{currencyFormatter(payout.amount)}</p>
                        <p className="text-sm text-gray-600">
                          {payout.status === 'paid' ? 'Completed' : 
                           payout.status === 'pending' ? 'Processing' : 
                           payout.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(payout.arrivalDate * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stripe Account Details */}
          <div>
            <div className="p-2 px-4 border bg-secondary border-border text-gray-700 rounded-md">
              <span className="font-semibold">Payment status:</span> Stripe
              account connected
            </div>
            <div className="border border-border p-4 rounded-md mt-4">
              <p className="font-semibold text-gray-700">Stripe Details</p>
              <p>
                Currency: {stripeAccountDetails?.default_currency.toUpperCase()}
              </p>
              <p>Country: {stripeAccountDetails?.country}</p>
              <p>Account Email: {stripeAccountDetails?.email}</p>
              <a
                href="https://www.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="mt-4">
                  Update in Stripe
                </Button>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <InfoCard
          heading="Payments aren't setup yet"
          subheading="Link your stripe account to start accepting orders"
          icon={<CreditCard size={36} className="text-gray-600" />}
          button={
            // pass server action from server component to client component - work around for nextjs/server actions bug with clerk.
            // calling the server action inside the client component causes a clerk error of "Error: Clerk: auth() and currentUser() are only supported in App Router (/app directory)"
            <CreateConnectedAccount createAccountLink={createAccountLink} />
          }
        />
      )}
    </>
  );
}
