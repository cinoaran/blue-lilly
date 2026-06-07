export function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "") // entfernt Sonderzeichen
    .replace(/\s+/g, "-") // ersetzt Leerzeichen durch Bindestriche
    .replace(/-+/g, "-") // mehrere Bindestriche zu einem
    .replace(/^-+|-+$/g, ""); // entfernt führende/trailing Bindestriche
}

/**
 * Erzeugt eine SKU aus Produktname, Größe, Farbe und Option-ID.
 * Beispiel: Nike overflow XXX, 45, marine, 123abc → nike-overflow-xxx-eu-45-marine-123abc
 */
export function createSkuFromSkuname(
  sku: string,
  size: string,
  color: string,
): string {
  const slugify = (val: string) =>
    val
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  return [slugify(sku), `eu-${size}`, slugify(color)].join("-");
}
