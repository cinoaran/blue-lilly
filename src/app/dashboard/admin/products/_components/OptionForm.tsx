"use client";
import {UseFormReturn, useWatch} from "react-hook-form";
import type {ProductFormData} from "@/types/product/productFormData";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {CircleMinus, PlusCircle} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useRef, useState, useCallback, useEffect} from "react";
import Image from "next/image";
import {useMemo} from "react";

export default function OptionForm({
  form,
  variantIndex,
  optionIndex,
  remove,
}: {
  form: UseFormReturn<ProductFormData>;
  variantIndex: number;
  optionIndex: number;
  remove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = (useWatch({
    control: form.control,
    name: `variants.${variantIndex}.options.${optionIndex}.image`,
  }) ?? []) as string[];

  const color = (useWatch({
    control: form.control,
    name: `variants.${variantIndex}.options.${optionIndex}.color`,
  }) ?? "") as string;

  const sku = (useWatch({
    control: form.control,
    name: `variants.${variantIndex}.options.${optionIndex}.sku`,
  }) ?? "") as string;

  const [skuTouched, setSkuTouched] = useState(false);
  const [isImageEmpty, setIsImageEmpty] = useState(images.length === 0);
  const [showReusePanel, setShowReusePanel] = useState(false);

  const getImageKey = useCallback((img: string, idx: number) => {
    return `${img.slice(-20)}${idx}`;
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const previews = await Promise.all(
      fileArray.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    );

    form.setValue(
      `variants.${variantIndex}.options.${optionIndex}.image`,
      [...images, ...previews],
      {shouldDirty: true, shouldValidate: true},
    );
    setIsImageEmpty(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (imgIdx: number) => {
    const newImages = images.filter((_, i) => i !== imgIdx);
    form.setValue(
      `variants.${variantIndex}.options.${optionIndex}.image`,
      newImages,
      {shouldDirty: true, shouldValidate: true},
    );
    setIsImageEmpty(newImages.length === 0);
  };

  const addExistingImage = (img: string) => {
    if (!img) return;
    // avoid duplicates
    if (images.includes(img)) {
      // Image already present in this option — ignore duplicate add
      return;
    }
    form.setValue(
      `variants.${variantIndex}.options.${optionIndex}.image`,
      [...images, img],
      {shouldDirty: true, shouldValidate: true},
    );
    setIsImageEmpty(false);
  };

  type GroupedImage = {
    src: string;
    variantIndex: number;
    optionIndex: number;
  };

  type ImageGroup = {
    label: string;
    items: GroupedImage[];
  };

  const otherImages = useMemo((): ImageGroup[] => {
    try {
      const variants = form.getValues("variants") as
        | ProductFormData["variants"]
        | undefined;
      if (!variants) return [];

      const groupsMap = new Map<string, Map<string, GroupedImage>>();

      variants.forEach((v, vIdx) => {
        (v.options || []).forEach((opt, oIdx) => {
          if (vIdx === variantIndex && oIdx === optionIndex) return;
          const label = `Size ${v.size || v.id} — Option ${oIdx + 1}`;
          const inner = groupsMap.get(label) ?? new Map<string, GroupedImage>();
          (opt.image || []).forEach((img) => {
            if (typeof img === "string" && img.length > 0) {
              if (!inner.has(img)) {
                inner.set(img, {
                  src: img,
                  variantIndex: vIdx,
                  optionIndex: oIdx,
                });
              }
            }
          });
          if (inner.size > 0) groupsMap.set(label, inner);
        });
      });

      const groups: ImageGroup[] = [];
      groupsMap.forEach((map, label) => {
        groups.push({label, items: Array.from(map.values())});
      });
      return groups;
    } catch (e: unknown) {
      console.error("Error while fetching other images:", e);
      return [];
    }
  }, [form, variantIndex, optionIndex]);

  const normalizeForSku = (s: string) => {
    if (!s) return "";
    const noDiacritics = s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    return noDiacritics
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
      .toUpperCase();
  };

  const generateSku = (
    productSlug: string | undefined,
    variantSize: string | undefined,
    colorStr: string | undefined,
    optIndex: number,
  ) => {
    const parts: string[] = [];
    if (productSlug) parts.push(normalizeForSku(productSlug));
    if (variantSize) parts.push(normalizeForSku(variantSize));
    if (colorStr) parts.push(normalizeForSku(colorStr));
    parts.push(String(optIndex + 1).padStart(2, "0"));
    return parts.join("-");
  };

  useEffect(() => {
    try {
      if (skuTouched) return;
      if (sku && sku.trim().length > 0) return;
      const productSlug = form.getValues("slug");
      const variantSize = form.getValues(`variants.${variantIndex}.size`);
      const gen = generateSku(productSlug, variantSize, color, optionIndex);
      if (gen) {
        form.setValue(
          `variants.${variantIndex}.options.${optionIndex}.sku`,
          gen,
          {shouldDirty: true, shouldValidate: true},
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("SKU generation failed", msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, variantIndex, optionIndex, form, skuTouched]);

  return (
    <div className="flex flex-wrap gap-2 mb-2 border rounded p-2">
      <div className="w-full flex flex-col lg:flex-row items-center gap-10">
        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.color`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.color
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Color
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="text"
                  placeholder="Color"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.sku`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.sku
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                SKU
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="text"
                  placeholder="SKU (editable)"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    setSkuTouched(true);
                    field.onChange(e.target.value);
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.entryPrice`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.entryPrice
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Entry Price
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Entry Price"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.sellPrice`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.sellPrice
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Sell Price
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Sell Price"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.taxPercentage`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.taxPercentage
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Tax Percentage
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Tax Percentage"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="w-full flex justify-between items-center gap-10">
        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.quantity`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.quantity
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Quantity
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Quantity"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.stockLevel`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.stockLevel
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Stock Level
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Stock Level"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`variants.${variantIndex}.options.${optionIndex}.weight`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[variantIndex]?.options?.[
                    optionIndex
                  ]?.weight
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Weight
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  type="number"
                  placeholder="Weight"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  className="w-full border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="font-semibold">Option Images</label>
        <div className="flex gap-2 flex-wrap">
          {images &&
            images.length > 0 &&
            images.map((img: string, idx: number) => (
              <div key={getImageKey(img, idx)} className="relative group">
                <Image
                  src={img}
                  alt={`Option Image ${idx + 1}`}
                  width={80}
                  height={80}
                  className="rounded border object-cover"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 py-0.5 text-xs opacity-80 hover:opacity-100"
                  onClick={() => handleRemoveImage(idx)}
                  title="Bild entfernen"
                >
                  ×
                </button>
              </div>
            ))}

          <FormField
            control={form.control}
            name={`variants.${variantIndex}.options.${optionIndex}.image`}
            render={() => (
              <FormItem className="py-3 w-full">
                <FormLabel
                  className={`font-thin text-[0.6rem] md:text-lg ${
                    isImageEmpty ? "text-destructive" : "text-foreground"
                  }`}
                >
                  Images (at least one!!)
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        className="flex items-center gap-5 text-sm md:text-md bg-primary-foreground/20 hover:bg-primary-foreground/30"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Bilder hochladen <PlusCircle className="size-4 ml-2" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2 text-sm md:text-md"
                        onClick={() => setShowReusePanel((s) => !s)}
                      >
                        Use existing
                      </Button>
                    </div>

                    {showReusePanel && (
                      <div className="mt-2 p-2 border rounded bg-muted/10 max-w-full overflow-auto">
                        <p className="text-xs mb-2 text-muted-foreground">
                          Other images (click to add)
                        </p>
                        {otherImages && otherImages.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {otherImages.map((group) => (
                              <div key={group.label} className="">
                                <div className="text-xs font-semibold text-muted-foreground mb-1">
                                  {group.label}
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {group.items.map((it, i) => (
                                    <button
                                      key={it.src + String(i)}
                                      type="button"
                                      onClick={() => addExistingImage(it.src)}
                                      className="relative"
                                      title={`Add image from ${group.label}`}
                                    >
                                      {it.src.startsWith("data:") ? (
                                        // use plain img for data URLs to avoid next/image optimization issues
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={it.src}
                                          alt={`existing-${i}`}
                                          width={60}
                                          height={60}
                                          className="rounded border object-cover"
                                        />
                                      ) : (
                                        <Image
                                          src={it.src}
                                          alt={`existing-${i}`}
                                          width={60}
                                          height={60}
                                          className="rounded border object-cover"
                                        />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No existing uploaded images found for other options.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grow" />

      <div className="flex items-end">
        <Button
          type="button"
          variant="destructive"
          onClick={remove}
          disabled={form.formState.isSubmitting}
        >
          Remove Option <CircleMinus className="size-4 m-2" />
        </Button>
      </div>
    </div>
  );
}
