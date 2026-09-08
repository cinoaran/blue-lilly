import {NextRequest, NextResponse} from "next/server";
import {ensureAndRequire} from "@/acl/acl";
import {updateNewsletterCampaign} from "@/lib/resend/campaign-services";

type UpdateCampaignInput = {
  name?: string;
  subject?: string;
  html?: string;
  text?: string;
};

// Context is provided by Next; typing it as `any` keeps the handler compatible with the
// generated route types. We rely on a typed `isPromise` guard below to safely handle params.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(request: NextRequest, context: any) {
  try {
    await ensureAndRequire(undefined, "admin:access");
    const params = context?.params;
    function isPromise<T>(v: unknown): v is Promise<T> {
      return !!v && typeof (v as {then?: unknown}).then === "function";
    }
    const resolvedParams = isPromise<{id?: string}>(params)
      ? await params
      : params;
    const id = resolvedParams?.id;
    const body = (await request.json()) as Record<string, unknown>;

    const input: UpdateCampaignInput = {};
    if (typeof body.name === "string") input.name = body.name;
    if (typeof body.subject === "string") input.subject = body.subject;
    if (typeof body.html === "string") input.html = body.html;
    if (typeof body.text === "string") input.text = body.text;

    if (!id) {
      return NextResponse.json({error: "Invalid id"}, {status: 400});
    }

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
