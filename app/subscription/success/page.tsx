import { Suspense } from "react";
import { CheckCircle, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ContentWrapper } from "@/components/content-wrapper";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <ContentWrapper className="max-w-2xl">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Welcome to MapBuddi Membership!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-3">
              <div className="text-xl font-semibold text-gray-800">
                Your subscription is now active
              </div>
              <Text className="text-gray-600">
                You can now create unlimited active location lists and start earning money from your expertise.
              </Text>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">What&apos;s Next?</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✅ You can now activate your draft lists when they&apos;re ready</li>
                <li>✅ Create new lists and choose when to make them active</li>
                <li>✅ Start earning money from your location expertise</li>
                <li>✅ Access to seller analytics and insights</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/account/selling/lists">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  View My Lists
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/account/selling/lists/new">
                <Button variant="outline" className="w-full sm:w-auto">
                  Create New List
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Text className="text-sm text-gray-500">
                Questions? Visit your{" "}
                <Link href="/account/selling/membership" className="text-blue-600 hover:underline">
                  membership settings
                </Link>{" "}
                or contact support.
              </Text>
            </div>
          </CardContent>
        </Card>
      </ContentWrapper>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
