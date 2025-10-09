"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ListActionButtonsProps {
  listId: number;
  listName: string;
  isActive: boolean;
}

export const ListActionButtons = ({ listId, listName, isActive }: ListActionButtonsProps) => {
  const [copied, setCopied] = useState(false);

  // Only show for active lists
  if (!isActive) {
    return null;
  }

  const listUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/list/${listId}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(listUrl);
      
      setCopied(true);
      toast({
        title: "Link copied!",
        description: `Link for "${listName}" copied to clipboard`,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleViewList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.open(listUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewList}
        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
        title="View list in new tab"
      >
        View
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
        title="Copy link to clipboard"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
};
