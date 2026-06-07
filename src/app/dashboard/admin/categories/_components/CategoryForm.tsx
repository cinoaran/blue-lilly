"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import FormError from "@/components/shared/authComponent/FormError";

const CategorySchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;

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
}: {
  // Server Action or client handler passed from a server component.
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  submitLabel?: string;
  initialValues?: Partial<CategoryFormValues> & {id?: string};
}) {
  const defaultVals: Partial<CategoryFormValues> = initialValues
    ? {name: initialValues.name || "", slug: initialValues.slug || ""}
    : {name: "", slug: ""};

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: defaultVals as CategoryFormValues,
  });

  const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  async function handle(values: CategoryFormValues) {
    setSuccessMsg(undefined);
    setErrorMsg(undefined);

    const cleaned = {
      name: values.name.trim(),
      slug:
        values.slug && values.slug.trim().length > 0
          ? values.slug.trim()
          : slugify(values.name),
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
        <input
          {...register("slug")}
          className="w-full rounded-md border px-3 py-2"
          placeholder="optional - will be generated from name"
        />
        {errors.slug && (
          <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
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
