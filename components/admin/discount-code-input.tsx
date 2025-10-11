"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Tag, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface DiscountCodeInputProps {
  onDiscountCodeChange: (code: string | null) => void;
  disabled?: boolean;
}

export function DiscountCodeInput({ onDiscountCodeChange, disabled }: DiscountCodeInputProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    discount?: {
      amount: number;
      type: "percentage" | "fixed";
    };
  } | null>(null);

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setValidationResult(null);
      onDiscountCodeChange(null);
      return;
    }

    setIsValidating(true);
    try {
      // Call your API to validate the discount code
      const response = await fetch("/api/validate-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidationResult({
          isValid: true,
          message: data.message || "Discount code applied!",
          discount: data.discount,
        });
        onDiscountCodeChange(code.trim());
        toast({
          title: "Discount Applied",
          description: data.message || "Your discount code has been applied successfully!",
        });
      } else {
        setValidationResult({
          isValid: false,
          message: data.message || "Invalid discount code",
        });
        onDiscountCodeChange(null);
        toast({
          title: "Invalid Code",
          description: data.message || "This discount code is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Error validating discount code",
      });
      onDiscountCodeChange(null);
      toast({
        title: "Validation Error",
        description: "Failed to validate discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateDiscountCode(discountCode);
  };

  const clearDiscount = () => {
    setDiscountCode("");
    setValidationResult(null);
    onDiscountCodeChange(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Discount Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="discount-code" className="sr-only">
                Discount Code
              </Label>
              <Input
                id="discount-code"
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                disabled={disabled || isValidating}
                className={validationResult ? (validationResult.isValid ? "border-green-500" : "border-red-500") : ""}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={disabled || isValidating || !discountCode.trim()}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </form>

        {validationResult && (
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${validationResult.isValid ? "text-green-700" : "text-red-700"}`}>
                {validationResult.message}
              </span>
            </div>
            {validationResult.isValid && (
              <div className="flex items-center gap-2">
                {validationResult.discount && (
                  <Badge variant="secondary" className="text-xs">
                    {validationResult.discount.type === "percentage" 
                      ? `${validationResult.discount.amount}% off`
                      : `$${validationResult.discount.amount} off`
                    }
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDiscount}
                  className="h-6 w-6 p-0"
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
