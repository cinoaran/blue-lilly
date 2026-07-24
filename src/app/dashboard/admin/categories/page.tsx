import {DataTable} from "../../_components/DataTable";
import {getAllCategories} from "@/actions/admin/categories/getAllCategories";
import {Category} from "@/types/category/category";
import Link from "next/link";
import {Button} from "@/components/ui/button";

const CategoriesPage = async () => {
  // single DB call that returns a tree when groupByParent = true
  const tree = (await getAllCategories(undefined, {}, true)) as
    | Category[]
    | null;

  if (!tree) {
    return (
      <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
        No categories found
      </div>
    );
  }

  // Build a flat list of categories for parent-select options
  const flat: Category[] = [];
  (function collect(nodes: Category[] | undefined) {
    if (!nodes) return;
    for (const n of nodes) {
      flat.push({
        id: n.id,
        name: n.name,
        slug: n.slug,
        parentId: n.parentId ?? null,
      } as Category);
      if (Array.isArray(n.children) && n.children.length)
        collect(n.children as Category[]);
    }
  })(tree ?? undefined);

  return (
    <div className="container  bg-secondary text-foreground border-[0.3px] border-foreground/10 rounded-lg backdrop-blur-md shadow-md shadow-foreground/10 mx-auto my-12">
      <div className="flex items-center justify-end p-4">
        <Link href="/dashboard/admin/categories/add-category">
          <Button size="sm">Add Root Category</Button>
        </Link>
      </div>
      <DataTable allCategories={flat} data={tree as Category[]} />

      <div className="mt-4 p-3 rounded-md border border-foreground/10 bg-muted/20 text-sm text-foreground/80">
        <strong className="font-medium">Hinweis:</strong> Root-Kategorien haben
        kein Parent. Unterkategorien sind eingerückt dargestellt. Der Slug wird
        standardmäßig aus dem Namen generiert und ist innerhalb derselben
        Parent-Kategorie eindeutig; du kannst ihn bei Bedarf manuell ändern.
      </div>
    </div>
  );
};

export default CategoriesPage;
