import React from "react";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

const BlogPage = () => {
  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <Breadcrumbs
        items={[
          {label: "Home", href: "/"},
          {label: "Blog", href: "/blog", active: true},
        ]}
      />

      <div aria-label="Blog-Übersicht" className="my-10">
        <h1 className="text-3xl font-semibold mb-6">Unser Blog</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <h2 className="text-xl font-bold">
                August Update — Neue Produktlinie
              </h2>
              <p className="text-sm text-foreground/60">
                Veröffentlicht: August
              </p>
            </header>
            <p className="text-sm">
              Wir präsentieren unsere neue Produktlinie für Katzen: ergonomische
              Kratzbäume, hypoallergene Futtersorten und umweltfreundliches
              Spielzeug. Ideal für aktive Samtpfoten.
            </p>
          </article>

          <article className="bg-background/50 border border-foreground/10 rounded-md p-6">
            <header className="mb-3">
              <h2 className="text-xl font-bold">
                September News — Tipps zur Fellpflege
              </h2>
              <p className="text-sm text-foreground/60">
                Veröffentlicht: September
              </p>
            </header>
            <p className="text-sm">
              Im September dreht sich alles um Fellpflege: welche Bürsten passen
              zu welchem Felltyp, und wie du spielerisch das Bürsten zur Routine
              machst.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
};

export default BlogPage;
