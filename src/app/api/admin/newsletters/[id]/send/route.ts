import {NextRequest, NextResponse} from "next/server";
import {ensureAndRequire} from "@/acl/acl";
import {sendNewsletterCampaign} from "@/lib/resend/campaign-services";

// Context is provided by Next; typing it as `any` keeps the handler compatible with the
// generated route types. We rely on a typed `isPromise` guard below to safely handle params.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: NextRequest, context: any) {
  try {
    // Ensure admin
    await ensureAndRequire({headers: request.headers}, "admin:access");

    const params = context.params;
    function isPromise<T>(v: unknown): v is Promise<T> {
      return !!v && typeof (v as {then?: unknown}).then === "function";
    }
    const resolved = isPromise<{id: string}>(params) ? await params : params;
    const {id} = resolved as {id: string};

    const result = await sendNewsletterCampaign(id);

    return NextResponse.json({
      success: true,
      broadcastId: result.broadcastId,
      campaign: result.campaign,
    });
  } catch (error) {
    console.error("Newsletter-Versand fehlgeschlagen:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Newsletter konnte nicht versendet werden",
      },
      {status: 500},
    );
  }
}
