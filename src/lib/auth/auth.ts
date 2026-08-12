import {betterAuth, BetterAuthOptions} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "../prisma";

import {admin, openAPI} from "better-auth/plugins";
import {verifyEmail} from "@/actions/emails/verifyEmail";
import {PasswordReset} from "@/actions/emails/passwordReset";
import {nextCookies} from "better-auth/next-js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!, // e.g., "http://localhost:3000"

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  plugins: [nextCookies(), openAPI(), admin()], // api/auth/reference
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    // BUG: Prob a bug with updateAge method. It throws an error - Argument `where` of type SessionWhereUniqueInput needs at least one of `id` arguments.
    // As a workaround, set updateAge to a large value for now.
    updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session expiration is updated)
  },
  user: {
    additionalFields: {
      role: {type: "string", required: true, defaultValue: "user"},
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({user, url}) => {
      const sendResetPasswordUrl = url;
      // Do not log sensitive reset URLs or tokens in production.

      await PasswordReset({
        username: user.name,
        from: "no-reply@030web.com",
        to: user.email,
        subject: "Reset your password",
        verificationUrl: sendResetPasswordUrl,
      });
      if (url) {
        console.log("Password reset email sent:", url);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({user, token}) => {
      const sendVerificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      await verifyEmail({
        username: user.name,
        from: "no-reply@030web.com",
        to: user.email,
        subject: "Verify your email address",
        verificationUrl: sendVerificationUrl,
      });
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
