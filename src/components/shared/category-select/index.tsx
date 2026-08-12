import React from "react";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {SearchOption} from "@/lib/category/categoryTree";

const ALL_CATEGORIES_VALUE = "__all_categories__";
const normalizeCategoryValue = (input: string) =>
  decodeURIComponent(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const renderCategoryOptions = (
  options: SearchOption[] = [],
  depth = 1,
): React.ReactNode[] =>
  options.flatMap((option) => [
    <NativeSelectOption
      key={option.value}
      value={normalizeCategoryValue(option.value)}
    >
      {`${"› ".repeat(depth)}${option.label}`}
    </NativeSelectOption>,
    ...(option.children?.length
      ? renderCategoryOptions(option.children, depth + 1)
      : []),
  ]);

type CategorySelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options?: SearchOption[];
  disabled?: boolean;
  className?: string;
  showAllOption?: boolean;
};

const CategorySelect = ({
  value = ALL_CATEGORIES_VALUE,
  onChange,
  options,
  disabled,
  className,
  showAllOption = true,
}: CategorySelectProps) => {
  return (
    <NativeSelect
      value={value || ALL_CATEGORIES_VALUE}
      onChange={(e) =>
        onChange?.(
          e.target.value === ALL_CATEGORIES_VALUE ? "" : e.target.value,
        )
      }
      disabled={disabled}
      className={className}
    >
      {showAllOption && (
        <NativeSelectOption
          value={ALL_CATEGORIES_VALUE}
          className="text-sm  capitalize"
        >
          {ALL_CATEGORIES_VALUE.replace(/_/g, " ").replace(/\b\w/g, (c) =>
            c.toUpperCase(),
          )}
        </NativeSelectOption>
      )}
      {options?.map((option) => (
        <NativeSelectOptGroup
          key={option.value}
          label={option.label}
          className="text-sm text-foreground/70"
        >
          {renderCategoryOptions(option.children)}
        </NativeSelectOptGroup>
      ))}
    </NativeSelect>
  );
};

export default CategorySelect;
