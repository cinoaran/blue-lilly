import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {ChevronRightIcon} from "lucide-react";

export function PaginationProducts({
  totalPages,
  currentPage,
  query,
}: {
  totalPages: number;
  currentPage: number;
  query: string;
}) {
  return (
    <Pagination aria-label="Pagination" className="my-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`?query=${encodeURIComponent(query)}&page=${currentPage - 1}`}
          />
        </PaginationItem>
        {Array.from({length: totalPages}, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              href={`?query=${encodeURIComponent(query)}&page=${i + 1}`}
              aria-current={currentPage === i + 1 ? "page" : undefined}
              className={
                currentPage === i + 1
                  ? "bg-primary text-white"
                  : "bg-transparent"
              }
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > currentPage ? (
          <PaginationItem>
            <PaginationNext
              href={`?query=${encodeURIComponent(query)}&page=${currentPage + 1}`}
            />
          </PaginationItem>
        ) : (
          <div className="flex items-center justify-center font-medium gap-1 w-fit text-sm px-2.5 sm:pr-2.5 cursor-not-allowed opacity-50">
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon size={16} />
          </div>
        )}
      </PaginationContent>
    </Pagination>
  );
}
