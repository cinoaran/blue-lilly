"use client";

import {deleteCategoryAction} from "@/actions/admin/categories/deleteCategoryAction";
import {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox";
import {Category} from "@/types/category/category"; // Dein Type
import {Button} from "@/components/ui/button";
import {Edit2Icon, Plus, Trash2Icon} from "lucide-react";
import {useTransition, useState} from "react";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip";

function CategoryActions({
  category,
  handlers,
}: {
  category: Category;
  handlers?: {
    onDelete?: (id: string) => void;
  };
}) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    try {
      const res = await fetch(
        `/api/admin/categories/check-delete?id=${encodeURIComponent(
          category.id,
        )}`,
      );
      const json = await res.json();
      if (json.error) {
        alert(json.error || "Fehler bei Loesch-Pruefung");
        return;
      }

      const {children, products} = json.counts ?? {children: 0, products: 0};
      if (children > 0 || products > 0) {
        alert(
          `Kategorie kann nicht geloescht werden. Unterkategorien: ${children}, Produkte: ${products}. Bitte zuerst verschieben oder loeschen.`,
        );
        return;
      }

      if (!confirm("Kategorie wirklich loeschen?")) return;

      startTransition(async () => {
        const result = await deleteCategoryAction(category.id);
        if (!result.success) {
          alert(result.error || "Kategorie konnte nicht geloescht werden.");
          return;
        }
        if (handlers?.onDelete) {
          handlers.onDelete(category.id);
        } else {
          window.location.reload();
        }
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="flex gap-1 items-center">
      {/* Inline Add only for root categories */}
      {category.parentId == null && (
        <InlineAddButton category={category} handlers={handlers} />
      )}

      {/* Delete: only allow when no subcategories are present */}
      {Array.isArray(category.children) && category.children.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              disabled
              aria-label="Cannot delete"
            >
              <Trash2Icon className="h-4 w-4 opacity-40" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {category.parentId == null
              ? "Hauptkategorie kann nur gelöscht werden, wenn es keine Unterkategorien mehr gibt"
              : "Unterkategorie kann nur gelöscht werden, wenn es keine Unterkategorien mehr gibt"}
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDelete}
              disabled={isPending}
              aria-label={
                category.parentId == null
                  ? "Hauptkategorie löschen"
                  : "Unterkategorie löschen"
              }
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {category.parentId == null
              ? "Hauptkategorie löschen"
              : "Unterkategorie löschen"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function InlineAddButton({
  category,
  handlers,
}: {
  category: Category;
  handlers?: {
    onAdd?: (parentId: string | null, created: Category) => void;
    onDelete?: (id: string) => void;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!name.trim()) {
      alert("Name required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          parentId: category.id,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const created = (json.created || json) as Category;
      if (handlers?.onAdd) handlers.onAdd(category.id, created);
      setOpen(false);
      setName("");
      setSlug("");
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }

  return open ? (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border rounded px-2 py-1"
      />
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="optional slug"
        className="border rounded px-2 py-1 font-mono"
      />
      <Button size="xs" onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Add"}
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={() => {
          setOpen(false);
          setName("");
          setSlug("");
        }}
      >
        Cancel
      </Button>
    </div>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          aria-label="Add child"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Eine Unterkategorie erzeugen</TooltipContent>
    </Tooltip>
  );
}

export function getColumns(
  allCategories: Category[],
  handlers?: {
    onAdd?: (parentId: string | null, created: unknown) => void;
    onUpdate?: (id: string, updated: unknown) => void;
    onDelete?: (id: string) => void;
  },
): ColumnDef<Category>[] {
  // helper: flatten children for select options
  const flat = allCategories;

  return [
    // Expander for nested categories
    {
      id: "expander",
      header: () => null,
      cell: ({row}) => (
        <div className="pl-1">
          {row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="text-sm text-foreground/70"
              aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
            >
              {row.getIsExpanded() ? "▾" : "▸"}
            </button>
          ) : null}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // 1. Selection
    {
      id: "select",
      header: ({table}) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({row}) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // 2. Name (Hauptsäule)
    {
      accessorKey: "name",
      header: () => <div className="text-left">Name</div>,
      cell: ({row}) => {
        // render normal text; inline edit handled in actions via editing state
        return <div className="font-medium">{row.getValue("name")}</div>;
      },
    },
    // 3. Slug
    {
      accessorKey: "slug",
      header: () => <div className="text-left">Slug</div>,
      cell: ({row}) => {
        console.log("slug:", row);
        return <div className="font-mono text-sm">{row.getValue("slug")}</div>;
      },
    },
    // 4. Link (derived from `slug`)
    {
      id: "link",
      header: "Link",
      cell: ({row}) => {
        const slug = row.getValue("slug") as string | undefined;
        const href = slug ? `/category/${slug}` : "–";
        return (
          <a
            href={typeof href === "string" ? href : undefined}
            className="font-mono text-sm text-primary underline"
          >
            {href}
          </a>
        );
      },
    },
    // 6. Products Count
    {
      id: "productsCount",
      header: "Produkte",
      cell: ({row}) => (
        <div className="font-mono">{row.original._count?.products || 0}</div>
      ),
    },
    // 7. (removed attributes — not available in schema)
    // 8. Actions
    {
      id: "actions",
      cell: ({row}) => {
        // Inline editor component
        function InlineEditor({item}: {item: Category}) {
          const [editing, setEditing] = useState(false);
          const [name, setName] = useState(item.name);
          const [slug, setSlug] = useState(item.slug);
          const [parentId, setParentId] = useState<string | undefined>(
            item.parentId ?? "",
          );
          const [loading, setLoading] = useState(false);

          async function save() {
            setLoading(true);
            try {
              const res = await fetch("/api/admin/categories/update", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                  id: item.id,
                  name: name.trim(),
                  slug: slug?.trim(),
                  parentId: parentId === "" ? null : parentId,
                }),
              });
              const json = await res.json();
              if (json.error) throw new Error(json.error);
              const updated = json.updated || json;
              if (handlers?.onUpdate) handlers.onUpdate(item.id, updated);
              setEditing(false);
            } catch (e) {
              alert(e instanceof Error ? e.message : String(e));
              setLoading(false);
            }
          }

          return (
            <div className="flex flex-col">
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setEditing(true)}
                      aria-label={
                        item.parentId
                          ? "Unterkategorie bearbeiten"
                          : "Hauptkategorie bearbeiten"
                      }
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {item.parentId
                      ? "Unterkategorie bearbeiten"
                      : "Hauptkategorie bearbeiten"}
                  </TooltipContent>
                </Tooltip>
                <CategoryActions category={item} handlers={handlers} />
              </div>

              {editing && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="border rounded px-2 py-1 font-mono"
                  />
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Keine (Root)</option>
                    {flat.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Button size="xs" onClick={save} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        }

        return <InlineEditor item={row.original} />;
      },
    },
    // (Inline Add consolidated into CategoryActions)
  ];
}
