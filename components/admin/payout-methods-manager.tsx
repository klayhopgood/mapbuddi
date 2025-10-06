"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface PayoutMethodsProps {
  storeId: number;
  currentMethods?: any; // Current payout methods from database
  onSave: (methods: any) => Promise<{ success: boolean; message: string }>;
}

export default function PayoutMethodsManager({ storeId, currentMethods, onSave }: PayoutMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState(currentMethods?.preferredMethod || "paypal");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    // PayPal
    paypalEmail: currentMethods?.paypalEmail || "",
    
    // US Banking
    usRoutingNumber: currentMethods?.usRoutingNumber || "",
    usAccountNumber: currentMethods?.usAccountNumber || "",
    usAccountType: currentMethods?.usAccountType || "checking",
    
    // UK Banking
    ukSortCode: currentMethods?.ukSortCode || "",
    ukAccountNumber: currentMethods?.ukAccountNumber || "",
    
    // EU Banking
    euIban: currentMethods?.euIban || "",
    euBic: currentMethods?.euBic || "",
    
    // AU Banking
    auBsb: currentMethods?.auBsb || "",
    auAccountNumber: currentMethods?.auAccountNumber || "",
    
    // Account holder details
    accountHolderName: currentMethods?.accountHolderName || "",
    accountHolderAddress: currentMethods?.accountHolderAddress || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await onSave({
          ...formData,
          preferredMethod: selectedMethod,
          storeId,
        });
        
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          router.refresh(); // Refresh the page to show updated data
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Failed to save payout methods' 
        });
      }
    });
  };

  const formatInput = (value: string, format: string) => {
    // Helper to format banking inputs (e.g., sort codes, BSB)
    const digits = value.replace(/\D/g, "");
    switch (format) {
      case "uk-sort":
        return digits.replace(/(\d{2})(\d{2})(\d{2})/, "$1-$2-$3").slice(0, 8);
      case "au-bsb":
        return digits.replace(/(\d{3})(\d{3})/, "$1-$2").slice(0, 7);
      case "us-routing":
        return digits.slice(0, 9);
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Active Method Status */}
      {currentMethods && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle size={20} />
              Active Payout Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {currentMethods.preferredMethod === "paypal" && "PayPal"}
                  {currentMethods.preferredMethod === "bank_us" && "US Bank Account"}
                  {currentMethods.preferredMethod === "bank_uk" && "UK Bank Account"}
                  {currentMethods.preferredMethod === "bank_eu" && "European Bank Account"}
                  {currentMethods.preferredMethod === "bank_au" && "Australian Bank Account"}
                </p>
                <p className="text-sm text-gray-600">
                  {currentMethods.preferredMethod === "paypal" && currentMethods.paypalEmail}
                  {currentMethods.preferredMethod === "bank_us" && `****${currentMethods.usAccountNumber?.slice(-4)}`}
                  {currentMethods.preferredMethod === "bank_uk" && `****${currentMethods.ukAccountNumber?.slice(-4)}`}
                  {currentMethods.preferredMethod === "bank_eu" && `${currentMethods.euIban?.slice(0, 4)}****${currentMethods.euIban?.slice(-4)}`}
                  {currentMethods.preferredMethod === "bank_au" && `****${currentMethods.auAccountNumber?.slice(-4)}`}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manage Payout Methods</CardTitle>
          <p className="text-sm text-gray-600">
            {currentMethods 
              ? "Update your payout details or switch to a different method." 
              : "Choose how you'd like to receive payments from your sales."
            }
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="paypal">
                PayPal
                <Badge variant="secondary" className="ml-2">Global</Badge>
              </TabsTrigger>
              <TabsTrigger value="bank_us">
                US Bank
                <Badge variant="outline" className="ml-2">🇺🇸</Badge>
              </TabsTrigger>
              <TabsTrigger value="bank_uk">
                UK Bank
                <Badge variant="outline" className="ml-2">🇬🇧</Badge>
              </TabsTrigger>
              <TabsTrigger value="bank_eu">
                EU Bank
                <Badge variant="outline" className="ml-2">🇪🇺</Badge>
              </TabsTrigger>
              <TabsTrigger value="bank_au">
                AU Bank
                <Badge variant="outline" className="ml-2">🇦🇺</Badge>
              </TabsTrigger>
            </TabsList>

            {/* PayPal */}
            <TabsContent value="paypal" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">PayPal Payouts</h3>
                <p className="text-sm text-blue-700">Available worldwide • Instant transfers • Low fees</p>
              </div>
              <div>
                <Label htmlFor="paypal-email">PayPal Email Address</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="your-paypal@email.com"
                  value={formData.paypalEmail}
                  onChange={(e) => handleInputChange("paypalEmail", e.target.value)}
                />
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500">
                    Must be a verified PayPal account that can receive business payments
                  </p>
                  {formData.paypalEmail && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <strong>⚠️ Important:</strong> Make sure this PayPal account is verified and can receive business payments.
                      <br />
                      <span className="text-gray-600">
                        To verify: Log into PayPal → Settings → Account Options → Get Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* US Banking */}
            <TabsContent value="bank_us" className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">US Bank Transfer</h3>
                <p className="text-sm text-green-700">ACH transfers • 1-2 business days • No fees</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="us-routing">Routing Number</Label>
                  <Input
                    id="us-routing"
                    placeholder="123456789"
                    value={formData.usRoutingNumber}
                    onChange={(e) => handleInputChange("usRoutingNumber", formatInput(e.target.value, "us-routing"))}
                  />
                </div>
                <div>
                  <Label htmlFor="us-account">Account Number</Label>
                  <Input
                    id="us-account"
                    placeholder="1234567890"
                    value={formData.usAccountNumber}
                    onChange={(e) => handleInputChange("usAccountNumber", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="us-type">Account Type</Label>
                <Select value={formData.usAccountType} onValueChange={(value) => handleInputChange("usAccountType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* UK Banking */}
            <TabsContent value="bank_uk" className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">UK Bank Transfer</h3>
                <p className="text-sm text-purple-700">Faster Payments • Same day • No fees</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uk-sort">Sort Code</Label>
                  <Input
                    id="uk-sort"
                    placeholder="12-34-56"
                    value={formData.ukSortCode}
                    onChange={(e) => handleInputChange("ukSortCode", formatInput(e.target.value, "uk-sort"))}
                  />
                </div>
                <div>
                  <Label htmlFor="uk-account">Account Number</Label>
                  <Input
                    id="uk-account"
                    placeholder="12345678"
                    value={formData.ukAccountNumber}
                    onChange={(e) => handleInputChange("ukAccountNumber", e.target.value.replace(/\D/g, "").slice(0, 8))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* EU Banking */}
            <TabsContent value="bank_eu" className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900">European Bank Transfer</h3>
                <p className="text-sm text-yellow-700">SEPA transfers • 1 business day • Low fees</p>
              </div>
              <div>
                <Label htmlFor="eu-iban">IBAN</Label>
                <Input
                  id="eu-iban"
                  placeholder="DE89 3704 0044 0532 0130 00"
                  value={formData.euIban}
                  onChange={(e) => handleInputChange("euIban", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label htmlFor="eu-bic">BIC/SWIFT (Optional)</Label>
                <Input
                  id="eu-bic"
                  placeholder="DEUTDEFF"
                  value={formData.euBic}
                  onChange={(e) => handleInputChange("euBic", e.target.value.toUpperCase())}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional for SEPA zone transfers
                </p>
              </div>
            </TabsContent>

            {/* AU Banking */}
            <TabsContent value="bank_au" className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900">Australian Bank Transfer</h3>
                <p className="text-sm text-orange-700">NPP/PayID • Real-time • No fees</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="au-bsb">BSB</Label>
                  <Input
                    id="au-bsb"
                    placeholder="123-456"
                    value={formData.auBsb}
                    onChange={(e) => handleInputChange("auBsb", formatInput(e.target.value, "au-bsb"))}
                  />
                </div>
                <div>
                  <Label htmlFor="au-account">Account Number</Label>
                  <Input
                    id="au-account"
                    placeholder="123456789"
                    value={formData.auAccountNumber}
                    onChange={(e) => handleInputChange("auAccountNumber", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Account Holder Details (required for all banking) */}
          {selectedMethod.startsWith("bank_") && (
            <div className="mt-6 space-y-4 border-t pt-4">
              <h3 className="font-medium">Account Holder Information</h3>
              <div>
                <Label htmlFor="holder-name">Full Name (as on bank account)</Label>
                <Input
                  id="holder-name"
                  placeholder="John Smith"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="holder-address">Address</Label>
                <Input
                  id="holder-address"
                  placeholder="123 Main St, City, Country"
                  value={formData.accountHolderAddress}
                  onChange={(e) => handleInputChange("accountHolderAddress", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Success/Error Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-6">
            <Button 
              onClick={handleSave} 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Payout Method"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
            <div>🇨🇦 Canada</div>
            <div>🇯🇵 Japan</div>
            <div>🇸🇬 Singapore</div>
            <div>🇭🇰 Hong Kong</div>
            <div>🇳🇿 New Zealand</div>
            <div>🇨🇭 Switzerland</div>
            <div>🇳🇴 Norway</div>
            <div>🇸🇪 Sweden</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
