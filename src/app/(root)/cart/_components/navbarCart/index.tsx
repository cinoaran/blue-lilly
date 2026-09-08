import {NavbarCartClient} from "./NavbarCartClient";
import {CartSheetContent} from "./CartSheetContent";
import {getCart} from "../../actions/getCarts";

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
