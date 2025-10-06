import { ContentWrapper } from "@/components/content-wrapper";
import { SlideShow } from "@/components/slideshow";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db/db";
import { locationLists, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PropsWithChildren } from "react";
import { LocationListCard } from "@/components/storefront/location-list-card";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";
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
              heading={<Heading size="h1">Sell online with ease.</Heading>}
              subheading={
                <Heading size="h2">
                  Access our global marketplace and sell your <br /> location lists to
                  over 1 million visitors.
                </Heading>
              }
            >
              <div className="md:grid md:grid-cols-3 gap-4 flex flex-col mt-12">
                <FeatureBanner
                  heading="No monthly fees"
                  subheading="Fugit voluptates nihil ex et voluptas dignissimos blanditiis. Consectetur velit pariatur nihil quis nihil similique voluptatum in. Et nostrum ipsam quo magni. Velit et odit dolores."
                  icon={<DollarSign size={32} />}
                />
                <FeatureBanner
                  heading="Access to millions of buyers"
                  subheading="Fugit voluptates nihil ex et voluptas dignissimos blanditiis. Consectetur velit pariatur nihil quis nihil similique voluptatum in. Et nostrum ipsam quo magni. Velit et odit dolores."
                  icon={<User size={32} />}
                />
                <FeatureBanner
                  heading="Quick and easy setup"
                  subheading="Fugit voluptates nihil ex et voluptas dignissimos blanditiis. Consectetur velit pariatur nihil quis nihil similique voluptatum in. Et nostrum ipsam quo magni. Velit et odit dolores."
                  icon={<AlarmClock size={32} />}
                />
              </div>
              <div className="flex items-center justify-center mt-12">
                <Link href={routes.signUp}>
                  <Button size="lg">Create account</Button>
                </Link>
              </div>
            </HomePageLayout>
          </TabsContent>
          <TabsContent value="for-buyers">
            <HomePageLayout
              heading={<Heading size="h1">Online shopping made easy.</Heading>}
              subheading={
                <Heading size="h2">
                  Shop hundreds of curated location lists from sellers worldwide.
                </Heading>
              }
            >
              <Heading size="h3">Featured Location Lists</Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-auto mt-4">
                {storeAndLocationList.map((item) => (
                  <LocationListCard
                    key={item.locationList.id}
                    storeAndLocationList={item}
                    hideButtonActions={true}
                  />
                ))}
              </div>
              <div className="mt-12 grid place-content-center">
                <Link href="/lists">
                  <Button variant="default">View All Location Lists</Button>
                </Link>
              </div>
              <div className="bg-blue-900 text-white w-full p-12 rounded-md mt-12 flex items-center flex-col gap-2 justify-center text-center">
                <p className="uppercase tracking-wide text-sm font-medium">
                  Featured seller
                </p>
                <p className="text-3xl font-bold">Tim&apos;s Terrific Toys</p>
                <p>
                  Top seller of the month! Tim&apos;s Toys has been selling toys
                  for 10 years and is a top rated seller on the platform.
                </p>
                <Link
                  href={routes.products + "?seller=tims-toys"}
                  className="mt-6"
                >
                  <Button variant="secondary">Explore seller</Button>
                </Link>
              </div>
              <div className="md:grid md:grid-cols-3 gap-4 flex flex-col mt-12">
                <FeatureBanner
                  heading="Free Shipping"
                  subheading="Free shipping on all orders over $50"
                  icon={<Truck size={32} />}
                />
                <FeatureBanner
                  heading="24/7 Customer Support"
                  subheading="Have a question? Get in touch."
                  icon={<Phone size={32} />}
                />
                <FeatureBanner
                  heading="Best prices"
                  subheading="We offer the best prices on the market."
                  icon={<DollarSign size={32} />}
                />
              </div>
            </HomePageLayout>
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
