"use server";

import {redirect} from "next/navigation";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {createStripeCheckout} from "@/lib/Stripe/orders";

type CreateCheckoutActionInput = {
  shippingAddressId: string;
  billingAddressId: string;
};

export async function createCheckoutAction({
  shippingAddressId,
  billingAddressId,
}: CreateCheckoutActionInput) {
  const hdrs = await headers();
  const session = await getSessionOnce({headers: hdrs});

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Call the server API to create the order and Stripe session so the
  // server can read cookies and session headers reliably.
  const res = await fetch("/api/stripe/checkout/create-session", {
    method: "POST",
    credentials: "same-origin",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      billingId: billingAddressId,
      shippingId: shippingAddressId,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to create checkout session");
  }

  redirect(json.url as string);
}
