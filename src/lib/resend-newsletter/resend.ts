import "server-only";

import {Resend} from "resend";

const apiKey = process.env.RESEND_030_WEB_API_KEY || process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error(
    "RESEND_030_WEB_API_KEY oder RESEND_API_KEY ist nicht gesetzt",
  );
}

export const resend = new Resend(apiKey);
