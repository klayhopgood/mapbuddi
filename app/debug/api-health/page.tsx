import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

async function checkDatabase() {
  try {
    const { db } = await import("@/db/db");
    await db.execute("SELECT 1");
    return { status: "success", message: "Database connected" };
  } catch (error) {
    return { status: "error", message: `Database error: ${error}` };
  }
}

async function checkStripe() {
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });
    await stripe.balance.retrieve();
    return { status: "success", message: "Stripe connected" };
  } catch (error) {
    return { status: "error", message: `Stripe error: ${error}` };
  }
}

async function checkClerk() {
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    await clerk.users.getUserList({ limit: 1 });
    return { status: "success", message: "Clerk connected" };
  } catch (error) {
    return { status: "error", message: `Clerk error: ${error}` };
  }
}

async function checkGooglePlaces() {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8688,151.2093&radius=1000&type=restaurant&key=${process.env.GOOGLE_PLACES_API_KEY}`,
      { method: "GET" }
    );
    const data = await response.json();
    if (data.status === "OK") {
      return { status: "success", message: "Google Places API working" };
    } else {
      return { status: "error", message: `Google Places error: ${data.status}` };
    }
  } catch (error) {
    return { status: "error", message: `Google Places error: ${error}` };
  }
}

async function checkUploadThing() {
  try {
    // Check if both required UploadThing env vars are set
    if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_TOKEN) {
      return { status: "error", message: "UploadThing env vars missing" };
    }
    
    // Simple check - try to make a request to UploadThing API
    const response = await fetch("https://api.uploadthing.com/api/health", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.UPLOADTHING_SECRET}`,
      },
    });
    
    if (response.ok) {
      return { status: "success", message: "UploadThing connected" };
    } else {
      return { status: "error", message: `UploadThing error: ${response.status}` };
    }
  } catch (error) {
    return { status: "error", message: `UploadThing error: ${error}` };
  }
}

export default async function APIHealthPage() {
  const [dbCheck, stripeCheck, clerkCheck, googleCheck, uploadCheck] = await Promise.all([
    checkDatabase(),
    checkStripe(),
    checkClerk(),
    checkGooglePlaces(),
    checkUploadThing(),
  ]);

  const checks = [
    { name: "Database", result: dbCheck },
    { name: "Stripe", result: stripeCheck },
    { name: "Clerk", result: clerkCheck },
    { name: "Google Places", result: googleCheck },
    { name: "UploadThing", result: uploadCheck },
  ];

  const allGood = checks.every(check => check.result.status === "success");

  return (
    <div className="container mx-auto py-8">
      <HeadingAndSubheading
        heading="API Health Check"
        subheading="Verify all production API keys are working correctly"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{check.name}</CardTitle>
              {check.result.status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Badge 
                  variant={check.result.status === "success" ? "default" : "destructive"}
                  className="mb-2"
                >
                  {check.result.status}
                </Badge>
                <p className="text-muted-foreground">{check.result.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allGood ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            Overall Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={allGood ? "text-green-600" : "text-red-600"}>
            {allGood 
              ? "✅ All APIs are working correctly!" 
              : "❌ Some APIs have issues. Check the details above."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
