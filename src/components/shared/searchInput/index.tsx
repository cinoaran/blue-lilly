"use client";

import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

const SearchInput = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    const params = new URLSearchParams(window.location.search);
    if (trimmedQuery) {
      params.set("query", trimmedQuery);
      router.push(`/search?${params.toString()}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <form
      className="w-full relative flex items-center justify-between"
      onSubmit={handleSearch}
    >
      <Input
        type="search"
        placeholder="Search..."
        className="border-[0.3px] ring-1 ring-inset ring-primary placeholder:italic placeholder:text-foreground/50 webkit-search-cancel-button:appearance-none border-border pr-10 overflow-hidden"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        className="flex items-center justify-center rounded-tl-none rounded-bl-none rounded-bl-0 rounded-br-0 rounded-tr-0 absolute top-1/2 right-0 -translate-y-1/2 w-12 h-8.5 hover:scale-110 transition-transform"
      >
        <Search size={22} className="text-white" />
      </Button>
    </form>
  );
};

export default SearchInput;
