"use client";

import React, {useEffect, useRef, useState, useMemo} from "react";
import {ChevronDownIcon} from "lucide-react";

type Option = {value: string; label: React.ReactNode};
type Group = {label: string; options: Option[]};

type GroupedSelectProps = {
  groups: Group[];
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function GroupedSelect({
  groups,
  value = null,
  onChange,
  placeholder = "Select...",
  className = "",
}: GroupedSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const toggle = () => setOpen((v) => !v);

  const flatOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);

  const selected = flatOptions.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) {
      setActiveIndex(null);
      return;
    }

    // focus selected option index when opening
    const idx = flatOptions.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    // no portal: position is handled by CSS (absolute within relative root)
    listRef.current?.focus();
  }, [open, value, flatOptions]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      // If click is neither inside the trigger nor inside the portal list, close
      if (rootRef.current && rootRef.current.contains(target)) return;
      if (listRef.current && listRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // const toggle = () => setOpen((v) => !v);

  const selectIndex = (idx: number | null) => {
    if (idx == null) return;
    const opt = flatOptions[idx];
    if (!opt) return;
    onChange?.(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = i == null ? 0 : Math.min(flatOptions.length - 1, i + 1);
        return next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        const prev = i == null ? flatOptions.length - 1 : Math.max(0, i - 1);
        return prev;
      });
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex != null) selectIndex(activeIndex);
      return;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-block min-w-50 ${className}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-background border border-primary/30 shadow-sm text-sm text-foreground hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate">
          {selected ? (
            selected.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon className="ml-2 size-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          ref={listRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="listbox"
          aria-activedescendant={
            activeIndex != null ? `gs-opt-${activeIndex}` : undefined
          }
          className="absolute mt-2 w-full max-h-60 overflow-auto rounded-md bg-background border border-primary/30 shadow-lg focus:outline-none"
        >
          <div className="py-1">
            {groups.map((g) => (
              <div key={g.label} className="px-2 py-1">
                <div className="text-xs font-medium text-muted-foreground px-1 py-1 capitalize">
                  {g.label}
                </div>
                <div className="mt-1 rounded-md overflow-hidden">
                  {g.options.map((o) => {
                    const idx = flatOptions.findIndex(
                      (fo) => fo.value === o.value,
                    );
                    const isActive = idx === activeIndex;
                    const isSelected = value === o.value;
                    return (
                      <div
                        id={`gs-opt-${idx}`}
                        key={o.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectIndex(idx)}
                        className={`px-2 py-2 cursor-pointer text-sm flex items-center gap-2 ${isActive ? "bg-primary/10" : ""} ${isSelected ? "font-semibold" : ""}`}
                      >
                        <span className="truncate">{o.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type {Option, Group};
