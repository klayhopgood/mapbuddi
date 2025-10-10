"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MapPin, CheckCircle, Clock, Smartphone, ExternalLink } from "lucide-react";
import { UserMapsIntegration, PurchasedListSync } from "@/db/schema";
import { toggleListSync, retryFailedSync } from "@/server-actions/maps-integration";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { routes } from "@/lib/routes";

interface PurchasedList {
  id: number;
  name: string;
  orderId: number;
}

interface SyncToMapsSectionProps {
  list: PurchasedList;
  syncStatus: PurchasedListSync | undefined;
  mapsIntegration: UserMapsIntegration | null;
  userId: string;
}

export function SyncToMapsSection({ 
  list, 
  syncStatus, 
  mapsIntegration, 
  userId 
}: SyncToMapsSectionProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetrySync = (listId: number, orderId: number) => {
    startTransition(async () => {
      try {
        const result = await retryFailedSync(userId, listId, orderId);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message || "Failed to retry sync");
        }
      } catch (error) {
        toast.error("Failed to retry sync");
        console.error("Retry sync error:", error);
      }
    });
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
    <div className="space-y-3">
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2"
                    onClick={() => handleRetrySync(list.id, list.orderId)}
                    disabled={isPending}
                  >
                    Retry
                  </Button>
                </div>
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
            {/* Instructions for pending sync */}
            {syncStatus?.googleMapsSyncEnabled && !syncStatus?.googleMapsSynced && (
              <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded mt-2">
                ⏳ <strong>Sync in progress...</strong><br/>
                Your WanderList is being processed and will appear in Google Drive shortly. If it&apos;s been more than 2 minutes, click &quot;Retry&quot; above.
              </div>
            )}
            {/* Action buttons for synced maps */}
            {syncStatus?.googleMapsSynced && syncStatus?.googleMapsMapId && (
              <div className="flex flex-col gap-2 mt-2">
                       <div className="flex gap-2">
                         <Link 
                           href="https://mymaps.google.com/" 
                           target="_blank" 
                           rel="noopener noreferrer"
                         >
                           <Button variant="default" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                             🗺️ Open My Maps
                           </Button>
                         </Link>
                         <Link 
                           href={`https://drive.google.com/file/d/${syncStatus.googleMapsMapId}/view`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                         >
                           <Button variant="outline" size="sm" className="text-xs">View KML</Button>
                         </Link>
                         <Link 
                           href={`${routes.helpCentre}?tab=buyers&section=google-maps-integration`}
                           target="_blank"
                           rel="noopener noreferrer"
                         >
                           <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                             <ExternalLink size={12} />
                             How To View In Google Maps Guide
                           </Button>
                         </Link>
                       </div>
                <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  💡 <strong>Step 1:</strong> Click &quot;Open My Maps&quot; → &quot;Create a New Map&quot; → &quot;Import&quot; → Select your KML file<br/>
                  💡 <strong>Step 2:</strong> Open Google Maps app → Tap &quot;You&quot; (bottom) → Tap &quot;Maps&quot; → Find your imported map
                </div>
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
  );
}
