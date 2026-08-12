"use client";

import {authClient} from "@/lib/auth/auth-client";
import {useRouter} from "next/navigation";

interface VerifyUserEmailUserProps {
  userId: string;
  emailVerified: boolean;
}

export default function VerifyUserEmailUser({
  userId,
  emailVerified,
}: VerifyUserEmailUserProps) {
  const router = useRouter();

  const handleVerifyUserEmailUser = async () => {
    try {
      await authClient.admin.updateUser({
        userId,
        data: {
          emailVerified: !emailVerified,
        },
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  };

  return (
    <span
      onClick={handleVerifyUserEmailUser}
      className={`w-5 h-5 rounded-full flex items-center justify-center ${emailVerified ? "bg-green-800" : "bg-red-800 animate-pulse"}`}
    ></span>
  );
}
