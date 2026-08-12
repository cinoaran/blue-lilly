"use client";
import {useEffect} from "react";

export default function ClearCartClient() {
  useEffect(() => {
    // best-effort call to route that clears cookie via Set-Cookie header
    fetch("/api/cart/clear", {method: "GET", credentials: "include"}).catch(
      () => {},
    );
  }, []);

  return null;
}
