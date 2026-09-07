"use client";

import {useUploadThing} from "@/uploadthing/uploadthing";
import type {Session} from "@/lib/auth";
import {useRouter} from "next/navigation";
import {ChangeEvent, useRef, useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {CloudUpload, RefreshCcw, X} from "lucide-react";

import adminUpdate from "@/app/dashboard/admin/actions/updateAvatar";
import userUpdate from "@/app/dashboard/user/actions/updateAvatar";
import merchantUpdate from "@/app/dashboard/merchant/actions/updateAvatar";

interface Props {
  session: Session;
}

export default function ProfileAvatar({session: initialSession}: Props) {
  const router = useRouter();
  const user = initialSession?.user;
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
        const newUrl = res[0].ufsUrl;
        try {
          const role = user?.role ?? "user";
          type AvatarUpdateResult = {success?: true} | {error: string};
          type Updater = (data: {
            url: string | null;
          }) => Promise<AvatarUpdateResult>;

          const updater = (
            role === "admin"
              ? adminUpdate
              : role === "merchant"
                ? merchantUpdate
                : userUpdate
          ) as Updater;

          const result = await updater({url: newUrl});
          if (result && "error" in result) throw new Error(result.error);

          setImageUrl(newUrl);
          setIsPending(false);
          setIsUploading(false);
          router.refresh();
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
    if (isDeleting || !imageUrl) return;
    setIsDeleting(true);
    try {
      const role = user?.role ?? "user";
      type AvatarUpdateResult = {success?: true} | {error: string};
      type Updater = (data: {
        url: string | null;
      }) => Promise<AvatarUpdateResult>;

      const updater = (
        role === "admin"
          ? adminUpdate
          : role === "merchant"
            ? merchantUpdate
            : userUpdate
      ) as Updater;
      const result = await updater({url: null});
      if (result && "error" in result) throw new Error(result.error);

      setImageUrl(null);
      alert("Image deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting image:", error);
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
          src={imageUrl ?? "/avatar/placeholder-avatar.svg"}
          alt="User Avatar"
          width={0}
          height={0}
          sizes="100vw"
          priority={true}
          className={`aspect-square h-22 w-22 rounded-full bg-primary border-2 border-gray-300 object-contain ${isPending ? "opacity-10 animate-pulse" : ""}`}
        />
      </div>

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
              <span className="font-normal text-md hidden sm:block">
                Update
              </span>
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1">
              <CloudUpload size={16} />
              <span className="font-normal text-md hidden sm:block">
                Upload
              </span>
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
                <span className="font-normal text-md hidden sm:block">
                  Delete
                </span>
              </p>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
