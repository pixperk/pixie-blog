import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();



// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  uploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
        .onUploadComplete(async ({ file }) => {
      // This code RUNS ON YOUR SERVER after upload

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        file: file.url,
      } ;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
