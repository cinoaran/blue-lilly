type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
};

export type SearchOption = {
  label: string;
  value: string;
  children?: SearchOption[];
};

export function mapCategoryTreeToSearchOptions(
  categories: CategoryNode[],
  parentPath = "",
): SearchOption[] {
  return categories.map((category) => {
    // Use only the last segment of `slug` in case the stored slug already
    // contains parent path segments (defensive against earlier data bugs).
    const ownSlug =
      String(category.slug ?? "")
        .split("/")
        .filter(Boolean)
        .pop() ?? "";
    const currentValue = parentPath ? `${parentPath}/${ownSlug}` : ownSlug;

    return {
      label: category.name,
      value: currentValue,
      children: category.children?.length
        ? mapCategoryTreeToSearchOptions(category.children, currentValue)
        : undefined,
    };
  });
}
