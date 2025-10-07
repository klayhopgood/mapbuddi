"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Crown, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SubscriptionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
}

export function SubscriptionPrompt({ isOpen, onClose, listName }: SubscriptionPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Membership Required
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              <strong>&ldquo;{listName}&rdquo;</strong> has been saved as a draft.
            </p>
            <p>
              To make your location lists visible to customers and start earning money, you need an active MapBuddi membership.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">MapBuddi Membership - $19/month</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Unlimited active location lists</li>
                <li>• Full selling capabilities</li>
                <li>• Automatic payout processing</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Continue as Draft
          </Button>
          <Link href="/account/selling/membership" className="w-full sm:w-auto">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Crown className="mr-2 h-4 w-4" />
              Get Membership
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
