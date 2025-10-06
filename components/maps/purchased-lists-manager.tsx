"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, Calendar, DollarSign, Users, CheckCircle, AlertCircle, Clock, Smartphone } from "lucide-react";
import { UserMapsIntegration, PurchasedListSync } from "@/db/schema";
import { toggleListSync } from "@/server-actions/maps-integration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const getSyncStatus = (listId: number) => {
    return syncStatuses.find(status => status.listId === listId);
  };

  const handleToggleSync = (listId: number, orderId: number, platform: 'google' | 'apple') => {
    if (!mapsIntegration?.googleMapsConnected && platform === 'google') {
      toast.error("Please connect Google Maps first");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleListSync(userId, listId, orderId, platform);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message || "Failed to toggle sync");
        }
      } catch (error) {
        toast.error("Failed to update sync status");
        console.error("Sync toggle error:", error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {purchasedLists.map((list) => {
        const syncStatus = getSyncStatus(list.id);
        
        return (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {list.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {list.description || "A curated collection of points of interest"}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  ${list.price}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* List Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{list.totalPois || 0} locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>by {list.sellerName}</span>
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

              {/* Sync Controls */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">Sync to Maps</h4>
                
                {/* Google Maps Sync */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Google Maps</p>
                      <div className="flex items-center gap-2 mt-1">
                        {syncStatus?.googleMapsSynced ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : syncStatus?.googleMapsSyncEnabled ? (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not Synced
                          </Badge>
                        )}
                        {syncStatus?.googleMapsLastSync && (
                          <span className="text-xs text-muted-foreground">
                            Last: {new Date(syncStatus.googleMapsLastSync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {/* Action buttons for synced maps */}
                      {syncStatus?.googleMapsSynced && syncStatus?.googleMapsMapId && (
                        <div className="flex gap-2 mt-2">
                          <Link 
                            href={`https://drive.google.com/file/d/${syncStatus.googleMapsMapId}/view`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="text-xs">View in Drive</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Switch
                    checked={syncStatus?.googleMapsSyncEnabled || false}
                    onCheckedChange={() => handleToggleSync(list.id, list.orderId, 'google')}
                    disabled={!mapsIntegration?.googleMapsConnected || isPending}
                  />
                </div>

                {/* Apple Maps Sync */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">Apple Maps</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                  
                  <Switch
                    checked={false}
                    disabled={true}
                  />
                </div>

                {!mapsIntegration?.googleMapsConnected && (
                  <p className="text-xs text-muted-foreground">
                    Connect Google Maps above to enable syncing
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
