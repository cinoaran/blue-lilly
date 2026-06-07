"use client";

import React, {useMemo, useState} from "react";
import {useForm, useFieldArray} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import FormSuccess from "@/components/shared/authComponent/FormSuccess";
import FormError from "@/components/shared/authComponent/FormError";

const MerchantSchema = z.object({
  name: z.string().min(2, "Name required"),
  address: z.string().optional(),
  web: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  partners: z
    .array(
      z
        .object({
          name: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          department: z.string().optional(),
        })
        .partial(),
    )
    .optional(),
});

type MerchantFormValues = z.infer<typeof MerchantSchema>;

export default function MerchantForm({
  onSubmit,
  submitLabel = "Create Merchant",
  initialValues,
}: {
  onSubmit: (values: MerchantFormValues) => Promise<void> | void;
  submitLabel?: string;
  initialValues?: import("@/actions/admin/merchant/create").CreateMerchantInput;
}) {
  const defaultVals: Partial<MerchantFormValues> = initialValues
    ? {
        name: initialValues.name,
        address: initialValues.address || "",
        web: initialValues.web || "",
        phone: initialValues.phone || "",
        email: initialValues.email || "",
        partners: initialValues.partners?.length
          ? initialValues.partners.map((p) => ({
              name: p.name || "",
              phone: p.phone || "",
              email: p.email || "",
              department: p.department || "",
            }))
          : [{name: "", phone: "", email: "", department: ""}],
      }
    : {partners: [{name: "", phone: "", email: "", department: ""}]};

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<MerchantFormValues>({
    resolver: zodResolver(MerchantSchema),
    defaultValues: defaultVals as MerchantFormValues,
  });

  const {fields, append, remove} = useFieldArray({control, name: "partners"});
  const partnersWatch = watch("partners");
  const firstPartnerName = useMemo(() => {
    return (partnersWatch && partnersWatch[0] && partnersWatch[0].name) || "";
  }, [partnersWatch]);

  /*   const hasAnyPartnerName = useMemo(() => {
    type PartnerField = NonNullable<MerchantFormValues["partners"]>[number];
    return (partnersWatch || []).some(
      (p?: PartnerField) => !!(p && p.name && p.name.trim().length > 0),
    );
  }, [partnersWatch]); */

  const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  async function handle(values: MerchantFormValues) {
    setSuccessMsg(undefined);
    setErrorMsg(undefined);
    const cleaned = {
      ...values,
      partners: (values.partners || []).filter(
        (p) => p?.name && p.name.trim().length > 0,
      ),
    };
    try {
      await onSubmit(cleaned);
      setSuccessMsg("Merchant created successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || "Failed to create merchant.");
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
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          {...register("address")}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input
            {...register("web")}
            className="w-full rounded-md border px-3 py-2"
          />
          {errors.web && (
            <p className="text-sm text-red-600 mt-1">{errors.web.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            {...register("phone")}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register("email")}
          className="w-full rounded-md border px-3 py-2"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium">Partners</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-md p-3 my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...register(`partners.${index}.name` as const)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  {...register(`partners.${index}.phone` as const)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register(`partners.${index}.email` as const)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                <input
                  {...register(`partners.${index}.department` as const)}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="px-3 py-1 rounded-md border text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {firstPartnerName && firstPartnerName.trim().length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() =>
                append({name: "", phone: "", email: "", department: ""})
              }
              className="mt-2 px-3 py-2 rounded-md bg-secondary text-white"
            >
              Add partner
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Add more partners after first partner is filled.
            </p>
          </div>
        ) : null}
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
