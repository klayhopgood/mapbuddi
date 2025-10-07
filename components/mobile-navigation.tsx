"use client";

import { useState } from "react";
import { Menu, ChevronDown, ChevronUp } from "lucide-react";
import { routes } from "@/lib/routes";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductSearch } from "./storefront/product-search";
import { ProductImage } from "./product-image";
import { images } from "@/lib/assets";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const MobileNavigation = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  
  return (
    <>
      <Sheet
        open={isMobileNavOpen}
        onOpenChange={() => setIsMobileNavOpen((prev) => !prev)}
      >
        <SheetTrigger>
          <div className="p-2 rounded-md border border-border">
            <Menu />
          </div>
        </SheetTrigger>
        <SheetContent
          size="full"
          className="overflow-auto lg:max-w-[600px] sm:max-w-[400px] xl:max-w-[650px]"
        >
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="my-6">
            <ProductSearch />
          </div>
          <div className="flex items-start justify-center gap-2 flex-col">
            <NavBarLink
              image={images[0]}
              href={routes.lists}
              name="Location Lists"
              setIsMobileNavOpen={setIsMobileNavOpen}
            />
            
            {/* Account Section with Dropdown */}
            <div className="w-full">
              <div 
                className="flex gap-2 items-center justify-between w-full rounded-md border border-border cursor-pointer"
                onClick={() => setAccountExpanded(!accountExpanded)}
              >
                <ProductImage
                  alt="account"
                  src={images[1]}
                  sizes="50px"
                  height="h-14"
                  width="w-14"
                />
                <div className="flex-1 text-left">
                  <Button variant="link" className="justify-start w-full">
                    Account
                  </Button>
                </div>
                <div className="pr-4">
                  {accountExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
              
              {accountExpanded && (
                <div className="ml-4 mt-2 space-y-2">
                  <SubMenuLink 
                    href={routes.account} 
                    name="Dashboard" 
                    setIsMobileNavOpen={setIsMobileNavOpen}
                  />
                  <SubMenuLink 
                    href={routes.selling} 
                    name="Selling Overview" 
                    setIsMobileNavOpen={setIsMobileNavOpen}
                  />
                  <SubMenuLink 
                    href={routes.buying} 
                    name="Buying Overview" 
                    setIsMobileNavOpen={setIsMobileNavOpen}
                  />
                </div>
              )}
            </div>

            <NavBarLink
              image={images[0]} // Using same image placeholder for now
              href="/"
              name="Help Centre"
              setIsMobileNavOpen={setIsMobileNavOpen}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const NavBarLink = (props: {
  href: string;
  name: string;
  image: string;
  setIsMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  return (
    <div className="flex gap-2 items-center justify-between w-full rounded-md border border-border">
      <ProductImage
        alt="products"
        src={props.image}
        sizes="50px"
        height="h-14"
        width="w-14"
      />
      <div className="w-full text-left">
        <Button
          variant="link"
          onClick={() => {
            router.push(props.href);
            props.setIsMobileNavOpen(false);
          }}
        >
          {props.name}
        </Button>
      </div>
    </div>
  );
};

const SubMenuLink = (props: {
  href: string;
  name: string;
  setIsMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  return (
    <div className="pl-4 py-2 border-l-2 border-gray-200">
      <Button
        variant="link"
        className="text-sm text-gray-600 justify-start p-0 h-auto"
        onClick={() => {
          router.push(props.href);
          props.setIsMobileNavOpen(false);
        }}
      >
        {props.name}
      </Button>
    </div>
  );
};
