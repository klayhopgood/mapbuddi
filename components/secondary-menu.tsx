"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type MenuItems = { name: string; href: string; group: Groups }[];
type Groups = "buying" | "selling";

export const SecondaryMenu = (props: { menuItems: MenuItems }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine which tab should be active based on current path
  const activeTab = pathname.includes('/buying/') ? 'buying' : 'selling';
  
  // Handle tab switching by navigating to the first item in each group
  const handleTabChange = (value: string) => {
    const targetGroup = value as Groups;
    const firstItemInGroup = props.menuItems.find(item => item.group === targetGroup);
    if (firstItemInGroup) {
      router.push(firstItemInGroup.href);
    }
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
        className="overflow-auto flex justify-start items-center flex-nowrap"
      >
        {menuNames(props.menuItems, "selling")}
      </TabsContent>
      <TabsContent
        value="buying"
        className="overflow-auto flex justify-start items-center flex-nowrap"
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
