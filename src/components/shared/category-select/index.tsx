import React from "react";
import GroupedSelect from "@/components/ui/GroupedSelect";
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
): {value: string; label: React.ReactNode}[] =>
  options.flatMap((option) => [
    {
      value: normalizeCategoryValue(option.value),
      label: `${"› ".repeat(depth)}${option.label}`,
    },
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
  className,
  showAllOption = true,
}: CategorySelectProps) => {
  // Build groups for GroupedSelect. Each top-level category becomes an optgroup,
  // with its descendants flattened as options (matching previous behavior).
  const groups = (options ?? []).map((opt) => ({
    label: opt.label,
    options: renderCategoryOptions(opt.children ?? []),
  }));

  if (showAllOption) {
    const human = ALL_CATEGORIES_VALUE.replace(/_/g, " ").replace(
      /\b\w/g,
      (c) => c.toUpperCase(),
    );
    groups.unshift({
      label: "",
      options: [{value: ALL_CATEGORIES_VALUE, label: human}],
    });
  }

  return (
    <GroupedSelect
      groups={groups}
      value={value || ALL_CATEGORIES_VALUE}
      onChange={(v) => onChange?.(v === ALL_CATEGORIES_VALUE ? "" : v)}
      className={className}
    />
  );
};

export default CategorySelect;
