import {NavbarCartClient} from "@/components/cart/NavbarCartClient";
import {CartSheetContent} from "@/components/cart/CartSheetContent";
import {getCart} from "@/actions/cart/getCarts";

export async function NavbarCart() {
  const cart = await getCart();
  const serializableCart = cart
    ? (JSON.parse(JSON.stringify(cart)) as Awaited<ReturnType<typeof getCart>>)
    : null;

  return (
    <NavbarCartClient initialCart={serializableCart}>
      <CartSheetContent initialCart={serializableCart} />
    </NavbarCartClient>
  );
}
