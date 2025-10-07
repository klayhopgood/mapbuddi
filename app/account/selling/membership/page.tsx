import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { InfoCard } from "@/components/admin/info-card";
import { Crown, CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getStoreId } from "@/server-actions/store-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionStatus, createSubscription, cancelSubscription } from "@/server-actions/subscription";
import { SubscriptionCard } from "@/components/admin/subscription-card";

export default async function MembershipPage() {
  const storeId = Number(await getStoreId());
  
  if (isNaN(storeId)) {
    return (
      <InfoCard
        heading="No store found"
        subheading="You need to create a store first before managing your membership."
        icon={<AlertCircle size={24} />}
        button={
          <Button>Create Store</Button>
        }
      />
    );
  }

  // Get current subscription status
  const subscriptionStatus = await getSubscriptionStatus(storeId);

  return (
    <div className="space-y-8">
      <HeadingAndSubheading
        heading="Membership"
        subheading="Manage your subscription to sell location lists on MapBuddi"
      />

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={subscriptionStatus?.isActive ? "default" : "secondary"}
                  className={subscriptionStatus?.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {subscriptionStatus?.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                {subscriptionStatus?.cancelAtPeriodEnd && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Cancels at period end
                  </Badge>
                )}
              </div>
              
              {subscriptionStatus?.isActive ? (
                <div className="text-sm text-gray-600">
                  <p>Next billing date: {subscriptionStatus.currentPeriodEnd ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 'Unknown'}</p>
                  <p className="font-medium text-lg">$19.00 USD/month</p>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Subscribe to activate your location lists and start selling</p>
                  <p className="font-medium text-lg">$19.00 USD/month</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <SubscriptionCard 
        storeId={storeId}
        subscriptionStatus={subscriptionStatus}
        onCreateSubscription={createSubscription}
        onCancelSubscription={cancelSubscription}
      />

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Unlimited active location lists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Full selling capabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Automatic payout processing</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Analytics and insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">No setup fees</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Important Information</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• Without an active subscription, your location lists will be saved as drafts and won&apos;t be visible to customers</li>
            <li>• You can cancel anytime - your subscription will remain active until the end of your current billing period</li>
            <li>• When you cancel, all active lists will automatically return to draft status</li>
            <li>• You can reactivate your subscription at any time to make your lists active again</li>
            <li>• Platform fees still apply to sales (10% + payment processing fees)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
