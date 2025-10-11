"use client";

import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, DollarSign, Users, BarChart3, Map, Download, Smartphone, Shield } from "lucide-react";
import { routes } from "@/lib/routes";

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
        <h1 className="text-4xl font-bold mb-4">Share Your Travel Stories</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You&apos;ve wandered through hidden alleyways, discovered that perfect sunset spot, and found the café locals actually visit. Your adventures have given you something precious—authentic knowledge that can transform someone else&apos;s journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/account/selling/lists">
            <Button size="lg">Create Your First Guide</Button>
          </Link>
          <Link href={routes.helpCentre}>
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Experiences Matter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>That neighborhood bistro where you became a regular</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>The viewpoint you stumbled upon at golden hour</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Markets where vendors remember your name</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Secret spots that made your heart skip</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Cultural experiences that changed your perspective</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Our Travel Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Connect with fellow wanderers worldwide</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Help others discover authentic experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Share the magic of places you&apos;ve loved</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Build lasting connections through travel stories</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Become part of a trusted traveler network</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Your Journey to Sharing in 4 Steps</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">1. Introduce Yourself</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Share who you are and what makes your travel perspective unique
              </CardDescription>
              <Link href="/account/selling/profile">
                <Button variant="outline" size="sm">Create Profile</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">2. Set Up Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Connect your account so the community can support your contributions
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
              <CardTitle className="text-lg">3. Curate Your Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Transform your favorite memories into guides others can follow
              </CardDescription>
              <Link href="/account/selling/lists">
                <Button variant="outline" size="sm">Share Experiences</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">4. Watch the Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                See how your shared experiences inspire other travelers
              </CardDescription>
              <Link href="/account/selling/orders">
                <Button variant="outline" size="sm">View Impact</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Ready to Inspire Fellow Travelers?</CardTitle>
            <CardDescription>
              Join a community of authentic travelers sharing the places and experiences that have touched their hearts. Every guide you create helps someone discover the world through your eyes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/account/selling/lists/new">
              <Button>Get Started Today</Button>
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
        <h1 className="text-4xl font-bold mb-4">Discover & Integrate WanderLists</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find curated WanderLists from local experts and seamlessly integrate them into Google Maps for your next adventure.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/wanderlists">
            <Button size="lg">Browse WanderLists</Button>
          </Link>
          <Link href={routes.helpCentre}>
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
                <span>Expertly curated WanderLists</span>
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
                <span>Quality guarantee on all WanderLists</span>
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
                Explore curated WanderLists and purchase the ones that interest you
              </CardDescription>
              <Link href="/wanderlists">
                <Button variant="outline" size="sm">Browse WanderLists</Button>
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
                Connect your Google account and sync WanderLists directly to Google Maps
              </CardDescription>
              <Link href="/account/buying/lists">
                <Button variant="outline" size="sm">Manage WanderLists</Button>
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
                Use your integrated WanderLists on any device with Google Maps
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
              Our step-by-step guides will help you get the most out of your purchased WanderLists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={routes.helpCentre}>
              <Button>Visit Help Center</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
