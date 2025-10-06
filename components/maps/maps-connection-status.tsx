"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { UserMapsIntegration } from "@/db/schema";
import { connectGoogleMaps } from "@/server-actions/maps-integration";
import { toast } from "sonner";

interface MapsConnectionStatusProps {
  userId: string;
  mapsIntegration: UserMapsIntegration | null;
}

export function MapsConnectionStatus({ userId, mapsIntegration }: MapsConnectionStatusProps) {
  const [isPending, startTransition] = useTransition();

  const handleGoogleMapsConnect = () => {
    startTransition(async () => {
      try {
        const result = await connectGoogleMaps(userId);
        if (result.success && result.authUrl) {
          // Redirect to Google OAuth
          window.location.href = result.authUrl;
        } else {
          toast.error(result.message || "Failed to connect Google Maps");
        }
      } catch (error) {
        toast.error("Failed to connect Google Maps");
        console.error("Google Maps connection error:", error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Maps Integration</h2>
        <p className="text-muted-foreground">
          Connect your maps apps to sync your purchased location lists
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Maps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Google Maps
            </CardTitle>
            <CardDescription>
              Sync your lists to Google My Maps for easy navigation. Files are organized in a "MapBuddi" folder in your Drive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status</span>
              {mapsIntegration?.googleMapsConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </div>

            {!mapsIntegration?.googleMapsConnected ? (
              <Button 
                onClick={handleGoogleMapsConnect}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Connecting..." : "Connect Google Maps"}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ Ready to sync location lists
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apple Maps */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-gray-400" />
              Apple Maps
            </CardTitle>
            <CardDescription>
              Sync your lists to Apple Maps (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connection Status</span>
              <Badge variant="secondary">
                Coming Soon
              </Badge>
            </div>

            <Button disabled className="w-full">
              Connect Apple Maps
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Apple Maps integration will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
