import { ContentWrapper } from "@/components/content-wrapper";
import { SlideShow } from "@/components/slideshow";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db/db";
import { locationLists, stores, listReviews } from "@/db/schema";
import { eq, inArray, count, desc, sql } from "drizzle-orm";
import { PropsWithChildren } from "react";
import { LocationListCard } from "@/components/storefront/location-list-card";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";
import Image from "next/image";
import { FeatureBanner } from "../components/feature-banner";
import {
  AlarmClock,
  DollarSign,
  FastForward,
  Phone,
  Truck,
  User,
  Wind,
  MapPin,
} from "lucide-react";

import { LocationListAndStore } from "@/lib/collection-types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const rawData = await db
    .select({
      locationList: locationLists,
      store: {
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
      },
    })
    .from(locationLists)
    .leftJoin(stores, eq(locationLists.storeId, stores.id))
    .where(eq(locationLists.isActive, true))
    .orderBy(
      desc(sql`(
        SELECT COUNT(*)::int 
        FROM ${listReviews} 
        WHERE ${listReviews.listId} = ${locationLists.id}
      )`),
      desc(locationLists.avgRating)
    )
    .limit(8);

  // Transform coverImage from string to parsed object
  const storeAndLocationList = rawData.map(item => ({
    ...item,
    locationList: {
      ...item.locationList,
      coverImage: typeof item.locationList.coverImage === 'string' 
        ? JSON.parse(item.locationList.coverImage) 
        : item.locationList.coverImage || []
    }
  })) as LocationListAndStore[];

  // Get review counts for all lists (same logic as lists page)
  const listIds = storeAndLocationList.map(item => item.locationList.id);
  const reviewCounts = await db
    .select({
      listId: listReviews.listId,
      count: count(listReviews.id),
    })
    .from(listReviews)
    .where(inArray(listReviews.listId, listIds))
    .groupBy(listReviews.listId);

  // Create a map for quick lookup
  const reviewCountMap = new Map<number, number>();
  reviewCounts.forEach(rc => {
    reviewCountMap.set(rc.listId, Number(rc.count));
  });

  return (
    <div>
      <SlideShow />
      <ContentWrapper>
        <Tabs defaultValue="for-buyers">
          <div className="flex items-center justify-center mt-2 mb-8">
            <TabsList>
              <TabsTrigger value="for-buyers">For Buyers</TabsTrigger>
              <TabsTrigger value="for-sellers">For Sellers</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="for-sellers">
            <HomePageLayout
              heading={<Heading size="h1">Share Your Travel Stories</Heading>}
              subheading={
                <Heading size="h2">
                  You&apos;ve wandered through hidden alleyways, discovered that perfect sunset spot, and found the café locals actually visit. Turn your authentic travel knowledge into WanderLists that transform someone else&apos;s journey.
                </Heading>
              }
            >
              <div className="md:grid md:grid-cols-3 gap-4 flex flex-col mt-12">
                <FeatureBanner
                  heading="No Monthly Fees"
                  subheading="Start selling with zero upfront costs. Only pay when you make a sale - we keep 15%, you keep 85% of every transaction."
                  icon={<DollarSign size={32} />}
                />
                <FeatureBanner
                  heading="Global Marketplace"
                  subheading="Reach travelers from around the world looking for authentic local experiences and insider knowledge in your area."
                  icon={<User size={32} />}
                />
                <FeatureBanner
                  heading="Quick Setup"
                  subheading="Create your seller profile, add payment details, and publish your first location list in under 30 minutes."
                  icon={<AlarmClock size={32} />}
                />
              </div>
              <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
                <Link href={routes.signUp}>
                  <Button size="lg">Start Selling Today</Button>
                </Link>
                <Link href={`${routes.helpCentre}?tab=sellers`}>
                  <Button variant="outline" size="lg">Learn How It Works</Button>
                </Link>
              </div>
            </HomePageLayout>
          </TabsContent>
          <TabsContent value="for-buyers">
            <div className="flex flex-col items-center justify-center gap-2 text-center mb-12 pt-2">
              <Heading size="h1">Personalised WanderLists of the best places from the best Travellers</Heading>
              
              {/* Desktop layout with text and image side by side */}
              <div className="hidden md:flex items-start gap-8 max-w-6xl mx-auto mt-8">
                <div className="flex-1 text-left space-y-4">
                  <p className="text-slate-600 text-lg leading-relaxed">
                    WanderLists are collections of incredible locations for incredible moments curated by experienced travellers.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Download a WanderList that matches your style and sync it directly to your Google Maps.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Then, directly in the Google Maps App you&apos;ll see exactly what&apos;s around you, easily navigate to those locations and even have tailored notes on what to do when you&apos;re there!
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    They&apos;re even sorted into categories to make it easier to find what you want at a glance, from a great place for a run 🏃‍➡️ to the best hamburger in town 🍔.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    It makes travelling like a pro easy, with no research needed! Less time going &quot;huh?&quot;, and more time going &quot;Wow!&quot;
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src="https://52cbfztl89.ufs.sh/f/VxEv67daUjR4wlGze2ZMKmx6EaTNpR09W13qUkGuiZMAgjYy"
                    alt="WanderList experience on mobile"
                    width={300}
                    height={400}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Mobile layout with stacked text and image */}
              <div className="md:hidden space-y-6 mt-8">
                <div className="text-left space-y-4">
                  <p className="text-slate-600 text-lg leading-relaxed">
                    WanderLists are collections of incredible locations for incredible moments curated by experienced travellers.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Download a WanderList that matches your style and sync it directly to your Google Maps.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Then, directly in the Google Maps App you&apos;ll see exactly what&apos;s around you, easily navigate to those locations and even have tailored notes on what to do when you&apos;re there!
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    They&apos;re even sorted into categories to make it easier to find what you want at a glance, from a great place for a run 🏃‍➡️ to the best hamburger in town 🍔.
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    It makes travelling like a pro easy, with no research needed! Less time going &quot;huh?&quot;, and more time going &quot;Wow!&quot;
                  </p>
                </div>
                <div className="flex justify-center">
                  <Image
                    src="https://52cbfztl89.ufs.sh/f/VxEv67daUjR4wlGze2ZMKmx6EaTNpR09W13qUkGuiZMAgjYy"
                    alt="WanderList experience on mobile"
                    width={250}
                    height={333}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Heading size="h3">Featured WanderLists</Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-auto mt-4">
                {storeAndLocationList.map((item) => (
                  <LocationListCard
                    key={item.locationList.id}
                    storeAndLocationList={item}
                    hideButtonActions={true}
                    reviewCount={reviewCountMap.get(item.locationList.id) || 0}
                  />
                ))}
              </div>
              <div className="mt-12 grid place-content-center">
                <Link href="/wanderlists">
                  <Button variant="default">View All WanderLists</Button>
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ContentWrapper>
    </div>
  );
}

const HomePageLayout = (
  props: PropsWithChildren<{
    heading: React.ReactNode;
    subheading: React.ReactNode;
  }>
) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 text-center mb-12 pt-2">
        {props.heading}
        <div className="text-slate-600">{props.subheading}</div>
      </div>
      {props.children}
    </>
  );
};
