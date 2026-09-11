// app/checkout/success/page.tsx
import {stripe} from "@/lib/Stripe/client";
import prisma from "@/lib/prisma";
import {convertDecimalToNumber} from "@/helpers";
import Image from "next/image";
import ClearCartClient from "../_components/ClearCartClient";
import Link from "next/link";

type Props = {
  searchParams: Promise<{session_id?: string; orderId?: string}>;
};

export default async function SuccessPage({searchParams}: Props) {
  const {session_id, orderId: queryOrderId} = await searchParams;

  // resolve session id: prefer explicit session_id, otherwise resolve via provided orderId -> order.stripeSessionId
  let resolvedSessionId = session_id;
  if (!resolvedSessionId && queryOrderId) {
    const maybeOrder = await prisma.order.findUnique({
      where: {id: queryOrderId},
      select: {stripeSessionId: true},
    });
    resolvedSessionId = maybeOrder?.stripeSessionId ?? undefined;
  }

  if (!resolvedSessionId) {
    return <div>Ungültige Session.</div>;
  }

  const session = await stripe.checkout.sessions.retrieve(resolvedSessionId);
  // Try to read orderId from Stripe session metadata (set during order creation)
  const orderId = session.metadata?.orderId as string | undefined;

  let order = null;
  if (orderId) {
    const raw = await prisma.order.findUnique({
      where: {id: orderId},
      include: {
        items: {
          include: {
            option: {
              include: {
                variant: {include: {product: true}},
              },
            },
          },
        },
      },
    });
    order = raw ? (convertDecimalToNumber(raw) as typeof raw) : null;
  }

  // If some items lack a snapshot image and the Option wasn't included or has no image,
  // fetch those Options in a single batch as a fallback so we can still show images.
  const fallbackOptionImages: Record<string, string | undefined> = {};
  if (order?.items && order.items.length) {
    const missingOptionIds = Array.from(
      new Set(
        order.items
          .filter(
            (it) =>
              !it.imageAtOrder &&
              !(it.option?.image && it.option.image.length) &&
              it.optionId,
          )
          .map((it) => it.optionId as string),
      ),
    );

    if (missingOptionIds.length) {
      const opts = await prisma.option.findMany({
        where: {id: {in: missingOptionIds}},
        select: {id: true, image: true},
      });
      for (const o of opts) {
        fallbackOptionImages[o.id] = o.image?.[0] ?? undefined;
      }
    }
  }

  // cookie clearing is done client-side by calling the route `/api/cart/clear`

  return (
    <div className="container mx-auto w-[80%] bg-card/80 border-[0.3px] border-border rounded-md my-12 p-12">
      <ClearCartClient />
      <h1 className="text-4xl font-bold py-10">
        Danke für deine Bestellung
        {session.customer_details?.name
          ? `, ${session.customer_details.name}`
          : ""}
      </h1>
      <p>Status: {session.status}</p>
      <p>Zahlungsstatus: {session.payment_status}</p>

      {order ? (
        <div className="flex flex-col lg:flex-row items-start justify-start gap-5 md:gap-12 mt-6 space-y-12">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">Bestellübersicht</h3>
            <ul>
              {order.items.map((it) => {
                const img =
                  it.imageAtOrder ??
                  it.option?.image?.[0] ??
                  (it.optionId
                    ? (fallbackOptionImages[it.optionId] ?? null)
                    : null);
                const title =
                  it.option?.variant?.product?.name ??
                  it.option?.variant?.size ??
                  "Artikel";
                return (
                  <li
                    key={it.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    {img ? (
                      // plain img is fine here; replace with next/image if desired
                      // ensure image URL is trusted / proxied if needed
                      // width/height omitted to keep it simple
                      <Image
                        src={img}
                        alt={title}
                        width={100}
                        height={140}
                        style={{objectFit: "cover"}}
                      />
                    ) : (
                      <div
                        style={{width: 100, height: 140, background: "#eee"}}
                      />
                    )}
                    <div>
                      <div>{title}</div>
                      <div>Menge: {it.quantity}</div>
                      <div>Preis: {(it.priceAtOrder / 100).toFixed(2)} €</div>
                      <div>Währung: {order.currency}</div>
                    </div>
                  </li>
                );
              })}
              <hr className="border-foreground/10" />
              <div className="flex justify-end mt-4">
                <div className="text-lg font-bold">
                  Gesamt: {(order.totalAmount / 100).toFixed(2)} €
                </div>
              </div>
            </ul>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4"> Weitere Informationen</h3>
            <p>Bestellnummer: {order.id}</p>
            <p>
              Ihre Bestellung wird bearbeitet. Wir rechnen mit der Auslieferung
              in den nächsten 2-3 Tagen.
            </p>
            <p>Sie erhalten in Kürze eine Bestätigung per E-Mail.</p>
            <p>Bei Fragen können Sie uns jederzeit kontaktieren.</p>
            <p>Blue Lill`s Support: support@bluelills.com</p>
          </div>
        </div>
      ) : (
        <p>Keine Bestelldaten gefunden.</p>
      )}
      <div className="flex flex-col items-center justify-center w-full mt-5 z-20">
        <ul className="flex items-start justify-center gap-5 md:gap-10 text-foreground hover:underlined">
          <li className="text-center text-md uppercase border-[0.3px] border-foreground/10 underlined hover:border-primary cursor-pointer transition px-3 py-2 w-62">
            <Link href="/">Zurück zum Shop</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
