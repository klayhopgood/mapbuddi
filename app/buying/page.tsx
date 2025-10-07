import Link from "next/link";
import { ContentWrapper } from "@/components/content-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Map, Download, Smartphone, Shield } from "lucide-react";

export default function BuyingPage() {
  return (
    <ContentWrapper className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover & Integrate Location Lists</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find curated location lists from local experts and seamlessly integrate them into Google Maps for your next adventure.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/lists">
            <Button size="lg">Browse Lists</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              What You Get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Expertly curated location lists</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Local insider knowledge</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Instant Google Maps integration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Regular updates from creators</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Reviews and ratings from other buyers</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Buyer Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Quality guarantee on all lists</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Secure payment processing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Refund policy protection</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Verified seller listings only</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>24/7 customer support</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">How to Buy & Integrate in 3 Steps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Map className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">1. Browse & Purchase</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Explore curated lists and purchase the ones that interest you
              </CardDescription>
              <Link href="/lists">
                <Button variant="outline" size="sm">Browse Lists</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Download className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">2. Sync to Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Connect your Google account and sync lists directly to Google Maps
              </CardDescription>
              <Link href="/account/buying/lists">
                <Button variant="outline" size="sm">Manage Lists</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">3. Explore & Enjoy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Use your integrated lists on any device with Google Maps
              </CardDescription>
              <Link href="/account/buying/purchases">
                <Button variant="outline" size="sm">View Purchases</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Popular List Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Restaurants & Food</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Tourist Attractions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Shopping Districts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Entertainment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Hidden Gems</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Local Favorites</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>One-click Google Maps sync</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>Automatic list organization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>Offline access support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>Custom list names</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span>Update notifications</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Need Help with Integration?</CardTitle>
            <CardDescription>
              Our step-by-step guides will help you get the most out of your purchased location lists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Visit Help Center</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </ContentWrapper>
  );
}
