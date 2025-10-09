"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteLocationList } from "@/server-actions/delete-list";

interface DeleteListButtonProps {
  listId: number;
  listName: string;
}

export function DeleteListButton({ listId, listName }: DeleteListButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteLocationList(listId);
        
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Failed to delete list' 
        });
      }
    });
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={isPending}
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete WanderList</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>&ldquo;{listName}&rdquo;</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                <p className="font-medium text-yellow-800">⚠️ Important:</p>
                <ul className="text-yellow-700 mt-1 space-y-1">
                  <li>• This will remove the list from your dashboard</li>
                  <li>• Customers who already purchased it will keep access</li>
                  <li>• You cannot recover this list once deleted</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Yes, Delete List"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-2 p-2 rounded text-xs ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </>
  );
}
