"use client";

import {useUploadThing} from "@/uploadthing/uploadthing";
import type {Session} from "@/lib/auth";
import {useRouter} from "next/navigation";
import {ChangeEvent, useRef, useState} from "react";
import {avatar} from "../../actions/admin/profile/avatar";
import Image from "next/image";
import {Button} from "../ui/button";
import {CloudUpload, RefreshCcw, X} from "lucide-react";

interface AvatarImageProps {
  session: Session;
}

const AvatarImage = ({session: initialSession}: AvatarImageProps) => {
  const router = useRouter();
  // The user object is still useful for initial state
  const user = initialSession?.user;
  // Use a dedicated state for the image URL, initialized from the prop.
  const [imageUrl, setImageUrl] = useState<string | null>(user?.image ?? null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {startUpload} = useUploadThing("profilePicture", {
    onClientUploadComplete: async (res) => {
      setIsUploading(true);
      setIsPending(true);
      if (res && res.length > 0) {
        // The `ufsUrl` is the new, preferred URL format from UploadThing.
        const newUrl = res[0].ufsUrl;
        try {
          // Call the server action to update the user's profile in the DB
          const result = await avatar({url: newUrl});
          if (result?.error) throw new Error(result.error);

          setImageUrl(newUrl); // Update the image URL state on success
          alert("Upload Completed and profile updated!");
          setIsPending(false);
          setIsUploading(false);
          router.refresh(); // Refresh server components to sync state
        } catch (error) {
          console.error("Failed to update profile:", error);
          alert(`ERROR! Failed to update profile.`);
        }
      }
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setIsPending(false);
      alert(`ERROR! ${error.message}`);
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setIsPending(true);
    },
  });

  const onFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await startUpload(Array.from(files));
    }
  };

  const onDeleteImage = async () => {
    // Guard clause: do nothing if already deleting or if there's no image.
    if (isDeleting || !imageUrl) return;

    setIsDeleting(true);
    try {
      // To delete the image, we call the server action with `null`.
      // The server action handles deleting from storage and the database.
      const result = await avatar({url: null});
      if (result?.error) throw new Error(result.error);

      // On success, update the client-side state immediately for a better UX.
      setImageUrl(null);
      alert("Image deleted successfully");
      router.refresh(); // Refresh server components to ensure consistency.
    } catch (error) {
      console.error("Error deleting image:", error);
      // Let the user know something went wrong.
      alert(
        `Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-2">
      <h6 className="flex flex-col md:flex-row items-center justify-center text-center">
        Welcome back, {user?.name}
      </h6>
      <div className={`relative max-w-24 max-h-24`}>
        <Image
          src={imageUrl ?? "/avatar/placeholder-avatar.svg"} // Fallback to a placeholder
          alt="User Avatar"
          width={0}
          height={0}
          sizes="100vw"
          priority={true}
          className={`aspect-square h-22 w-22 rounded-full bg-primary border-2 border-gray-300 object-contain ${isPending ? "opacity-10 animate-pulse" : ""}`}
        />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelected}
        className="hidden"
        accept="image/*"
      />

      <div className="flex items-center space-x-2">
        <Button
          variant={"default"}
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || isUploading}
          className="px-1 py-1 w-5 h-5 sm:w-fit sm:px-2 sm:py-4"
        >
          {imageUrl ? (
            <p className="flex items-center justify-center gap-1">
              <RefreshCcw size={10} />
              <span className="text-[0.9rem] hidden sm:block">Update</span>
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1">
              <CloudUpload size={16} />
              <span className="text-[0.9rem] hidden sm:block">Upload</span>
            </p>
          )}
        </Button>

        {imageUrl && (
          <Button
            variant={"destructive"}
            onClick={onDeleteImage}
            disabled={isDeleting || isPending}
            className="px-1 py-1 w-5 h-5 sm:w-fit sm:px-2 sm:py-4"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <p className="flex items-center justify-center gap-1">
                <X size={16} />
                <span className="text-[0.97rem] hidden sm:block">Delete</span>
              </p>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarImage;
