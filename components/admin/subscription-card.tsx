"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import { CreditCard, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface SubscriptionStatus {
  isActive: boolean | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionCardProps {
  storeId: number;
  subscriptionStatus: SubscriptionStatus | null;
  onCreateSubscription: (storeId: number) => Promise<{ url?: string | null; error?: string }>;
  onCancelSubscription: (storeId: number) => Promise<{ success?: boolean; error?: string }>;
}

export function SubscriptionCard({
  storeId,
  subscriptionStatus,
  onCreateSubscription,
  onCancelSubscription
}: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await onCreateSubscription(storeId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await onCancelSubscription(storeId);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will end at the current billing period. Your lists will become drafts at that time.",
          variant: "default",
        });
        // Refresh the page to show updated status
        window.location.reload();
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (!subscriptionStatus?.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Start Selling Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">MapBuddi Seller Plan</h3>
                <p className="text-blue-700">Everything you need to sell location lists</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-900">$19</span>
                  <span className="text-blue-700"> USD/month</span>
                </div>
              </div>
              <Button 
                onClick={handleSubscribe}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Cancel anytime</p>
            <p>• No setup fees or long-term contracts</p>
            <p>• Secure payment processing via Stripe</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Manage Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div>
            <h3 className="font-semibold text-green-900">Active Subscription</h3>
            <p className="text-green-700">You can sell location lists and earn money</p>
            {subscriptionStatus.cancelAtPeriodEnd ? (
              <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Ends {subscriptionStatus.currentPeriodEnd ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 'soon'}
              </Badge>
            ) : (
              <p className="text-sm text-green-600 mt-1">
                Renews {subscriptionStatus.currentPeriodEnd ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 'automatically'}
              </p>
            )}
          </div>
          
          {!subscriptionStatus.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Are you sure you want to cancel your subscription?</p>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>What happens when you cancel:</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Your subscription remains active until {subscriptionStatus.currentPeriodEnd ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 'the end of your billing period'}</li>
                        <li>• All your active location lists will become drafts</li>
                        <li>• Customers won&apos;t be able to see or purchase your lists</li>
                        <li>• You can reactivate anytime to make your lists active again</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel Subscription"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Billing: $19.00 USD charged monthly via Stripe</p>
          <p>Next charge: {subscriptionStatus.currentPeriodEnd ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
