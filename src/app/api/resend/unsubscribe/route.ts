import {NextResponse} from "next/server";
import {getSessionOnce} from "@/lib/session/sessionCache";
import {unsubscribeByUserId} from "@/lib/resend/service";

export async function POST(req: Request) {
  try {
    const session = await getSessionOnce({headers: req.headers});
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        {success: false, message: "Nicht eingeloggt."},
        {status: 401},
      );
    }

    const result = await unsubscribeByUserId(userId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in resend unsubscribe-by-session route:", err);
    return NextResponse.json(
      {success: false, message: "Serverfehler."},
      {status: 500},
    );
  }
}
