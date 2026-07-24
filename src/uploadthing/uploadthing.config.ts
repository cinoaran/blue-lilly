import {createUploadthing, type FileRouter} from "uploadthing/next";
import {auth} from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  profilePicture: f({
    image: {maxFileSize: "4MB", maxFileCount: 5},
    video: {maxFileSize: "2GB", maxFileCount: 2},
  })
    .middleware(async ({req}) => {
      const session = await auth.api.getSession({headers: req.headers});
      if (!session?.user?.id) throw new Error("Unauthorized");
      return {userId: session.user.id};
    })
    .onUploadComplete(async ({metadata, file}) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return {uploadedBy: metadata.userId};
    }),

  // Dedicated route for carousel images
  carouselImage: f({
    image: {maxFileSize: "4MB", maxFileCount: 1},
  })
    .middleware(async ({req}) => {
      const session = await auth.api.getSession({headers: req.headers});
      if (!session?.user?.id) throw new Error("Unauthorized");
      return {userId: session.user.id};
    })
    .onUploadComplete(async ({metadata, file}) => {
      console.log("Carousel image uploaded for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return {uploadedBy: metadata.userId};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
