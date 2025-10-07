"use client";

import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, DollarSign, Users, BarChart3, Map, Download, Smartphone, Shield } from "lucide-react";

export default function Account() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'selling';

  if (tab === 'selling') {
    return <SellingOverview />;
  }

  if (tab === 'buying') {
    return <BuyingOverview />;
  }

  return (
    <>
      <HeadingAndSubheading
        heading="Account"
        subheading="Manage your account"
      />
    </>
  );
}

function SellingOverview() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Start Selling Location Lists</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Turn your local knowledge into income by creating and selling curated location lists to travelers and locals alike.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/account/selling/lists">
            <Button size="lg">Create Your First List</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              What You Can Sell
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Best restaurants in your city</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Hidden gems and local favorites</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Tourist attractions and activities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Shopping districts and markets</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Entertainment and nightlife spots</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earning Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Set your own prices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Earn from multiple list sales</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Build a passive income stream</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Monthly subscription revenue</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Keep 85% of your sales</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Getting Started in 4 Steps</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">1. Set Up Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Create your seller profile and verify your identity
              </CardDescription>
              <Link href="/account/selling/profile">
                <Button variant="outline" size="sm">Set Up Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">2. Payment Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Connect your payment method to receive earnings
              </CardDescription>
              <Link href="/account/selling/payments">
                <Button variant="outline" size="sm">Setup Payments</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">3. Create Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Build your first location list with places you know
              </CardDescription>
              <Link href="/account/selling/lists">
                <Button variant="outline" size="sm">Create Lists</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">4. Track Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Monitor your earnings and optimize your listings
              </CardDescription>
              <Link href="/account/selling/orders">
                <Button variant="outline" size="sm">View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Need Help Getting Started?</CardTitle>
            <CardDescription>
              Our comprehensive help center has guides, tutorials, and FAQs to help you succeed as a seller.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Visit Help Center</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BuyingOverview() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
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

      <div className="grid md:grid-cols-2 gap-8">
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

      <div>
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
    </div>
  );
}
