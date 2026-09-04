import {NextRequest, NextResponse} from "next/server";
import {ensureAndRequire} from "@/acl/acl";
import {updateNewsletterCampaign} from "@/lib/resend-newsletter/campaign-services";

export async function PATCH(request: NextRequest, context: any) {
  try {
    await ensureAndRequire(undefined, "admin:access");
    const params = context?.params;
    const resolvedParams = params && typeof params.then === "function" ? await params : params;
    const id = resolvedParams?.id;
    const body = await request.json();

    const input: any = {};
    if (typeof body.name === "string") input.name = body.name;
    if (typeof body.subject === "string") input.subject = body.subject;
    if (typeof body.html === "string") input.html = body.html;
    if (typeof body.text === "string") input.text = body.text;

    const updated = await updateNewsletterCampaign(id, input);

    return NextResponse.json({success: true, campaign: updated});
  } catch (error) {
    console.error("update newsletter failed", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Serverfehler"},
      {status: 500},
    );
  }
}
