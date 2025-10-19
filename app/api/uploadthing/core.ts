import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const getUser = async () => await currentUser();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Profile image uploader - single image, up to 4MB
  profileImageUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 1 
    } 
  })
    .middleware(async (req) => {
      const user = await getUser();
      if (!user) throw new Error("Unauthorized");
      return { 
        userId: user.id,
        storeId: user.privateMetadata.storeId 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete for storeId:", metadata.storeId);
      console.log("Profile image URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // List images uploader - multiple images, up to 10MB each, max 30 images
  listImageUploader: f({ 
    image: { 
      maxFileSize: "10MB", 
      maxFileCount: 30 
    } 
  })
    .middleware(async (req) => {
      const user = await getUser();
      if (!user) throw new Error("Unauthorized");
      return { 
        userId: user.id,
        storeId: user.privateMetadata.storeId 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("List images upload complete for storeId:", metadata.storeId);
      console.log("List image URLs:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Legacy image uploader (keeping for backward compatibility)
  imageUploader: f({ image: { maxFileSize: "1MB", maxFileCount: 5 } })
    .middleware(async (req) => {
      const user = await getUser();
      if (!user) throw new Error("Unauthorized");
      return { storeId: user.privateMetadata.storeId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.storeId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
