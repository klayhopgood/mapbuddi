"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing-generate-react-helpers";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageUpdate: (imageUrl: string) => void;
}

export const ProfileImageUploader = ({ currentImage, onImageUpdate }: ProfileImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("profileImageUploader", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        onImageUpdate(res[0].url);
        toast({
          title: "Profile image updated",
          description: "Your profile image has been successfully uploaded.",
        });
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 4MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    await startUpload([file]);
  };

  const removeImage = () => {
    onImageUpdate("");
    toast({
      title: "Profile image removed",
      description: "Your profile image has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Current Image Preview */}
        <div className="relative">
          {currentImage ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={currentImage}
                alt="Profile image"
                fill
                className="object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <Upload size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="space-y-2">
            <label htmlFor="profile-image-upload">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentImage ? "Change Image" : "Upload Image"}
                </span>
              </Button>
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: Square image, max 4MB
              <br />
              Supported formats: JPG, PNG, WebP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
