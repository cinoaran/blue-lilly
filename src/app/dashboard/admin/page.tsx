import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {Badge} from "@/components/ui/badge";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export default async function AdminDashboardPage() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    // Not authorized for admin dashboard
    redirect("/");
  }
  // Redirect to the admin default subpage
  /*  redirect(`/dashboard/admin`); */

  // Beispiel‑Daten (später durch API / DB ersetzen)
  async function getDashboardStats() {
    const orders = 182;
    const revenue = 24570.99; // Gesamtumsatz
    const sessions = 1230; // Gesamt‑Sessions
    const cartAbandonments = 320; // Abgebrochene Carts

    return {
      revenue: revenue,
      avgOrderValue: revenue / orders, // Umsatz ÷ Bestellungen
      conversionRate: (orders / sessions) * 100, // Bestellungen ÷ Sessions
      cartAbandonmentRate: (cartAbandonments / sessions) * 100,
    };
  }

  const stats = await getDashboardStats();

  return (
    <div className="p-4 space-y-6 md:p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Karte 1: Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue (Umsatz)
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  Summe aller Bestellwerte (Umsatz) in diesem Zeitraum.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Karte 2: Average Order Value (AOV) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AOV</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  Umsatz geteilt durch Anzahl Bestellungen.
                  <br />
                  Formel: Revenue ÷ Orders
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgOrderValue.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Karte 3: Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  Anteil der Sessions, die zu einer Bestellung führen.
                  <br />
                  Formel: (Orders ÷ Sessions) × 100
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.conversionRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        {/* Karte 4: Cart Abandonment Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cart Abandonment
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    ?
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm">
                  Anteil der Sessions mit Warenkorb, bei denen keine Bestellung
                  abgeschlossen wird.
                  <br />
                  Formel: (Cart‑Abandonments ÷ Sessions) × 100
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.cartAbandonmentRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
