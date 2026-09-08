import React from "react";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";
import NewsletterForm from "@/components/resend-newsletter/NewsletterForm";

export default function ResendNewsletterPage() {
  return (
    <main className="container relative mx-auto max-w-3/4">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Newsletter", href: "/resend-newsletter", active: true},
        ]}
      />

      <div className="my-10">
        <h1 className="text-3xl font-semibold mb-4">Newsletter</h1>
        <p className="text-sm text-foreground/60 mb-6">
          Abonniere unseren Newsletter, um exklusive Angebote, Neuigkeiten und
          Pflegetipps direkt per E‑Mail zu erhalten.
        </p>

        <div className="w-full">
          <NewsletterForm />
        </div>
      </div>
    </main>
  );
}
