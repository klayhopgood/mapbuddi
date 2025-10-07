import Link from "next/link";
import { Logo } from "./logo";
import { ContentWrapper } from "./content-wrapper";
import { MenuItems } from "./menu-items";
import { Line } from "./line";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MobileNavigation } from "./mobile-navigation";
import { ShoppingCartHeader } from "./shopping-cart-header";
import { ProductSearch } from "./storefront/product-search";
import { CurrencySelector } from "./currency-selector";

export const NavBar = ({
  showSecondAnnouncementBar,
}: {
  showSecondAnnouncementBar: boolean;
}) => {
  return (
    <>
      <nav
        className={cn(
          "pb-1 sticky top-0 bg-white z-10 shadow-sm",
          showSecondAnnouncementBar && "border-b border-border"
        )}
      >
        <ContentWrapper className="flex justify-between items-center md:hidden flex-wrap gap-4">
          <Logo />
          <div className="ml-auto flex items-center gap-8">
            <ShoppingCartHeader />
            <MobileNavigation />
          </div>
        </ContentWrapper>
        <ContentWrapper className="hidden md:block">
          <ul className="flex items-center justify-between gap-12 py-2">
            <li>
              <Link href="/">
                <Logo />
              </Link>
            </li>
            <li className="flex-1">
              <ProductSearch />
            </li>
            <li className="flex items-center gap-6">
              <CurrencySelector />
              <div className="relative group">
                <Link
                  href={routes.account}
                  className="uppercase text-gray-700 text-sm hover:text-primary transition-colors"
                >
                  Account
                </Link>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-border shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link
                      href={`${routes.account}/selling`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      Selling
                    </Link>
                    <Link
                      href={`${routes.account}/buying`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      Buying
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/" className="uppercase text-gray-700 text-sm hover:text-primary transition-colors">
                Help Centre
              </Link>
            </li>
            <li>
              <ShoppingCartHeader />
            </li>
          </ul>
        </ContentWrapper>
        <Line className="hidden md:block" />
        <ContentWrapper className="hidden md:block py-0">
          <div className="-ml-4 mt-1">
            <MenuItems />
          </div>
        </ContentWrapper>
      </nav>
      <Line />
    </>
  );
};
