type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
};

type FlatCategory = Omit<CategoryNode, "children">;

const normalizeSlug = (value: string) =>
  decodeURIComponent(value ?? "")
    .trim()
    .toLowerCase();

export function buildCategoryTree(categories: FlatCategory[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();

  for (const category of categories) {
    map.set(category.id, {
      ...category,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];

  for (const category of map.values()) {
    if (category.parentId) {
      const parent = map.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      } else {
        roots.push(category);
      }
    } else {
      roots.push(category);
    }
  }

  return roots;
}

function findCategoryNodeById(
  categories: CategoryNode[],
  id: string,
): CategoryNode | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const descendant = findCategoryNodeById(category.children, id);
    if (descendant) {
      return descendant;
    }
  }

  return null;
}

function findCategoryNodeBySlug(
  categories: CategoryNode[],
  slug: string,
): CategoryNode | null {
  const norm = normalizeSlug(slug);
  for (const category of categories) {
    if (normalizeSlug(category.slug) === norm) {
      return category;
    }

    const descendant = findCategoryNodeBySlug(category.children, slug);
    if (descendant) {
      return descendant;
    }
  }

  return null;
}

function collectCategoryIds(category: CategoryNode): string[] {
  return [category.id, ...category.children.flatMap(collectCategoryIds)];
}

export function getCategoryDescendantIds(
  categories: FlatCategory[],
  identifier: string,
): string[] {
  const categoryTree = buildCategoryTree(categories);

  // If the identifier looks like a path (contains '/'), try resolving it
  // left-to-right through the tree using the last segment of stored slugs
  // (defensive: stored slugs may already contain parent segments).
  if (String(identifier ?? "").includes("/")) {
    const pathParts = String(identifier ?? "")
      .split("/")
      .map((p) => normalizeSlug(p))
      .filter(Boolean);

    if (pathParts.length > 0) {
      let currentLevel = categoryTree;
      let matched: CategoryNode | null = null;

      for (const part of pathParts) {
        const found = currentLevel.find((c) => {
          const slugLast = String(c.slug ?? "")
            .split("/")
            .filter(Boolean)
            .pop();
          return normalizeSlug(slugLast ?? "") === part;
        });

        if (!found) {
          matched = null;
          break;
        }

        matched = found;
        currentLevel = found.children ?? [];
      }

      if (matched) return collectCategoryIds(matched);
    }
  }

  // Fallbacks: try id first, then slug
  let targetCategory = findCategoryNodeById(categoryTree, identifier);
  if (!targetCategory) {
    targetCategory = findCategoryNodeBySlug(categoryTree, identifier);
  }

  return targetCategory ? collectCategoryIds(targetCategory) : [];
}
