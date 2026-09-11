"use client";
import {UseFormReturn, useFieldArray} from "react-hook-form";
import type {ProductFormData} from "@/types/product/productFormData";
import sizesData from "@/data/sizes.json";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import OptionForm from "./OptionForm";
import {Input} from "@/components/ui/input";
import {CircleMinus, PlusCircle} from "lucide-react";

export default function VariantForm({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<ProductFormData>;
  index: number;
  remove: () => void;
}) {
  const {
    fields,
    append,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: `variants.${index}.options`,
  });

  return (
    <div className="flex flex-col gap-10 items-start mb-6 border rounded p-4">
      <div className="w-full flex justify-between items-center gap-10">
        {/* Variants size */}
        <FormField
          control={form.control}
          name={`variants.${index}.size`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[index]?.size
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Size
              </FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter size (e.g., M, 42, 10cm)"
                  className="w-full border-b-[0.3px] border-border focus-visible:underlined py-6 text-[0.6rem] md:text-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variants unit */}
        <FormField
          control={form.control}
          name={`variants.${index}.units`}
          render={({field}) => (
            <FormItem className="py-3 w-full">
              <FormLabel
                className={`font-thin text-[0.6rem] md:text-lg ${
                  form.formState.errors.variants?.[index]?.units
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                Unit
              </FormLabel>
              <FormControl>
                <Select
                  disabled={form.formState.isSubmitting}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>

                  <SelectContent>
                    {sizesData.sizes.map((size) => (
                      <div key={size.id}>
                        <p className="font-bold">{size.name}</p>
                        {size.value.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex items-center justify-end w-full">
        <Button
          type="button"
          variant="default"
          className="bg-success hover:bg-primary-foreground/20 text-primary-foreground w-max lg:w-1/6 h-9 text-sm md:text-md"
          onClick={() =>
            append({
              id: crypto.randomUUID(),
              entryPrice: 0,
              sellPrice: 0,
              taxPercentage: 0,
              quantity: 0,
              image: [],
              baseColor: "",
              displayColor: "",
              weight: 0,
            })
          }
        >
          Add Option <PlusCircle className="size-5 ml-2" />
        </Button>
      </div>
      {fields.map((option, optIdx) => (
        <div key={option.id} className="flex flex-col gap-2 mb-2">
          <OptionForm
            key={option.id}
            form={form}
            variantIndex={index}
            optionIndex={optIdx}
            remove={() => removeOption(optIdx)}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="destructive"
        onClick={remove}
        className="text-md w-fit"
      >
        Remove Variant <CircleMinus className="size-5 ml-2" />
      </Button>
    </div>
  );
}
