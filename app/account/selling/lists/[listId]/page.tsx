import { LocationListEditor } from "@/components/admin/location-list-editor";
import { db } from "@/db/db";
import { locationLists, listCategories, listPois } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function getLocationList(listId: number) {
  const user = await currentUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const storeId = Number(user.privateMetadata?.storeId);
  if (!storeId) {
    redirect('/account/selling');
  }

  // Get the location list
  const [list] = await db
    .select()
    .from(locationLists)
    .where(eq(locationLists.id, listId));

  if (!list || list.storeId !== storeId) {
    redirect('/account/selling/lists');
  }

  // Get categories for this list
  const categories = await db
    .select()
    .from(listCategories)
    .where(eq(listCategories.listId, listId));

  // Get POIs for this list
  const pois = await db
    .select()
    .from(listPois)
    .innerJoin(listCategories, eq(listPois.categoryId, listCategories.id))
    .where(eq(listCategories.listId, listId));

  return {
    list,
    categories,
    pois: pois.map(p => p.list_pois)
  };
}

export default async function EditLocationListPage({ 
  params 
}: { 
  params: { listId: string } 
}) {
  const listId = parseInt(params.listId);
  const { list, categories, pois } = await getLocationList(listId);

  return (
    <LocationListEditor 
      listStatus="existing-list" 
      initialValues={list}
      initialCategories={categories}
      initialPois={pois}
    />
  );
}
