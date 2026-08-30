import dotenv from "dotenv";
// prefer .env.local (used by Next) but fall back to .env
dotenv.config({path: ".env.local"});
dotenv.config();
import React from "react";
import {Resend} from "resend";
import {render} from "@react-email/components";
import {renderToStaticMarkup} from "react-dom/server";
import WelcomeEmail from "../src/emails/newsletter-2026/summer";

const apiKey = process.env.RESEND_030_WEB_API_KEY || process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error(
    "RESEND API key not found in env (RESEND_030_WEB_API_KEY or RESEND_API_KEY)",
  );
  process.exit(1);
}

const resend = new Resend(apiKey);

const to =
  process.argv[2] ||
  process.env.TEST_NEWSLETTER_RECIPIENT ||
  "test+newsletter@beispiel.de";

// Ensure the rendered HTML is a string
const element = WelcomeEmail({
  companyName: "Blue Lilly",
  url: "https://example.com/",
});

(async () => {
  try {
    const maybeHtml =
      typeof render === "function"
        ? render(element)
        : renderToStaticMarkup(element);
    const html = maybeHtml instanceof Promise ? await maybeHtml : maybeHtml;

    console.log("DEBUG html type:", typeof html);
    if (typeof html === "string") {
      console.log("DEBUG html sample:", html.slice(0, 200));
    } else {
      console.log("DEBUG html is not a string; value:", html);
    }

    const res = await resend.emails.send({
      from: `Blue Lilly <newsletter@030web.com>`,
      to,
      subject: "Test: Summer Newsletter",
      html,
    });
    console.log("Resend response:", res);
  } catch (err) {
    console.error("Resend send error:", err);
    process.exit(1);
  }
})();
