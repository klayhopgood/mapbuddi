import { InfoCard } from "@/components/admin/info-card";
import { Box, DollarSign, ShoppingBag, TrendingUp, Calendar, Package } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { db } from "@/db/db";
import { orders, products } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { getStoreId } from "@/server-actions/store-details";
import { CheckoutItem } from "@/lib/types";
import { currencyFormatter } from "@/lib/currency";

interface OrderAnalytics {
  totalSalesValue: number;
  netEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
  last30DaysSales: number;
  last30DaysOrders: number;
  platformFeesPaid: number;
  monthlyBreakdown: Array<{ month: string; sales: number; orders: number }>;
  productPerformance: Array<{ 
    productId: number; 
    productName: string; 
    quantitySold: number; 
    revenue: number; 
  }>;
}

async function getOrderAnalytics(): Promise<OrderAnalytics> {
  try {
    const storeId = await getStoreId();
    
    if (isNaN(Number(storeId))) {
      return {
        totalSalesValue: 0,
        netEarnings: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        last30DaysSales: 0,
        last30DaysOrders: 0,
        platformFeesPaid: 0,
        monthlyBreakdown: [],
        productPerformance: [],
      };
    }

    // Get all orders for this store
    const storeOrders = await db
      .select({
        id: orders.id,
        total: orders.total,
        items: orders.items,
        createdAt: orders.createdAt,
        stripePaymentIntentStatus: orders.stripePaymentIntentStatus,
      })
      .from(orders)
      .where(
        and(
          eq(orders.storeId, Number(storeId)),
          eq(orders.stripePaymentIntentStatus, 'succeeded')
        )
      );

    // Calculate basic metrics
    const totalSalesValue = storeOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const platformFeesPaid = totalSalesValue * 0.10; // 10% platform fee
    const netEarnings = totalSalesValue - platformFeesPaid;
    const totalOrders = storeOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalSalesValue / totalOrders : 0;

    // Calculate last 30 days metrics
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const last30DaysOrders = storeOrders.filter(order => 
      order.createdAt && order.createdAt >= thirtyDaysAgo
    );
    const last30DaysSales = last30DaysOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // Calculate monthly breakdown (last 6 months)
    const monthlyBreakdown: Array<{ month: string; sales: number; orders: number }> = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = Math.floor(date.getTime() / 1000);
      const monthEnd = Math.floor(new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);
      
      const monthOrders = storeOrders.filter(order => 
        order.createdAt && order.createdAt >= monthStart && order.createdAt <= monthEnd
      );
      
      monthlyBreakdown.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sales: monthOrders.reduce((sum, order) => sum + Number(order.total), 0),
        orders: monthOrders.length,
      });
    }

    // Calculate product performance
    const productMap = new Map<number, { name: string; quantity: number; revenue: number }>();
    
    for (const order of storeOrders) {
      let items: CheckoutItem[] = [];
      try {
        if (typeof order.items === 'string') {
          items = JSON.parse(order.items);
        } else {
          items = order.items as CheckoutItem[];
        }
      } catch (e) {
        continue;
      }

      for (const item of items) {
        const existing = productMap.get(item.id) || { name: '', quantity: 0, revenue: 0 };
        existing.quantity += item.qty;
        existing.revenue += item.price * item.qty;
        productMap.set(item.id, existing);
      }
    }

    // Get product names
    const productIds = Array.from(productMap.keys());
    if (productIds.length > 0) {
      const productNames = await db
        .select({
          id: products.id,
          name: products.name,
        })
        .from(products)
        .where(eq(products.storeId, Number(storeId)));

      for (const product of productNames) {
        const performance = productMap.get(product.id);
        if (performance) {
          performance.name = product.name || `Product ${product.id}`;
        }
      }
    }

    const productPerformance = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name || `Product ${productId}`,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalSalesValue,
      netEarnings,
      totalOrders,
      averageOrderValue,
      last30DaysSales,
      last30DaysOrders: last30DaysOrders.length,
      platformFeesPaid,
      monthlyBreakdown,
      productPerformance,
    };
  } catch (error) {
    console.error("=== ANALYTICS ERROR ===", error);
    return {
      totalSalesValue: 0,
      netEarnings: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      last30DaysSales: 0,
      last30DaysOrders: 0,
      platformFeesPaid: 0,
      monthlyBreakdown: [],
      productPerformance: [],
    };
  }
}

async function getOrdersList() {
  try {
    const storeId = await getStoreId();
    
    if (isNaN(Number(storeId))) {
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
    
    return storeOrders.sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  } catch (error) {
    console.error("=== ORDERS LIST ERROR ===", error);
    return [];
  }
}

export default async function OrdersPage() {
  const [analytics, ordersList] = await Promise.all([
    getOrderAnalytics(),
    getOrdersList()
  ]);

  return (
    <div className="space-y-6">
      <Heading size="h4">Sales Dashboard</Heading>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-sm text-gray-600">Total Sales Value</h3>
          </div>
          <p className="text-2xl font-bold">{currencyFormatter(analytics.totalSalesValue)}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-600">Net Earnings</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{currencyFormatter(analytics.netEarnings)}</p>
          <p className="text-xs text-gray-500">After 10% platform fee</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-sm text-gray-600">Total Orders</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-sm text-gray-600">Average Order Value</h3>
          </div>
          <p className="text-2xl font-bold">{currencyFormatter(analytics.averageOrderValue)}</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-sm text-gray-600">Last 30 Days Sales</h3>
          </div>
          <p className="text-2xl font-bold">{currencyFormatter(analytics.last30DaysSales)}</p>
          <p className="text-xs text-gray-500">{analytics.last30DaysOrders} orders</p>
        </div>

        <div className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-sm text-gray-600">Platform Fees Paid</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{currencyFormatter(analytics.platformFeesPaid)}</p>
          <p className="text-xs text-gray-500">10% of total sales</p>
        </div>
      </div>

      {/* Product Performance */}
      {analytics.productPerformance.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Product Performance</h3>
          <div className="space-y-3">
            {analytics.productPerformance.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{product.productName}</p>
                  <p className="text-sm text-gray-600">{product.quantitySold} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{currencyFormatter(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {analytics.monthlyBreakdown.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Monthly Sales (Last 6 Months)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.monthlyBreakdown.map((month, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded">
                <p className="font-medium text-sm">{month.month}</p>
                <p className="text-lg font-bold">{currencyFormatter(month.sales)}</p>
                <p className="text-xs text-gray-600">{month.orders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Orders</h3>
        {ordersList.length > 0 ? (
          <div className="space-y-4">
            {ordersList.slice(0, 10).map((order, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Order #{order.id}</strong></p>
                    <p><strong>Customer:</strong> {order.name}</p>
                    <p><strong>Total:</strong> {currencyFormatter(Number(order.total))}</p>
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
    </div>
  );
}