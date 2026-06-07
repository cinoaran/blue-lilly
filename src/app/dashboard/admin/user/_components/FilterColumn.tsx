import {Input} from "@/components/ui/input";
import {Table} from "@tanstack/react-table";

interface RoleFilterProps<TData> {
  table: Table<TData>;
}

export function FilterColumn<TData>({table}: RoleFilterProps<TData>) {
  return (
    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between w-full py-4 mb-5 text-primary-foreground gap-8 md:gap-4 overflow-x-auto">
      <Input
        placeholder="Filter names..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="w-full md:w-1/2 border-b-[0.3px] rounded-none outline-none focus-visible:ring-transparent focus-visible:border-b-[0.3px] border-primary-foreground/30 py-5 text-[0.9rem]"
      />
      <select
        className="border-foreground/10 rounded px-2 py-2 text-[0.9rem] bg-primary"
        value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
        onChange={(e) =>
          table.getColumn("role")?.setFilterValue(e.target.value || undefined)
        }
      >
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="merchant">Merchant</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
