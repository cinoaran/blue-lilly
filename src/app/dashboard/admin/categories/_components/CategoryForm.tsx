"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import FormError from "@/components/shared/authComponent/FormError";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {
  buildCategoryTree,
  getCategoryDescendantIds,
} from "@/lib/category/categoryTree";
import {Category} from "@/types/category/category";

const CategorySchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;
type CategoryTree = ReturnType<typeof buildCategoryTree>;

const ROOT_PARENT_VALUE = "";

const renderCategoryOptions = (
  categories: CategoryTree,
  depth = 0,
): React.ReactNode[] =>
  categories.flatMap((category) => [
    <NativeSelectOption key={category.id} value={category.id}>
      {`${"› ".repeat(depth)}${category.name}`}
    </NativeSelectOption>,
    ...(category.children?.length
      ? renderCategoryOptions(category.children, depth + 1)
      : []),
  ]);

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryForm({
  onSubmit,
  submitLabel = "Create Category",
  initialValues,
  categories = [],
  currentCategoryId,
}: {
  // Server Action or client handler passed from a server component.
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  submitLabel?: string;
  initialValues?: Partial<CategoryFormValues> & {id?: string};
  categories?: Category[];
  currentCategoryId?: string;
}) {
  const excludedCategoryIds = currentCategoryId
    ? new Set([
        currentCategoryId,
        ...getCategoryDescendantIds(
          categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            parentId:
              category.parentId === undefined ? null : category.parentId,
          })),
          currentCategoryId,
        ),
      ])
    : new Set<string>();

  const availableCategories = categories.filter(
    (category) => !excludedCategoryIds.has(category.id),
  );

  const categoryTree = buildCategoryTree(
    availableCategories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId === undefined ? null : category.parentId,
    })),
  );

  const defaultVals: Partial<CategoryFormValues> = initialValues
    ? {
        name: initialValues.name || "",
        slug: initialValues.slug || "",
        parentId: initialValues.parentId || ROOT_PARENT_VALUE,
      }
    : {name: "", slug: "", parentId: ROOT_PARENT_VALUE};

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    watch,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: defaultVals as CategoryFormValues,
  });

  const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [autoGenerate, setAutoGenerate] = useState<boolean>(
    !(initialValues && initialValues.slug),
  );

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedParentId = watch("parentId");
  const previewSlug = slugify(watchedName || "");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Debounced slug availability check
  React.useEffect(() => {
    let active = true;
    setSlugAvailable(null); // unknown while checking
    const candidate = (autoGenerate ? previewSlug : watchedSlug || previewSlug)
      .trim()
      .toLowerCase();
    if (!candidate) {
      setSlugAvailable(null);
      return;
    }

    const id = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/categories/check-slug", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            slug: candidate,
            parentId:
              watchedParentId === ROOT_PARENT_VALUE
                ? null
                : watchedParentId || null,
            excludeId: initialValues?.id || undefined,
          }),
        });
        const json = await res.json();
        if (!active) return;
        setSlugAvailable(Boolean(json.available));
      } catch (e) {
        console.log("Error checking slug availability:", e);
        if (!active) return;
        setSlugAvailable(null);
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [
    previewSlug,
    watchedSlug,
    autoGenerate,
    watchedParentId,
    initialValues?.id,
  ]);

  async function handle(values: CategoryFormValues) {
    setSuccessMsg(undefined);
    setErrorMsg(undefined);

    const cleaned = {
      name: values.name.trim(),
      slug: autoGenerate
        ? previewSlug
        : values.slug && values.slug.trim().length > 0
          ? values.slug.trim()
          : previewSlug,
      parentId:
        values.parentId && values.parentId.trim().length > 0
          ? values.parentId.trim()
          : undefined,
    } as CategoryFormValues;

    try {
      if (!onSubmit) throw new Error("No submission handler provided.");
      await onSubmit(cleaned);
      setSuccessMsg("Category saved successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || "Failed to save category.");
    }
  }

  return (
    <form onSubmit={handleSubmit(handle)} className="space-y-4">
      <FormSuccess message={successMsg} />
      <FormError message={errorMsg} />

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register("name")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <div className="flex gap-3">
          <input
            {...register("slug")}
            className="w-full rounded-md border px-3 py-2"
            placeholder="optional - will be generated from name"
            disabled={autoGenerate}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm">Auto</label>
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(Boolean(e.target.checked))}
            />
          </div>
        </div>
        <div className="text-sm text-foreground/70 mt-1">
          Vorschau:{" "}
          <span className="font-mono">
            {autoGenerate ? previewSlug : watchedSlug || "—"}
          </span>
        </div>
        <div className="text-sm mt-1">
          {slugAvailable === null ? (
            <span className="text-foreground/60">Checking availability…</span>
          ) : slugAvailable === true ? (
            <span className="text-green-600">Slug available</span>
          ) : (
            <span className="text-red-600">
              Slug already exists in this parent
            </span>
          )}
        </div>
        {errors.slug && (
          <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Parent Category
        </label>
        <NativeSelect className="w-full" {...register("parentId")}>
          <NativeSelectOption value={ROOT_PARENT_VALUE}>
            Keine (Root Category)
          </NativeSelectOption>
          {renderCategoryOptions(categoryTree)}
        </NativeSelect>
        {errors.parentId && (
          <p className="text-sm text-red-600 mt-1">{errors.parentId.message}</p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
