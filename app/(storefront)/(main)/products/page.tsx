import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function ProductsPage() {
  // Redirect to homepage which now shows location lists
  redirect(routes.lists);
}
