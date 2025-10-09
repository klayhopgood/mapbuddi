import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { routes } from "@/lib/routes";
import { db } from "@/db/db";
import { stores } from "@/db/schema";

export async function MenuItems() {
  // Fetch first 4 stores for Featured Travellers
  const featuredTravellers = await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      description: stores.description,
      profileImage: stores.profileImage,
    })
    .from(stores)
    .limit(4);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href={routes.wanderlists} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              WanderLists
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Featured Travellers</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {featuredTravellers.map((traveller) => (
                <TravellerItem
                  key={traveller.id}
                  name={traveller.name || "Unknown Traveller"}
                  slug={traveller.slug || ""}
                  description={traveller.description || "Passionate traveller sharing amazing locations"}
                  profileImage={traveller.profileImage}
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const TravellerItem = ({
  name,
  slug,
  description,
  profileImage,
}: {
  name: string;
  slug: string;
  description: string;
  profileImage: string | null;
}) => {
  const profileLink = `/profile/${slug}`;
  
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={profileLink}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={`${name} profile`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-none mb-1">
                {name}
              </div>
              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                {description.length > 60 ? `${description.substring(0, 60)}...` : description}
              </p>
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";