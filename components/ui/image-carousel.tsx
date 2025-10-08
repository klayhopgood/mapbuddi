"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  altText: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  showThumbnails?: boolean;
  showCounter?: boolean;
}

export const ImageCarousel = ({ 
  images, 
  altText, 
  className,
  aspectRatio = "video",
  showThumbnails = false,
  showCounter = true
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center",
        aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "",
        className
      )}>
        <p className="text-gray-500 text-sm">No images available</p>
      </div>
    );
  }

  const previousImage = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    previousImage();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    nextImage();
  };

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    goToImage(index);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Image Display */}
      <div className="relative group">
        <div className={cn(
          "relative overflow-hidden rounded-lg",
          aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : ""
        )}>
          <Image
            src={images[currentIndex]}
            alt={`${altText} ${currentIndex + 1}`}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows - only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && showCounter && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => handleThumbnailClick(e, index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all",
                index === currentIndex 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image
                src={image}
                alt={`${altText} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot Indicators for small carousels */}
      {images.length > 1 && images.length <= 5 && !showThumbnails && (
        <div className="flex justify-center gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleThumbnailClick(e, index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-primary" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
