import React from "react";

export const metadata = {
  title: "Warenkorb",
};

export default function CartLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="container mx-auto px-2 md:px-0 py-8">
      <div className="">{children}</div>
    </div>
  );
}
