"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-generate-react-helpers";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Image from "next/image";

interface ListImageUploaderProps {
  currentImages?: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
}

export const ListImageUploader = ({ 
  currentImages = [], 
  onImagesUpdate, 
  maxImages = 10 
}: ListImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { startUpload } = useUploadThing("listImageUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res.length > 0) {
        const newImageUrls = res.map(file => file.url);
        const updatedImages = [...currentImages, ...newImageUrls];
        onImagesUpdate(updatedImages);
        toast({
          title: "Images uploaded",
          description: `${res.length} image${res.length > 1 ? 's' : ''} uploaded successfully.`,
        });
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (currentImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images per list.`,
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    for (const file of files) {
      // Validate file size (4MB limit)
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is over 4MB. Please select smaller images.`,
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsUploading(true);
    await startUpload(files);
  };

  const removeImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    onImagesUpdate(updatedImages);
    
    // Adjust current index if necessary
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1);
    } else if (updatedImages.length === 0) {
      setCurrentImageIndex(0);
    }
    
    toast({
      title: "Image removed",
      description: "The image has been removed from your list.",
    });
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === currentImages.length - 1 ? 0 : prev + 1
    );
  };

  const canUploadMore = currentImages.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative">
        {currentImages.length > 0 ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={currentImages[currentImageIndex]}
              alt={`List image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            
            {/* Navigation Arrows */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Remove Button */}
            <button
              onClick={() => removeImage(currentImageIndex)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X size={16} />
            </button>

            {/* Image Counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No images uploaded yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {currentImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === currentImageIndex 
                  ? 'border-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {currentImages.length} / {maxImages} images
          </p>
          <p className="text-xs text-muted-foreground">
            Max 4MB per image • JPG, PNG, WebP supported
          </p>
        </div>

        {canUploadMore && (
          <div>
            <label htmlFor="list-images-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="pointer-events-none"
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add Images
              </Button>
            </label>
            <input
              id="list-images-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
