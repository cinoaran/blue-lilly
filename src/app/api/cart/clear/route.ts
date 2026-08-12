import {NextResponse} from "next/server";

async function clearCartResponse() {
  try {
    const res = NextResponse.json({ok: true});
    // delete cookie via response cookies to ensure Set-Cookie header is sent
    res.cookies.delete("cartId");
    return res;
  } catch (err) {
    console.error("/api/cart/clear failed:", err);
    return NextResponse.json({ok: false}, {status: 500});
  }
}

export async function GET() {
  return clearCartResponse();
}

export async function POST() {
  return clearCartResponse();
}
