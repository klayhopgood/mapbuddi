"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteListButton } from "@/components/admin/delete-list-button";
import { ListActionButtons } from "@/components/admin/copy-list-link-button";

export type LocationListData = {
  id: number;
  name: string;
  price: string;
  currency: string;
  totalPois: number;
  avgRating: string | null;
  isActive: boolean;
  createdAt: Date;
};

export const columns: ColumnDef<LocationListData>[] = [
  {
    accessorKey: "name",
    header: "WanderList Name",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <MapPin size={16} className="text-gray-500 flex-shrink-0" />
            <Link 
              href={`/account/selling/lists/${row.original.id}`}
              className="font-medium hover:text-blue-600 truncate"
            >
              {row.getValue("name")}
            </Link>
          </div>
          <div className="flex-shrink-0">
            <ListActionButtons
              listId={row.original.id}
              listName={row.original.name}
              isActive={row.original.isActive}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const currency = row.original.currency;
      return (
        <div className="font-medium">
          {formatPrice(price, currency)}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPois",
    header: "POIs",
    cell: ({ row }) => {
      const count = row.getValue("totalPois") as number;
      return (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            <span className="sm:hidden">{count}</span>
            <span className="hidden sm:inline">{count} places</span>
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "avgRating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("avgRating") as string | null;
      if (!rating) {
        return <span className="text-gray-400">No reviews</span>;
      }
      return (
        <div className="flex items-center space-x-1">
          <Star size={14} className="text-yellow-400 fill-current" />
          <span>{parseFloat(rating).toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div className="hidden md:block">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Link href={`/account/selling/lists/${row.original.id}`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
              Edit
            </Button>
          </Link>
          <DeleteListButton 
            listId={row.original.id}
            listName={row.original.name}
          />
        </div>
      );
    },
  },
];
