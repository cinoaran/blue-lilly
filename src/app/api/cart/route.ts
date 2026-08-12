import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {convertDecimalToNumber} from "@/helpers";

function parseCookies(cookieHeader: string | null) {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...v] = part.split("=");
    if (!k) continue;
    map[k.trim()] = decodeURIComponent((v || []).join("=").trim());
  }
  return map;
}

export async function GET(req: Request) {
  try {
    const headers = req.headers;
    const headerObj = Object.fromEntries(headers.entries()) as Record<
      string,
      string
    >;

    const session = await auth.api.getSession({headers: headerObj});
    const userId = session?.user?.id ?? null;

    const cookieHeader = req.headers.get("cookie") ?? null;
    const cookies = parseCookies(cookieHeader);
    const cartId = cookies["cartId"] ?? null;

    const include = {
      items: {
        include: {
          option: {
            include: {
              variant: {include: {product: true}},
            },
          },
        },
      },
    } as const;

    let cart = null;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: {userId, status: "ACTIVE"},
        include,
      });
    }

    if (!cart && cartId) {
      const guest = await prisma.cart.findUnique({
        where: {id: cartId},
        include,
      });
      if (guest?.status === "ACTIVE") cart = guest;
    }

    const serializable = cart ? convertDecimalToNumber(cart) : null;
    return NextResponse.json({cart: serializable});
  } catch (err) {
    console.error("/api/cart error:", err);
    return NextResponse.json({cart: null}, {status: 500});
  }
}
