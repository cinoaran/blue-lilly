import {NextResponse} from "next/server";
import {ensureAndRequire} from "@/acl/acl";
import {sendNewsletterCampaign} from "@/lib/resend-newsletter/campaign-services";

type RouteContext = {
  params: Promise<{id: string}>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    // Ensure admin
    await ensureAndRequire({headers: (request as any).headers}, "admin:access");

    const {id} = await context.params;

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
