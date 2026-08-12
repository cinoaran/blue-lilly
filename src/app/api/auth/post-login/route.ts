import {auth, type Session} from "@/lib/auth";
import {mergeAnonymousCartIntoUserCart} from "@/lib/cart/mergeAnonymousCartIntoUserCart";
import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // (debug logs removed) - post-login route runs merge server-side
  // Default target if nothing else applies
  let targetUrl = "/";
  let session: Session | null = null;
  try {
    // Use incoming request headers to resolve the correct session
    session = await auth.api.getSession({
      headers: request.headers as Headers,
    });
    const userId = session?.user?.id;

    if (userId) {
      const result = await mergeAnonymousCartIntoUserCart(userId);
      // log merge result for debugging (remove this log after troubleshooting)
      try {
        if (!result) {
          console.log(
            `/api/auth/post-login: no guest cart to merge for user ${userId}`,
          );
        } else {
          console.log(
            `/api/auth/post-login: mergedCount=${result.mergedCount} warnings=${JSON.stringify(
              result.warnings,
            )} for user ${userId}`,
          );
        }
      } catch (e) {
        console.warn("Error logging merge result", e);
      }

      const role = (session as Session)?.user?.role as string | undefined;
      if (role === "user") {
        const params = new URLSearchParams();
        if (result?.warnings && result.warnings.length > 0) {
          params.set("cartWarnings", "true");
        }
        targetUrl = params.toString()
          ? `/login-verified?${params.toString()}`
          : `/login-verified`;
      } else {
        if (result?.warnings && result.warnings.length > 0) {
          const params = new URLSearchParams();
          params.set("cartWarnings", "true");
          targetUrl = `/cart?${params.toString()}`;
        } else {
          targetUrl = "/";
        }
      }
    }
  } catch (error) {
    console.error("Fehler beim Post-Login Merge:", error);
    // fallthrough to redirect to default target
  }

  // If we have a user cart, set cartId cookie to point to it so subsequent requests use the user cart
  try {
    const userCart = await prisma.cart.findFirst({
      where: {userId: session?.user?.id},
    });
    if (userCart) {
      const absolute = new URL(targetUrl, request.url);
      const res = NextResponse.redirect(absolute);
      res.cookies.set("cartId", userCart.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
  } catch (e) {
    console.warn("post-login: failed to set user cart cookie", e);
  }

  return NextResponse.redirect(new URL(targetUrl, request.url));
}
