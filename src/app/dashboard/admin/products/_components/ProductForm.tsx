"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {uploadFiles} from "@/uploadthing/uploadthing";
import {dataUrlToFile} from "@/helpers/products/dataUrlToFile";
import {useForm, useFieldArray, FieldValues, Resolver} from "react-hook-form";
import VariantForm from "../_components/VariantForm";
import {Merchant, ProductFormData} from "@/types/product/productFormData"; // Passe an
import {ProductSchema} from "@/zod-schemas/products/ProductShema"; // Zod-Schema für Validation
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useRef, useState} from "react";
import {Textarea} from "@/components/ui/textarea";
import {createSlugFromName} from "@/helpers/products/slug-creator";
import FormError from "@/components/shared/authComponent/FormError";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import Spinner from "@/components/Loader/Spinner";
import {upsertProduct} from "../actions/upsertProduct"; // Neue Action: add/update
import {PlusCircle} from "lucide-react";
import ProductDescriptionEditor from "@/components/TipTap/ProductDescriptionEditor";

type Mode = "add" | "edit";

interface ProductFormProps {
  categories: {
    id: string;
    name: string;
    sizes?: string[];
    parentId?: string | null;
  }[]; // ← sizes!
  merchants: Merchant[];
  product?: ProductFormData;
  mode: Mode;
}

