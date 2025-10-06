import { Heading } from "@/components/ui/heading";
import { getPaymentIntentDetails } from "@/server-actions/stripe/payment";
import { db } from "@/db/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CheckoutItem, OrderItemDetails } from "@/lib/types";
import { Check } from "lucide-react";
import { OrderLineItems } from "@/components/order-line-items";
import { getDetailsOfListsOrdered } from "@/server-actions/orders";
import { currencyFormatter } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routes, singleLevelNestedRoutes } from "@/lib/routes";

const getSellerName = async (storeSlug: string) => {
  return await db
    .select({
      name: stores.name,
    })
    .from(stores)
    .where(eq(stores.slug, storeSlug));
};

export default async function OrderConfirmation({
  params,
  searchParams,
}: {
  params: {
    storeSlug: string;
  };
  searchParams: {
    payment_intent: string;
    payment_intent_client_secret: string;
    redirect_status: "success";
    delivery_postal_code: string;
  };
}) {
  const { paymentDetails, isVerified } = await getPaymentIntentDetails({
    paymentIntentId: searchParams.payment_intent,
    storeSlug: params.storeSlug,
    deliveryPostalCode: "DIGITAL", // Digital products don't need postcode verification
  });

  console.log("=== ORDER CONFIRMATION DEBUG ===");
  console.log("Payment Intent ID:", searchParams.payment_intent);
  console.log("Is Verified:", isVerified);
  console.log("Payment Details exists:", !!paymentDetails);

  const checkoutItems = JSON.parse(
    paymentDetails?.metadata?.items ?? "[]"
  ) as CheckoutItem[];

  let products: OrderItemDetails[] = [];
  let sellerDetails;
  if (isVerified && paymentDetails) {
    sellerDetails = (await getSellerName(params.storeSlug))[0];
    products = await getDetailsOfListsOrdered(checkoutItems);
  }

  return (
    <div className="mt-8">
      {isVerified ? (
        <div>
          <Heading size="h2">
            <div className="flex md:flex-row flex-col items-start md:items-center justify-start gap-4 md:gap-2">
              <div className="border-2 border-green-600 text-green-600 bg-transparent rounded-full h-10 w-10 flex items-center justify-center">
                <Check className="text-green-600" size={26} />
              </div>
              <span>
                Thanks for your order,{" "}
                <span className="capitalize">
                  {paymentDetails?.shipping?.name?.split(" ")[0]}
                </span>
                !
              </span>
            </div>
          </Heading>
          <p className="text-muted-foreground mt-4">
            Your payment confirmation ID is #
            {searchParams.payment_intent.slice(3)}
          </p>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap gap-3 mt-6 mb-2">
            <Link href="/">
              <Button variant="default">
                Continue Shopping
              </Button>
            </Link>
            <Link href={singleLevelNestedRoutes.account["your-purchases"]}>
              <Button variant="outline">
                View My Orders
              </Button>
            </Link>
            <Link href={routes.lists}>
              <Button variant="outline">
                Browse Products
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            <div className="p-6 bg-secondary border border-border rounded-md">
              <Heading size="h3">What&apos;s next?</Heading>
              <p>
                Your location lists are now available in your account. You can sync them to your Google Maps for easy navigation.
              </p>
            </div>
            <div className="lg:grid grid-cols-2 gap-4 flex flex-col">
              <div className="p-6 bg-secondary border border-border rounded-md">
                <div className="mb-2">
                  <Heading size="h4">Purchase Details</Heading>
                </div>
                <p><strong>Email:</strong> {paymentDetails?.receipt_email}</p>
                <p><strong>Seller:</strong> {sellerDetails?.name}</p>
              </div>
              <div className="p-6 border border-border bg-secondary rounded-md">
                <div className="mb-2">
                  <Heading size="h4">Order Details</Heading>
                </div>
                <OrderLineItems
                  checkoutItems={checkoutItems}
                  products={products}
                />
                <div className="border-y border-slate-200 py-2 px-2 mx-1 mt-2 flex items-center gap-2">
                  <Heading size="h4">Order Total: </Heading>
                  <p className="scroll-m-20 text-xl tracking-tight">
                    {currencyFormatter(
                      checkoutItems.reduce(
                        (acc, curr) => acc + curr.price * curr.qty,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <Heading size="h2">Order Verification Issue</Heading>
          <p className="text-muted-foreground">
            We're having trouble verifying your order details. This usually resolves itself within a few minutes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/">
              <Button variant="default">
                Return Home
              </Button>
            </Link>
            <Link href={singleLevelNestedRoutes.account["your-purchases"]}>
              <Button variant="outline">
                Check My Orders
              </Button>
            </Link>
            <Link href={`/checkout/${params.storeSlug}/order-confirmation?payment_intent=${searchParams.payment_intent}&payment_intent_client_secret=${searchParams.payment_intent_client_secret}&redirect_status=success`}>
              <Button variant="outline">
                Refresh Page
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            If this issue persists, please contact support with order ID: {searchParams.payment_intent.slice(3)}
          </p>
        </div>
      )}
    </div>
  );
}
