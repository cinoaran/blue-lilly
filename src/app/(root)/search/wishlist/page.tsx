import WishlistGridClient from "@/components/wishlist/WishlistGridClient";
import Breadcrumbs from "@/components/shared/beardcrumbs/Breadcrumbs";

export default function WishlistPage() {
  const breadcrumbs = [
    {label: "Products", href: "/"},
    {label: "Meine Wunschliste", href: "/search/wishlist"},
  ];

  return (
    <main className="container relative mx-auto max-w-[85vw]">
      <div className="flex items-center justify-start mb-10">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex flex-col items-center justify-center gap-4 mb-4 bg-background/10 p-4 rounded-md">
        <h3 className="w-full text-left font-thin text-4xl p-6 text-foreground">
          Meine Wunschliste
        </h3>

        <WishlistGridClient />
      </div>
    </main>
  );
}
