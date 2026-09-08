"use client";
import {useEffect} from "react";
import {clearCart} from "@/app/(root)/cart/actions/clearCart";

export default function ClearCartClient() {
  useEffect(() => {
    // best-effort call to server action that clears cookie
    void clearCart().catch(() => {});
  }, []);

  return null;
}
