"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { routes } from "@/lib/routes";
import { searchAll } from "@/server-actions/location-search";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";
import { ListImages } from "@/lib/types";
import { ImageOff, MapPin, Store } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { LoadingSkeleton } from "../ui/loading-skeleton";
import { ProductImage } from "../product-image";

export function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{
    lists: any[];
    stores: any[];
  }>({ lists: [], stores: [] });
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [confirmedHasNoResults, setConfirmedHasNoResults] = useState(false);
  const { formatDisplayPrice } = useCurrency();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (searchTerm === "") return setResults({ lists: [], stores: [] });
    const getData = setTimeout(async () => {
      if (searchTerm === "") return;
      setIsLoadingResults(true);
      setConfirmedHasNoResults(false);
      try {
        const searchResults = await searchAll(searchTerm);
        setResults(searchResults);
        if (searchResults.lists.length === 0 && searchResults.stores.length === 0) {
          setConfirmedHasNoResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ lists: [], stores: [] });
        setConfirmedHasNoResults(true);
      } finally {
        setIsLoadingResults(false);
      }
    }, 500);
    return () => clearTimeout(getData);
  }, [searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <button
          className="border border-border px-4 py-2 rounded-md w-full flex items-center justify-between gap-2"
          onClick={() => setOpen((prev) => !prev)}
        >
          <p className="text-muted-foreground text-sm">Search...</p>
          <p className="text-sm text-muted-foreground hidden md:block">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </p>
        </button>
      </div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search for a list or store</DialogTitle>
            <DialogDescription>
              Search our entire List and Traveller Store catalogue
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-col gap-2 items-start justify-start">
            {isLoadingResults && <LoadingSkeleton className="w-full h-12" />}
            {results.lists.length === 0 && results.stores.length === 0 &&
              searchTerm !== "" &&
              !isLoadingResults &&
              confirmedHasNoResults && <p>No results found.</p>}
            
            {/* Location Lists Results */}
            {results.lists.length > 0 && (
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Location Lists</h3>
                {results.lists.map((list) => (
                  <Link
                    href={`/list/${list.id}`}
                    onClick={() => setOpen(false)}
                    key={`list-${list.id}`}
                    className="w-full bg-secondary p-2 rounded-md mb-2 block"
                  >
                    <div className="flex items-center justify-start gap-2">
                      {list.coverImage && JSON.parse(list.coverImage).length > 0 ? (
                        <ProductImage
                          src={JSON.parse(list.coverImage)[0]?.url}
                          alt={JSON.parse(list.coverImage)[0]?.alt || list.name}
                          sizes="50px"
                          height="h-12"
                          width="w-14"
                        />
                      ) : (
                        <div className="h-12 w-14 bg-gray-100 rounded-md flex items-center justify-center">
                          <MapPin size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex flex-col items-start">
                          <Button
                            variant="link"
                            className="flex items-center justify-start w-full text-left p-0 h-auto"
                          >
                            {list.name}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            by {list.storeName} • {list.totalPois || 0} places
                          </p>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {formatDisplayPrice(Number(list.price))}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Stores Results */}
            {results.stores.length > 0 && (
              <div className="w-full">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Stores</h3>
                {results.stores.map((store) => (
                  <Link
                    href={`/lists?seller=${store.slug}`}
                    onClick={() => setOpen(false)}
                    key={`store-${store.id}`}
                    className="w-full bg-secondary p-2 rounded-md mb-2 block"
                  >
                    <div className="flex items-center justify-start gap-2">
                      <div className="h-12 w-14 bg-gray-100 rounded-md flex items-center justify-center">
                        <Store size={16} className="text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between w-full pr-4">
                        <Button
                          variant="link"
                          className="flex items-center justify-start w-full text-left p-0 h-auto"
                        >
                          {store.name}
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
