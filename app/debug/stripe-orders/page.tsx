import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { orders, payments, carts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getStoreId } from "@/server-actions/store-details";
import Stripe from "stripe";

async function getDebugData() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const storeId = await getStoreId();
    if (isNaN(Number(storeId))) return null;

    // Get all orders from database
    const dbOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.storeId, Number(storeId)))
      .orderBy(desc(orders.createdAt));

    // Get all carts (including closed ones)
    const dbCarts = await db
      .select()
      .from(carts)
      .orderBy(desc(carts.id));

    // Get payment info for Stripe account
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.storeId, Number(storeId)));

    let stripeData = null;
    if (payment.length && payment[0]?.stripeAccountId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-08-27.basil",
      });

      try {
        // Get recent payment intents
        const paymentIntents = await stripe.paymentIntents.list(
          { limit: 20 },
          { stripeAccount: payment[0].stripeAccountId }
        );

        // Get account balance
        const balance = await stripe.balance.retrieve({
          stripeAccount: payment[0].stripeAccountId,
        });

        stripeData = {
          paymentIntents: paymentIntents.data.map(pi => ({
            id: pi.id,
            amount: pi.amount / 100,
            status: pi.status,
            created: pi.created,
            metadata: pi.metadata,
          })),
          balance: {
            available: balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
            pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
          }
        };
      } catch (error) {
        console.error("Stripe error:", error);
      }
    }

    return {
      storeId: Number(storeId),
      dbOrders,
      dbCarts: dbCarts.slice(0, 10), // Last 10 carts
      stripeData,
      payment: payment[0],
    };
  } catch (error) {
    console.error("Debug data error:", error);
    return null;
  }
}

export default async function StripeOrdersDebugPage() {
  const data = await getDebugData();

  if (!data) {
    return <div className="p-6">Unable to load debug data. Please make sure you're logged in and have a store.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Stripe vs Database Debug</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Orders */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Database Orders ({data.dbOrders.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.dbOrders.map((order) => (
              <div key={order.id} className="p-3 bg-gray-50 rounded text-sm">
                <div><strong>Order #{order.prettyOrderId}</strong></div>
                <div>Total: ${order.total}</div>
                <div>Status: {order.stripePaymentIntentStatus}</div>
                <div>Payment Intent: {order.stripePaymentIntentId}</div>
                <div>Created: {new Date((order.createdAt || 0) * 1000).toLocaleString()}</div>
                <div>Customer: {order.name} ({order.email})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Payment Intents */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            Stripe Payment Intents ({data.stripeData?.paymentIntents.length || 0})
          </h2>
          {data.stripeData ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.stripeData.paymentIntents.map((pi) => (
                <div key={pi.id} className="p-3 bg-blue-50 rounded text-sm">
                  <div><strong>{pi.id}</strong></div>
                  <div>Amount: ${pi.amount}</div>
                  <div>Status: {pi.status}</div>
                  <div>Created: {new Date(pi.created * 1000).toLocaleString()}</div>
                  <div>Cart ID: {pi.metadata.cartId || 'N/A'}</div>
                  <div>Items: {pi.metadata.items ? 'Yes' : 'No'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>No Stripe data available</div>
          )}
        </div>
      </div>

      {/* Balance Info */}
      {data.stripeData && (
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Stripe Balance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Available Balance</div>
              <div className="text-2xl font-bold text-green-600">${data.stripeData.balance.available}</div>
            </div>
            <div>
              <div className="font-medium">Pending Balance</div>
              <div className="text-2xl font-bold text-orange-600">${data.stripeData.balance.pending}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Carts */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Carts (Last 10)</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.dbCarts.map((cart) => (
            <div key={cart.id} className="p-3 bg-gray-50 rounded text-sm">
              <div><strong>Cart #{cart.id}</strong></div>
              <div>Closed: {cart.isClosed ? 'Yes' : 'No'}</div>
              <div>Payment Intent: {cart.paymentIntentId || 'None'}</div>
              <div>User ID: {cart.userId || 'None'}</div>
              <div>Items: {typeof cart.items === 'string' ? cart.items : JSON.stringify(cart.items)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border rounded-lg p-4 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">Analysis</h2>
        <div className="space-y-2">
          <div>Database Orders: {data.dbOrders.length}</div>
          <div>Stripe Payment Intents: {data.stripeData?.paymentIntents.length || 0}</div>
          <div>
            DB Total: ${data.dbOrders.reduce((sum, order) => sum + Number(order.total), 0)}
          </div>
          <div>
            Stripe Pending: ${data.stripeData?.balance.pending || 0}
          </div>
          <div>
            Stripe Available: ${data.stripeData?.balance.available || 0}
          </div>
          
          {data.stripeData && (
            <div className="mt-4">
              <strong>Successful Payment Intents not in DB:</strong>
              <div className="mt-2 space-y-1">
                {data.stripeData.paymentIntents
                  .filter(pi => pi.status === 'succeeded')
                  .filter(pi => !data.dbOrders.some(order => order.stripePaymentIntentId === pi.id))
                  .map(pi => (
                    <div key={pi.id} className="text-sm text-red-600">
                      {pi.id} - ${pi.amount} - {new Date(pi.created * 1000).toLocaleString()}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
