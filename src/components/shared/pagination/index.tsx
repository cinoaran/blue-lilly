"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {ChevronRightIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {useTransition} from "react";
import Spinner from "@/components/Loader/Spinner";

export function PaginationProducts({
  totalPages,
  currentPage,
  query,
  sort,
}: {
  totalPages: number;
  currentPage: number;
  query?: string;
  sort?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const makeHref = (pageNum: number) => {
    const parts: string[] = [];
    parts.push(`page=${pageNum}`);
    if (query && String(query).trim().length > 0) {
      parts.push(`query=${encodeURIComponent(query)}`);
    }
    if (sort) parts.push(`sort=${encodeURIComponent(sort)}`);
    return `?${parts.join("&")}`;
  };

  const handleNavigate = (href: string) => {
    startTransition(() => {
      router.push(href, {scroll: false});
    });
  };

  return (
    <div className="my-10">
      {isPending && (
        <div className="fixed inset-0 z-1000 bg-white/60 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/80 rounded-md shadow">
            <Spinner label="Loading..." />
          </div>
        </div>
      )}

      <Pagination aria-label="Pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={makeHref(currentPage - 1)}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                if (!isPending && currentPage > 1)
                  handleNavigate(makeHref(currentPage - 1));
              }}
              aria-disabled={isPending || currentPage <= 1}
              className={
                isPending || currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {Array.from({length: totalPages}, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href={makeHref(i + 1)}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (!isPending && currentPage !== i + 1)
                    handleNavigate(makeHref(i + 1));
                }}
                aria-current={currentPage === i + 1 ? "page" : undefined}
                className={
                  currentPage === i + 1
                    ? "bg-primary text-white"
                    : "bg-transparent"
                }
                aria-disabled={isPending}
                data-disabled={isPending}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > currentPage ? (
            <PaginationItem>
              <PaginationNext
                href={makeHref(currentPage + 1)}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  if (!isPending) handleNavigate(makeHref(currentPage + 1));
                }}
                aria-disabled={isPending}
                className={isPending ? "pointer-events-none opacity-50" : ""}
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
    </div>
  );
}
