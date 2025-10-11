"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type MenuItems = { name: string; href: string; group: Groups }[];
type Groups = "buying" | "selling";

export const SecondaryMenu = (props: { menuItems: MenuItems }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine which tab should be active based on current path or search params
  const tab = searchParams.get('tab');
  const activeTab = tab || (pathname.includes('/buying/') ? 'buying' : 'selling');
  
  // Handle tab switching by navigating to account page with tab parameter
  const handleTabChange = (value: string) => {
    router.push(`/account?tab=${value}`);
  };
  
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex items-center justify-start gap-2"
    >
      <TabsList>
        <TabsTrigger value="selling">Selling</TabsTrigger>
        <TabsTrigger value="buying">Buying</TabsTrigger>
      </TabsList>
      <TabsContent
        value="selling"
        className="overflow-x-auto flex justify-start items-center flex-nowrap scrollbar-hide"
      >
        {menuNames(props.menuItems, "selling")}
      </TabsContent>
      <TabsContent
        value="buying"
        className="overflow-x-auto flex justify-start items-center flex-nowrap scrollbar-hide"
      >
        {menuNames(props.menuItems, "buying")}
      </TabsContent>
    </Tabs>
  );
};

const menuNames = (menuItems: MenuItems, group: Groups) => {
  return menuItems
    .filter((item) => item.group === group)
    .map((item, i) => (
      <Link href={item.href} key={i}>
        <Button variant="link" className="mb-1">
          {item.name}
        </Button>
      </Link>
    ));
};
