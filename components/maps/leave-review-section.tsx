"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createOrUpdateReview, getUserReviewForList } from "@/server-actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LeaveReviewSectionProps {
  listId: number;
}

export function LeaveReviewSection({ listId }: LeaveReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExistingReview = async () => {
      try {
        setLoading(true);
        const review = await getUserReviewForList(listId);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setReviewText(review.review || "");
        }
      } catch (error) {
        console.error("Failed to fetch existing review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingReview();
  }, [listId]);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewText.length > 500) {
      toast.error("Review must be 500 characters or less");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createOrUpdateReview(listId, {
          rating,
          review: reviewText.trim() || undefined,
        });

        if (result.success) {
          toast.success(result.message);
          setExistingReview({ rating, review: reviewText });
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to save review");
        console.error("Review submission error:", error);
      }
    });
  };

  const StarRating = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-colors"
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
        >
          <Star
            className={`h-6 w-6 ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded w-32"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {existingReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Your existing review:
          </p>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= existingReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-blue-700">
              {existingReview.rating} star{existingReview.rating !== 1 ? 's' : ''}
            </span>
          </div>
          {existingReview.review && (
            <p className="text-sm text-blue-700">{existingReview.review}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          {existingReview ? 'Update your rating:' : 'Rate this list:'}
        </label>
        <StarRating />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {existingReview ? 'Update your review:' : 'Write a review (optional):'}
        </label>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this WanderList..."
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reviewText.length}/500 characters
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || rating === 0}
        className="w-full"
      >
        {isPending 
          ? "Saving..." 
          : existingReview 
            ? "Update Review" 
            : "Submit Review"
        }
      </Button>
    </div>
  );
}
