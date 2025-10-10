"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Calendar, Users, ChevronDown, ChevronUp, Star, MessageSquare, ExternalLink } from "lucide-react";
import { UserMapsIntegration, PurchasedListSync } from "@/db/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { currencyFormatter } from "@/lib/currency";
import { SyncToMapsSection } from "./sync-to-maps-section";
import { ViewPoisSection } from "./view-pois-section";
import { LeaveReviewSection } from "./leave-review-section";
import Link from "next/link";
import { getWanderListUrl } from "@/lib/wanderlist-utils";

interface PurchasedList {
  id: number;
  name: string;
  description: string | null;
  totalPois: number | null;
  sellerName: string | null;
  orderId: number;
  purchaseDate: number | null;
  price: number;
}

interface PurchasedListsManagerProps {
  userId: string;
  purchasedLists: PurchasedList[];
  syncStatuses: PurchasedListSync[];
  mapsIntegration: UserMapsIntegration | null;
}

export function PurchasedListsManager({ 
  userId, 
  purchasedLists, 
  syncStatuses, 
  mapsIntegration 
}: PurchasedListsManagerProps) {
  const [expandedSections, setExpandedSections] = useState<{
    [listId: number]: {
      sync?: boolean;
      pois?: boolean;
      review?: boolean;
    }
  }>({});

  const toggleSection = (listId: number, section: 'sync' | 'pois' | 'review') => {
    setExpandedSections(prev => ({
      ...prev,
      [listId]: {
        ...prev[listId],
        [section]: !prev[listId]?.[section]
      }
    }));
  };

  const getSyncStatus = (listId: number) => {
    return syncStatuses.find(status => status.listId === listId);
  };

  return (
    <div className="space-y-4">
      {purchasedLists.map((list) => {
        const syncStatus = getSyncStatus(list.id);
        const sections = expandedSections[list.id] || {};
        
        return (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {list.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {list.description || "A curated collection of points of interest"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={getWanderListUrl(list.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ExternalLink size={14} />
                      View List
                    </Button>
                  </Link>
                  <Badge variant="outline">
                    ${list.price}
                  </Badge>
                </div>
              </div>
              
              {/* List Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{list.totalPois || 0} locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>by </span>
                  <Link 
                    href={`/profile/${list.sellerSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {list.sellerName}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {list.purchaseDate 
                      ? new Date(list.purchaseDate * 1000).toLocaleDateString()
                      : 'Unknown date'
                    }
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Sync to Maps - Collapsible */}
              <Collapsible 
                open={sections.sync} 
                onOpenChange={() => toggleSection(list.id, 'sync')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Sync to Maps</span>
                      </div>
                      {sections.sync ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <SyncToMapsSection
                    list={list}
                    syncStatus={syncStatus}
                    mapsIntegration={mapsIntegration}
                    userId={userId}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* View POIs - Collapsible */}
              <Collapsible 
                open={sections.pois} 
                onOpenChange={() => toggleSection(list.id, 'pois')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">View POIs</span>
                      </div>
                      {sections.pois ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <ViewPoisSection listId={list.id} />
                </CollapsibleContent>
              </Collapsible>

              {/* Leave a Review - Collapsible */}
              <Collapsible 
                open={sections.review} 
                onOpenChange={() => toggleSection(list.id, 'review')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-3 h-auto border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">Leave a Review</span>
                      </div>
                      {sections.review ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <LeaveReviewSection listId={list.id} />
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