export default function ProductForm({
  categories,
  merchants,
  product,
  mode,
}: ProductFormProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  const slugManuallyEdited = useRef(false);
  const fieldClass =
    "w-full border-b-[0.3px] border-border focus-visible:underlined py-6 text-[0.6rem] md:text-lg";

  // Helper: Prisma → FormData (Decimals fixen)
  const mapPrismaToFormData = (
    prismaProduct: ProductFormData,
  ): ProductFormData => ({
    ...prismaProduct,
    variants: prismaProduct.variants.map((v) => ({
      ...v,
      options: v.options.map((o) => ({
        ...o,
        entryPrice: Number(o.entryPrice), // Decimal.toNumber() oder .toString()
        sellPrice: Number(o.sellPrice),
        taxPercentage: Number(o.taxPercentage),
        // Bestehende Images als dataUrls vorladen (optional, für Preview)
        image: o.image || [], // URLs → dataUrls via fetch, falls nötig
      })),
    })),
  });

  const defaultValues: Partial<ProductFormData> = product
    ? mapPrismaToFormData(product)
    : {
        id: crypto.randomUUID(),
        merchantId: "",
        name: "",
        smallDesc: "",
        longDesc: "",
        isActive: false,
        isFeatured: false,
        brand: "",
        subcategory: "",
        slug: "",
        categoryId: "",
        variants: [
          {
            id: crypto.randomUUID(),
            size: "",
            units: "",
            options: [
              {
                id: crypto.randomUUID(),
                baseColor: "",
                displayColor: "",
                sellPrice: 0,
                entryPrice: 0,
                taxPercentage: 0,
                quantity: 0,
                image: [],
                weight: 0,
                sku: "",
              },
            ],
          },
        ],
      };

  const form = useForm<ProductFormData>({
    // zodResolver returns a Resolver typed to the Zod schema shape — cast to
    // the concrete ProductFormData so react-hook-form's generics remain
    // consistent across this component.
    resolver: zodResolver(ProductSchema) as unknown as Resolver<
      ProductFormData,
      unknown,
      ProductFormData
    >,
    mode: "onChange",
    defaultValues,
    reValidateMode: "onChange",
  });

  // Innerhalb Component:
  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      slugManuallyEdited.current = false;
      form.setValue("slug", createSlugFromName(form.getValues("name") || ""));
    } else {
      slugManuallyEdited.current = true;
      form.setValue("slug", value, {shouldValidate: true, shouldDirty: true});
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsPending(true);
    setError(undefined);
    setSuccess(undefined);

    // Uploads: collect all data URLs across options, upload unique ones once, then map back
    // gather all unique data URLs in the product
    const allDataUrls: string[] = [];
    data.variants.forEach((v) =>
      v.options.forEach((o) =>
        (o.image || [])
          .filter(
            (img): img is string => typeof img === "string" && img.length > 0,
          )
          .forEach((img) => {
            if (img.startsWith("data:image/") && img.includes(";base64,")) {
              allDataUrls.push(img);
            }
          }),
      ),
    );

    const uniqueDataUrls = Array.from(new Set(allDataUrls));
    const dataUrlToUploaded = new Map<string, string>();

    if (uniqueDataUrls.length > 0) {
      const files = uniqueDataUrls.map((dataUrl, i) =>
        dataUrlToFile(dataUrl, `product-image-${Date.now()}-${i}.webp`),
      );
      // Safety: only keep files for true data URLs
      const safeFiles = files.filter(
        (_, i) =>
          !!uniqueDataUrls[i] && uniqueDataUrls[i].startsWith("data:image/"),
      );
      if (safeFiles.length > 0) {
        const MAX_BATCH = 5; // matches profilePicture.maxFileCount in uploadthing config
        for (let i = 0; i < safeFiles.length; i += MAX_BATCH) {
          const batch = safeFiles.slice(i, i + MAX_BATCH);
          const batchKeys = uniqueDataUrls.slice(i, i + MAX_BATCH);
          try {
            const uploadResult = (await uploadFiles("profilePicture", {
              files: batch,
            })) as Array<{ufsUrl: string}>;

            uploadResult.forEach((r: {ufsUrl: string}, j: number) => {
              const key = batchKeys[j];
              if (key) dataUrlToUploaded.set(key, r.ufsUrl);
            });
          } catch (err: unknown) {
            console.error("Uploadthing batch upload failed", err);
            throw err;
          }
        }
      }
    }

    const variants = data.variants.map((variant) => ({
      ...variant,
      options: variant.options.map((option) => {
        const imageStrings = (option.image || []).filter(
          (img): img is string => typeof img === "string" && img.length > 0,
        );

        const mapped = imageStrings
          .map((img) => {
            if (img.startsWith("data:image/"))
              return dataUrlToUploaded.get(img);
            return img;
          })
          .filter((u): u is string => typeof u === "string" && u.length > 0);

        const urls = Array.from(new Set(mapped));
        return {...option, image: urls};
      }),
    }));

    const productData: ProductFormData = {...data, variants};

    try {
      const result = await upsertProduct(productData, mode);

      if (result?.success) {
        setSuccess(
          result.message ??
            (mode === "add" ? "Product added!" : "Product updated!"),
        );
        // If server returned the saved product, map it back into the form
        if (result.product) {
          try {
            const mapped = mapPrismaToFormData(
              result.product as unknown as ProductFormData,
            );
            form.reset(mapped);
          } catch (e) {
            console.error("Failed to map server product to form data", e);
            // fallback: reset on add
            if (mode === "add") form.reset();
          }
        } else {
          if (mode === "add") form.reset(); // Bei Add zurücksetzen
        }
      } else {
        // try to parse zod issues if result.error is JSON
        let userMessage = result?.error || "Error occurred.";
        try {
          const parsed = JSON.parse(String(result?.error));
          if (Array.isArray(parsed)) {
            userMessage = parsed
              .map((issue: {path?: string[]; message?: string}) => {
                if (issue.path && Array.isArray(issue.path))
                  return `${issue.path.join(".")} : ${issue.message}`;
                return issue.message || JSON.stringify(issue);
              })
              .join(" | ");
          }
        } catch (e) {
          // not JSON, keep original message
          console.warn("Error message is not JSON, using raw string", e);
          // not JSON — ignore
        }

        setError(userMessage);
      }
    } catch (error) {
      // Error handling wie vorher
      setError(
        "An error occurred." +
          (error instanceof Error ? ` Details: ${error.message}` : ""),
      );
    } finally {
      setIsPending(false);
    }
  };

  const title =
    mode === "edit" && product?.name
      ? `Edit: ${product.name}`
      : "Add New Product";

  return (
    <div className="bg-primary/20 p-10 rounded-lg md:mr-54">
      <h3 className="py-4">{title}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-start flex-wrap gap-5">
            <div className="flex-1">
              {/* Is Featured */}
              <FormField
                control={form.control}
                name="isFeatured"
                render={({field}: {field: FieldValues}) => (
                  <FormItem className="py-3 w-full">
                    <FormLabel
                      className={`font-thin text-[0.6rem] md:text-lg ${
                        form.formState.errors.isFeatured
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      Is Featured
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPending}
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue
                            placeholder="Is Featured"
                            defaultValue={field.value ? "true" : "false"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({field}: {field: FieldValues}) => (
                  <FormItem className="py-3 w-full">
                    <FormLabel
                      className={`font-thin text-[0.6rem] md:text-lg ${
                        form.formState.errors.isActive
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      Is Active
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPending}
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue
                            placeholder="Is Active"
                            defaultValue={field.value ? "true" : "false"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Is active</SelectItem>
                          <SelectItem value="false">Not active</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              {/* Merchant */}
              <FormField
                control={form.control}
                name="merchantId"
                render={({field}: {field: FieldValues}) => (
                  <FormItem className="py-3 w-full">
                    <FormLabel
                      className={`font-thin text-[0.6rem] md:text-lg ${
                        form.formState.errors.merchantId
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      Merchant
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPending}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue
                            placeholder="Merchant"
                            defaultValue={field.value}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.map((merchant) => (
                            <SelectItem key={merchant.id} value={merchant.id}>
                              {merchant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({field}) => (
                  <FormItem className="py-3 w-full">
                    <FormLabel className="font-thin text-[0.6rem] md:text-lg">
                      Category
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isPending}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={fieldClass}>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            // Build parent -> children groups
                            (() => {
                              const map = new Map<
                                string,
                                (typeof categories)[0]
                              >();
                              categories.forEach((c) => map.set(c.id, c));

                              const roots = categories.filter(
                                (c) => !c.parentId,
                              );

                              return (
                                <>
                                  {roots.map((parent) => {
                                    const children = categories.filter(
                                      (c) => c.parentId === parent.id,
                                    );

                                    if (children.length > 0) {
                                      return (
                                        <SelectGroup key={parent.id}>
                                          <SelectLabel>
                                            {parent.name}
                                          </SelectLabel>
                                          {children.map((child) => (
                                            <SelectItem
                                              key={child.id}
                                              value={child.id}
                                            >
                                              {`${parent.name} › ${child.name}`}
                                              {child.sizes?.length && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  ({child.sizes.length} Größen)
                                                </span>
                                              )}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      );
                                    }

                                    // no children -> render parent as selectable
                                    return (
                                      <SelectItem
                                        key={parent.id}
                                        value={parent.id}
                                      >
                                        {parent.name}
                                        {parent.sizes?.length && (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            ({parent.sizes.length} Größen)
                                          </span>
                                        )}
                                      </SelectItem>
                                    );
                                  })}
                                </>
                              );
                            })()
                          }
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex items-start flex-col md:flex-row gap-5">
            {/* Brand */}
            <FormField
              control={form.control}
              name="brand"
              render={({field}: {field: FieldValues}) => (
                <FormItem className="py-3 w-full">
                  <FormLabel
                    className={`h-5 font-thin text-sm md:text-lg ${
                      form.formState.errors.brand
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    Brand
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      placeholder="Brand"
                      {...field}
                      className={fieldClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Product name */}
            <FormField
              control={form.control}
              name="name"
              render={({field}: {field: FieldValues}) => (
                <FormItem className="py-3 w-full">
                  <FormLabel
                    className={`h-5 font-thin text-sm md:text-lg ${
                      form.formState.errors.name
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      onChange={(e) => {
                        field.onChange(e); // RHF-Update
                        if (!slugManuallyEdited.current) {
                          form.setValue(
                            "slug",
                            createSlugFromName(e.target.value),
                          );
                        }
                      }}
                      value={field.value}
                      placeholder="Product name"
                      className={fieldClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({field}: {field: FieldValues}) => (
                <FormItem className="py-3 w-full">
                  <FormLabel
                    className={`h-5 font-thin text-sm md:text-lg ${
                      form.formState.errors.slug
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    Slug
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      onChange={handleSlugChange}
                      value={field.value}
                      placeholder="Slug"
                      className={fieldClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subcategory */}
            <FormField
              control={form.control}
              name="subcategory"
              render={({field}: {field: FieldValues}) => (
                <FormItem className="py-3 w-full">
                  <FormLabel
                    className={`h-5 font-thin text-sm md:text-lg ${
                      form.formState.errors.subcategory
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    Subcategory
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="text"
                      placeholder="Subcategory"
                      {...field}
                      className={fieldClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* SMALL Description */}
          <FormField
            control={form.control}
            name="smallDesc"
            render={({field}: {field: FieldValues}) => (
              <FormItem className="py-3 w-full">
                <FormLabel
                  className={`h-5 font-thin text-sm md:text-lg ${
                    form.formState.errors.smallDesc
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  Small Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isPending}
                    name="smallDesc"
                    placeholder="Small Description"
                    {...field}
                    className={fieldClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longDesc"
            render={({field}) => (
              <FormItem className="py-3 w-full">
                <FormLabel>Long Description</FormLabel>
                <FormControl>
                  <ProductDescriptionEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending} // Dein bestehender State
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            className="bg-success hover:bg-primary-foreground/20 text-primary-foreground w-fit md:w-1/5 h-9 text-sm md:text-lg"
            onClick={() =>
              append({
                id: crypto.randomUUID(),
                size: "",
                units: "",
                options: [
                  {
                    id: crypto.randomUUID(),
                    entryPrice: 0,
                    sellPrice: 0,
                    taxPercentage: 0,
                    quantity: 0,
                    image: [],
                    baseColor: "",
                    displayColor: "",
                    weight: 0,
                    sku: "",
                  },
                ],
              })
            }
          >
            Add Variant <PlusCircle className="size-5 ml-2" />
          </Button>
          {fields.map((variant, idx) => (
            <VariantForm
              key={variant.id}
              form={form}
              index={idx}
              remove={() => remove(idx)}
            />
          ))}

          {/*  <pre>
            {JSON.stringify(form.getValues(), null, 2)}{" "}
            {JSON.stringify(form.formState.errors, null, 2)}{" "}
          </pre> */}
          <Button
            type="submit"
            disabled={isPending || !form.formState.isValid}
            className="w-full h-12 text-sm md:text-lg"
          >
            {isPending
              ? "Saving..."
              : mode === "edit"
                ? "Update Product"
                : "Save Product"}
            {form.formState.isSubmitting && <Spinner />}
          </Button>
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}
        </form>
      </Form>
    </div>
  );
}
