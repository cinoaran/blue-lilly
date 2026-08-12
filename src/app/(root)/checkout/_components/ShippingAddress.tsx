"use client";

import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import type {Address} from "@/generated/prisma/browser";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {SquarePen, User} from "lucide-react";
import {Button} from "@/components/ui/button";

const addressSchema = z.object({
  firstName: z.string().min(1, "Vorname erforderlich"),
  lastName: z.string().min(1, "Nachname erforderlich"),
  company: z.string().optional().nullable(),
  addressLine1: z.string().min(1, "Straße erforderlich"),
  addressLine2: z.string().optional().nullable(),
  postalCode: z.string().min(2, "PLZ erforderlich"),
  city: z.string().min(1, "Stadt erforderlich"),
  country: z.string().min(2, "Land erforderlich"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail").optional().nullable(),
});

const formSchema = z.object({
  billing: addressSchema,
  shipping: addressSchema,
  sameAsBilling: z.boolean(),
  billingId: z.string().optional(),
  shippingId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  addresses: Address[];
  shippingAddressId?: string;
  billingAddressId?: string;
  setShippingAddressId?: (id: string) => void;
  setBillingAddressId?: (id: string) => void;
  onBack?: () => void;
  onNext?: (data: {
    billingId?: string;
    shippingId?: string;
    billing?: FormData["billing"];
    shipping?: FormData["shipping"];
    sameAsBilling: boolean;
  }) => void;
  // optional map of server-side validation errors keyed by form path (e.g. "billing.firstName")
  serverErrors?: Record<string, string>;
  isLoggedIn?: boolean;
};

export default function ShippingAddressStep({
  addresses,
  shippingAddressId = "",
  billingAddressId = "",
  setShippingAddressId,
  setBillingAddressId,
  onNext,
  serverErrors,
  isLoggedIn,
}: Props) {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const userToggledSameRef = useRef(false);

  // Compute defaults directly to satisfy exhaustive-deps
  const defaultBilling = useMemo(
    () => addresses.find((a) => a.id === billingAddressId) ?? null,
    [billingAddressId, addresses],
  );
  const defaultShipping = useMemo(
    () => addresses.find((a) => a.id === shippingAddressId) ?? null,
    [shippingAddressId, addresses],
  );

  // helper: find address by id
  const findById = useCallback(
    (id?: string) => addresses.find((a) => a.id === id) ?? null,
    [addresses],
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: {errors, isValid},
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      billing: defaultBilling
        ? {
            firstName: defaultBilling.firstName,
            lastName: defaultBilling.lastName,
            company: defaultBilling.company ?? null,
            addressLine1: defaultBilling.addressLine1,
            addressLine2: defaultBilling.addressLine2 ?? null,
            postalCode: defaultBilling.postalCode,
            city: defaultBilling.city,
            country: defaultBilling.country,
            phone: defaultBilling.phone ?? null,
            email: defaultBilling.email ?? null,
          }
        : undefined,
      shipping: defaultShipping
        ? {
            firstName: defaultShipping.firstName,
            lastName: defaultShipping.lastName,
            company: defaultShipping.company ?? null,
            addressLine1: defaultShipping.addressLine1,
            addressLine2: defaultShipping.addressLine2 ?? null,
            postalCode: defaultShipping.postalCode,
            city: defaultShipping.city,
            country: defaultShipping.country,
            phone: defaultShipping.phone ?? null,
            email: defaultShipping.email ?? null,
          }
        : undefined,
      sameAsBilling: true,
      billingId: billingAddressId || undefined,
      shippingId: shippingAddressId || undefined,
    },
  });

  // watch billing + shipping fields to compute submission readiness
  const billingValues = watch("billing");
  const shippingValues = watch("shipping");

  // Apply server-side errors when provided
  useEffect(() => {
    if (!serverErrors) return;
    const entries = Object.entries(serverErrors);
    if (entries.length === 0) return;
    entries.forEach(([path, message]) => {
      try {
        // cast to any to satisfy react-hook-form typing for nested paths
        setError(path as keyof FormData, {type: "server", message});
      } catch (e) {
        console.warn(`Failed to set server error for path "${path}":`, e);
        // ignore unknown paths
      }
    });
  }, [serverErrors, setError]);

  useEffect(() => {
    if (sameAsBilling && billingValues) {
      setValue("shipping", billingValues);
      setValue("shippingId", undefined);
    }
  }, [sameAsBilling, billingValues, setValue]);

  // If parent provides a billingAddressId later, populate billing fields
  useEffect(() => {
    if (!billingAddressId) return;
    const found = findById(billingAddressId);
    if (!found) return;
    setValue("billing", {
      firstName: found.firstName,
      lastName: found.lastName,
      company: found.company ?? null,
      addressLine1: found.addressLine1,
      addressLine2: found.addressLine2 ?? null,
      postalCode: found.postalCode,
      city: found.city,
      country: found.country,
      phone: found.phone ?? null,
      email: found.email ?? null,
    });
    setValue("billingId", billingAddressId);
  }, [billingAddressId, findById, setValue]);

  // If no billingAddressId provided but user has saved addresses, use the first one as fallback (only if user didn't toggle)
  useEffect(() => {
    if (billingAddressId) return;
    if (userToggledSameRef.current) return;
    if (!addresses || addresses.length === 0) return;

    const first = addresses[0];
    if (!first) return;

    setValue("billing", {
      firstName: first.firstName,
      lastName: first.lastName,
      company: first.company ?? null,
      addressLine1: first.addressLine1,
      addressLine2: first.addressLine2 ?? null,
      postalCode: first.postalCode,
      city: first.city,
      country: first.country,
      phone: first.phone ?? null,
      email: first.email ?? null,
    });
    setValue("billingId", first.id);

    // If there is no explicit shippingAddressId, keep sameAsBilling true
    if (!shippingAddressId) {
      setSameAsBilling(true);
      setValue("sameAsBilling", true);
    }
  }, [addresses, billingAddressId, shippingAddressId, setValue]);

  // If parent provides a shippingAddressId later, populate shipping fields
  useEffect(() => {
    if (!shippingAddressId) return;
    const found = findById(shippingAddressId);
    if (!found) return;
    setValue("shipping", {
      firstName: found.firstName,
      lastName: found.lastName,
      company: found.company ?? null,
      addressLine1: found.addressLine1,
      addressLine2: found.addressLine2 ?? null,
      postalCode: found.postalCode,
      city: found.city,
      country: found.country,
      phone: found.phone ?? null,
      email: found.email ?? null,
    });
    setValue("shippingId", shippingAddressId);
  }, [shippingAddressId, findById, setValue]);

  // If a separate shipping address is provided, disable sameAsBilling.
  // If no shipping but billing exists, enable sameAsBilling by default.
  useEffect(() => {
    // Don't override user's manual choice
    if (userToggledSameRef.current) return;

    if (shippingAddressId) {
      setSameAsBilling(false);
      setValue("sameAsBilling", false);
      return;
    }
    if (!shippingAddressId && billingAddressId) {
      setSameAsBilling(true);
      setValue("sameAsBilling", true);
    }
  }, [shippingAddressId, billingAddressId, setValue]);

  const onSubmit = (data: FormData) => {
    console.log("ShippingAddress onSubmit called", {data, onNext});
    // if existing ids present, call setters
    if (data.billingId && setBillingAddressId)
      setBillingAddressId(data.billingId);
    if (data.shippingId && setShippingAddressId)
      setShippingAddressId(data.shippingId);

    if (onNext) {
      onNext({
        billingId: data.billingId,
        shippingId: data.shippingId,
        billing: data.billing,
        shipping: data.shipping,
        sameAsBilling: data.sameAsBilling,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl bg-background/10 p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Rechnungsadresse</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 place-items-center w-full">
          <div className="flex flex-col gap-1 items-center justify-center">
            <label className="underlined" htmlFor="billing.firstName">
              <Input
                {...register("billing.firstName")}
                placeholder="Vorname"
                className="px-3 py-6"
              />
            </label>
            {errors.billing?.firstName && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.firstName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.lastName">
              <Input
                {...register("billing.lastName")}
                placeholder="Nachname"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.lastName && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.lastName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.company">
              <Input
                {...register("billing.company")}
                placeholder="Firma (optional)"
                className="px-3 py-6 col-span-2"
              />
              {errors.billing?.company && (
                <span className="text-destructive text-xs font-thin col-span-1">
                  {errors.billing.company.message}
                </span>
              )}
            </label>
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.addressLine1">
              <Input
                {...register("billing.addressLine1")}
                placeholder="Straße"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.addressLine1 && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.addressLine1.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.addressLine2">
              <Input
                {...register("billing.addressLine2")}
                placeholder="Adresszusatz (optional)"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.addressLine2 && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.addressLine2.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.postalCode">
              <Input
                {...register("billing.postalCode")}
                placeholder="PLZ"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.postalCode && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.postalCode.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.city">
              <Input
                {...register("billing.city")}
                placeholder="Stadt"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.city && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.city.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.country">
              <Input
                {...register("billing.country")}
                placeholder="Land (DE)"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.country && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.country.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.phone">
              <Input
                {...register("billing.phone")}
                placeholder="Telefon (optional)"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.phone && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.phone.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-start justify-start">
            <label className="underlined" htmlFor="billing.email">
              <Input
                {...register("billing.email")}
                placeholder="E-Mail (optional)"
                className="px-3 py-6 col-span-2"
              />
            </label>
            {errors.billing?.email && (
              <span className="text-destructive text-xs font-thin col-span-1">
                {errors.billing.email.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 w-full my-4 text-sm text-muted-foreground">
          {sameAsBilling ? (
            <button
              type="button"
              className="ml-2 hover:border-b-[0.3px] hover:text-foreground border-b-[0.3px] underlined"
              onClick={() => {
                userToggledSameRef.current = true;
                setSameAsBilling(false);
                setValue("sameAsBilling", false);
                // clear shipping fields when user chooses a different address
                setValue("shipping", {
                  firstName: "",
                  lastName: "",
                  company: null,
                  addressLine1: "",
                  addressLine2: null,
                  postalCode: "",
                  city: "",
                  country: "",
                  phone: null,
                  email: null,
                });
                setValue("shippingId", undefined);
              }}
            >
              Für eine abweichende Lieferadresse als die Rechnungsadresse hier
              klicken
            </button>
          ) : (
            <button
              type="button"
              className="w-full px-5 text-foreground hover:border-b-[0.3px] hover:text-foreground border-b-[0.3px] underlined"
              onClick={() => {
                userToggledSameRef.current = true;
                setSameAsBilling(true);
                setValue("sameAsBilling", true);
              }}
            >
              Wenn die Rechnungsadresse reicht, hier klicken, um die
              Lieferadresse zu übernehmen
            </button>
          )}
        </div>

        {!sameAsBilling && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Lieferadresse</h3>
              <div className="grid grid-cols-2 gap-2 place-items-center w-full">
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.firstName">
                    <Input
                      {...register("shipping.firstName")}
                      placeholder="Vorname"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.firstName && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.firstName.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.lastName">
                    <Input
                      {...register("shipping.lastName")}
                      placeholder="Nachname"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.lastName && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.lastName.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.company">
                    <Input
                      {...register("shipping.company")}
                      placeholder="Firma (optional)"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.company && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.company.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.addressLine1">
                    <Input
                      {...register("shipping.addressLine1")}
                      placeholder="Straße"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.addressLine1 && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.addressLine1.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.addressLine2">
                    <Input
                      {...register("shipping.addressLine2")}
                      placeholder="Adresszusatz (optional)"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.addressLine2 && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.addressLine2.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.postalCode">
                    <Input
                      {...register("shipping.postalCode")}
                      placeholder="PLZ"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.postalCode && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.postalCode.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.city">
                    <Input
                      {...register("shipping.city")}
                      placeholder="Stadt"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.city && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.city.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.country">
                    <Input
                      {...register("shipping.country")}
                      placeholder="Land (DE)"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.country && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.country.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.phone">
                    <Input
                      {...register("shipping.phone")}
                      placeholder="Telefon (optional)"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.phone && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.phone.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-start justify-start">
                  <label className="underlined" htmlFor="shipping.email">
                    <Input
                      {...register("shipping.email")}
                      placeholder="E-Mail (optional)"
                      className={`px-3 py-6 col-span-2 ${sameAsBilling ? "" : "focus:bg-background/10 focus:transition-colors"}`}
                      disabled={sameAsBilling}
                    />
                  </label>
                  {errors.shipping?.email && (
                    <span className="text-destructive text-xs font-thin col-span-1">
                      {errors.shipping.email.message}
                    </span>
                  )}
                </div>
              </div>
              {/* shipping fields end here */}
            </div>
          </>
        )}
        {/* always show Stripe button and optional guest message below the address forms */}
      </div>

      <div className="my-12 backdrop:blur-sm bg-background/10 p-4">
        {!isLoggedIn && (
          <>
            <h3 className="text-left text-lg font-semibold mb-2">
              Deine Bestellung
            </h3>
            <div className="flex flex-col items-start justify-center gap-12 my-2">
              <div className="flex flex-col items-start justify-center gap-10 flex-1">
                <span className="text-sm font-normal text-foreground">
                  Du hast bereits ein Kundenkonto? Dann melde dich an, um deine
                  gespeicherten Adressen zu verwenden.
                </span>
                <div className="flex items-center justify-between gap-2 w-[97%]">
                  <Link
                    href="/register"
                    className="text-md decoration-0 text-muted-foreground hover:text-foreground h-8 underlined"
                  >
                    <SquarePen className="inline-block mr-2" size={16} />
                    <span className="font-normal text-md">
                      Registriere dich
                    </span>
                  </Link>
                  <Link
                    href="/login"
                    className="text-md decoration-0 text-muted-foreground hover:text-foreground h-8 underlined"
                  >
                    <User className="inline-block mr-2" size={14} />
                    <span className="font-normal text-md">Melde dich an</span>
                  </Link>
                </div>
              </div>
              <div className="text-center justify-center text-xs w-full">
                <span className="font-normal text-foreground">
                  Du möchtest kein Kundenkonto anlegen? Dann schließe den
                  Einkauf als Gast ab.
                </span>
              </div>
            </div>
          </>
        )}

        {/* compute submit readiness: if sameAsBilling only billing must be valid, otherwise both billing+shipping must be valid */}
        {(() => {
          const billingValid = addressSchema.safeParse(
            billingValues ?? {},
          ).success;
          const shippingValid = addressSchema.safeParse(
            shippingValues ?? {},
          ).success;
          const canSubmit = sameAsBilling
            ? billingValid
            : billingValid && shippingValid;

          return (
            <div className="flex gap-3 w-full">
              <Button
                variant="default"
                type="submit"
                className="w-full my-5 rounded-xl bg-primary px-4 py-4 text-white hover:bg-primary/10 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSubmit}
              >
                Mit Stripe bezahlen
              </Button>
            </div>
          );
        })()}
      </div>
    </form>
  );
}
