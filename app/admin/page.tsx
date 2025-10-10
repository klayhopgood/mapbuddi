import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, Users, BarChart3, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <HeadingAndSubheading
        heading="Admin Dashboard"
        subheading="Manage the MapBuddi platform"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Track and manage seller payouts manually. View pending amounts, payment methods, and mark payouts as completed.
            </p>
            <Link href="/admin/payouts">
              <Button className="w-full">Manage Payouts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Store Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all stores, seller information, and store performance metrics.
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Platform-wide analytics, revenue tracking, and performance metrics.
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure platform settings, fees, and system parameters.
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Weekly Payout Process</h3>
              <p className="text-sm text-blue-800 mb-3">
                Every Tuesday, review pending payouts and process them manually through your preferred payment method.
              </p>
              <Link href="/admin/payouts">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Process Payouts
                </Button>
              </Link>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Security Notice</h3>
              <p className="text-sm text-green-800 mb-3">
                This admin panel contains sensitive financial data. Always verify payment details before processing payouts.
              </p>
              <div className="text-xs text-green-700">
                Last accessed: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
