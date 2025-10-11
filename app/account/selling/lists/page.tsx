import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { InfoCard } from "@/components/admin/info-card";
import { DataTable } from "./data-table";
import { type LocationListData, columns } from "./columns";

async function getData(): Promise<LocationListData[]> {
  const user = await currentUser();
  // ternary required here as while the layout won't render children if not authed, RSC still seems to run regardless
  return !isNaN(Number(user?.privateMetadata.storeId))
    ? ((await db
        .select({
          id: locationLists.id,
          name: locationLists.name,
          price: locationLists.price,
          currency: locationLists.currency,
          totalPois: locationLists.totalPois,
          avgRating: locationLists.avgRating,
          isActive: locationLists.isActive,
          createdAt: locationLists.createdAt,
        })
        .from(locationLists)
        .where(and(
          eq(locationLists.storeId, Number(user?.privateMetadata.storeId)),
          isNull(locationLists.deletedAt) // Only show non-deleted lists
        ))
        .catch((err) => {
          console.log(err);
          return [];
        })) as any[])
    : [];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WanderListsPage() {
  const listsList = await getData();

  return (
    <>
      <div className="flex items-start justify-between">
        <HeadingAndSubheading
          heading="WanderLists"
          subheading="View and manage your curated WanderLists"
        />
        <Link href="/account/selling/lists/new">
          <Button>
            New WanderList <Plus size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
      {listsList.length === 0 ? (
        <InfoCard
          heading="You don't have any WanderLists yet"
          subheading="Create your first curated WanderList to get started"
          icon={<MapPin size={36} className="text-gray-600" />}
          button={
            <Link href="/account/selling/lists/new">
              <Button size="sm">Create WanderList</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-full">
              <DataTable columns={columns} data={listsList} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
