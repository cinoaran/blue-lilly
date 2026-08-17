// lib/resend.ts
import {Resend} from "resend";
export const resend = new Resend(process.env.RESEND_030_WEB_API_KEY);
