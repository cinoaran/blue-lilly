import {NextResponse} from "next/server";
import {getCart} from "@/app/(root)/cart/actions/getCarts";
import {convertDecimalToNumber} from "@/helpers";

export async function GET(req: Request) {
  try {
    const cart = await getCart();
    if (!cart) return NextResponse.json({cart: null});

    // Convert Decimals and Dates to primitives for JSON
    const serializable = convertDecimalToNumber(cart) as unknown;
    return NextResponse.json({cart: serializable});
  } catch (e) {
    console.error("/api/debug/cart error", e);
    return NextResponse.json({error: String(e)}, {status: 500});
  }
}
