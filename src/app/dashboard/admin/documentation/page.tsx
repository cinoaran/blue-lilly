import React from "react";
import Link from "next/link";

export default async function DokumentationPage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">ACL & Session Dokumentation</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">Ziel</h2>
        <p>
          Beschreibe, wie Session‑Validierung, Caching, Rollen und Permissions
          zentral in{" "}
          <Link href="/src/acl/policies.ts">src/acl/policies.ts</Link> und
          <Link href="/src/acl/acl.ts"> src/acl/acl.ts</Link> organisiert sind
          und wie Actions und Pages diese Hilfen verwenden sollten.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">Konzepte</h2>
        <ul className="list-disc pl-6">
          <li>
            <strong>Session</strong>: zentral über `ensureSession(opts)` aus
            <Link href="/src/acl/acl.ts"> src/acl/acl.ts</Link> beziehen. Nutze
            den `headers` oder `req`-Parameter, nicht `auth.api.getSession`
            direkt.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">Kerndateien</h2>
        <ul className="list-disc pl-6">
          <li>
            <Link href="/src/acl/policies.ts">src/acl/policies.ts</Link> — Role
            → Permission Map (single source of truth).
          </li>
          <li>
            <Link href="/src/acl/acl.ts">src/acl/acl.ts</Link> — Helpers:
            `ensureSession`, `requirePermission`, `ensureAndRequire`.
          </li>
          <li>
            <Link href="/src/lib/sessionCache.ts">src/lib/sessionCache.ts</Link>{" "}
            — Short-lived dedupe cache (`getSessionOnce`) used internally.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">How it works (kurz)</h2>
        <ol className="list-decimal pl-6">
          <li>
            Entry‑Point (Server Action / Page / API Route) ruft `ensureSession`
            (oder `ensureAndRequire`) auf.
          </li>
          <li>
            `ensureSession` verwendet intern `getSessionOnce` für kurze Caching
            / dedupe. Nie direkt `getSessionOnce` importieren (außer in lib).
          </li>
          <li>
            `requirePermission(session, permission)` prüft Role→Permissions (Map
            in `policies.ts`) und wirft bei Fehlschlag.
          </li>
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">
          Wie füge ich eine Permission hinzu?
        </h2>
        <p className="mb-2">
          1) Open <code>src/acl/policies.ts</code> und ergänze:
        </p>
        <pre className="bg-black p-3 rounded">{`// example
rolePermissions.merchant.push('product:bulk-approve')
// or add to definition
merchant: ['product:create','product:update','product:delete','product:bulk-approve']`}</pre>
        <p className="mt-2">2) Verteile Permission auf Rollen nach Bedarf.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">Szenarien & Beispiele</h2>

        <h3 className="font-medium mt-2">A — Admin: User verwalten</h3>
        <p>Usecase: Admins dürfen Benutzerrollen und Ban-Status ändern.</p>
        <pre className="bg-black p-3 rounded overflow-auto">{`// Server action entry
const session = await ensureAndRequire({ headers: await headers() }, 'user:manage')
// then call action that updates user.role in DB
await UpdateProfile({...})`}</pre>

        <h3 className="font-medium mt-2">B — Merchant: Produkte verwalten</h3>
        <p>Usecase: Merchant darf eigene Produkte CRUDen.</p>
        <pre className="bg-black p-3 rounded overflow-auto">{`// protect merchant-only page/action
const session = await ensureAndRequire({ headers: await headers() }, 'product:update')
// call product actions
await updateProduct(...)`}</pre>

        <h3 className="font-medium mt-2">
          C — User: eigenes Profil aktualisieren
        </h3>
        <p>Usecase: User kann nur das eigene Profil ändern.</p>
        <pre className="bg-black p-3 rounded overflow-auto">{`// allow owner update
const session = await ensureSession({ headers: await headers() })
if (session.user.id !== targetUserId) throw new Error('Forbidden')
await updateOwnProfile(...)`}</pre>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Tipps</h2>
        <ul className="list-disc pl-6">
          <li>
            Bevorzuge feingranulare Permission Keys: `resource:action:scope`.
          </li>
          <li>
            Admin kann `*` (Wildcard) in `policies.ts` bekommen für alle Rechte.
          </li>
          <li>
            Schreibe Unit‑Tests für `requirePermission` und wichtige Actions.
          </li>
          <li>
            Füge `CONTRIBUTING.md` mit der Import‑Regel und eine ESLint
            `no-restricted-imports` Regel hinzu.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold">DB Queries</h2>
        <code className="bg-black p-3 rounded overflow-auto">{`
        # Backup (Postgres)
            pg_dump $DATABASE_URL > backup_$(date +%F).sql

        # Prisma: client generieren
            npx prisma generate

        # Prisma: Migration erstellen und anwenden (lokal/dev)
            npx prisma migrate dev --name add-category-constraints

        # Optional: nur SQL generieren (ohne anwenden)
            npx prisma migrate dev --create-only --name add-category-constraints`}</code>
      </section>
    </div>
  );
}
