"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatPrice } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    header: "List Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-gray-500" />
          <Link 
            href={`/account/selling/lists/${row.original.id}`}
            className="font-medium hover:text-blue-600"
          >
            {row.getValue("name")}
          </Link>
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
          <Badge variant="secondary">{count} places</Badge>
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
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link href={`/account/selling/lists/${row.original.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      );
    },
  },
];
