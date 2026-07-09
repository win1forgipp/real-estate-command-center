"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/design-system/buttons/action-buttons";
import { FilterBar } from "@/components/design-system/search/filter-bar";
import { SearchInput } from "@/components/design-system/search/search-input";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { typography } from "@/lib/design-system/typography";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
};

export type RowAction<T> = {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
};

type DataTableProps<T extends { id: string }> = {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchable?: boolean;
  filterFn?: (row: T, query: string) => boolean;
  pageSize?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  rowActions?: RowAction<T>[];
  emptyMessage?: string;
  className?: string;
};

function defaultFilter<T>(row: T, query: string, columns: DataTableColumn<T>[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return columns.some((column) => {
    if (!column.accessorKey) {
      return false;
    }

    const value = row[column.accessorKey];
    return String(value ?? "")
      .toLowerCase()
      .includes(normalized);
  });
}

function getCellValue<T>(row: T, column: DataTableColumn<T>) {
  if (column.cell) {
    return column.cell(row);
  }

  if (column.accessorKey) {
    const value = row[column.accessorKey];
    return value == null ? "—" : String(value);
  }

  return "—";
}

function compareValues(left: unknown, right: unknown) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchable = true,
  filterFn,
  pageSize = 10,
  selectable = false,
  selectedIds = [],
  onSelectedIdsChange,
  rowActions = [],
  emptyMessage = "No records match your search.",
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const matches = data.filter((row) =>
      filterFn
        ? filterFn(row, query)
        : defaultFilter(row, query, columns),
    );

    if (!sortColumnId) {
      return matches;
    }

    const column = columns.find((item) => item.id === sortColumnId);
    if (!column?.accessorKey) {
      return matches;
    }

    const accessorKey = column.accessorKey;
    return [...matches].sort((left, right) => {
      const result = compareValues(left[accessorKey], right[accessorKey]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, data, filterFn, query, sortColumnId, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const visibleColumnCount =
    columns.filter((column) => !column.hideOnMobile).length +
    (selectable ? 1 : 0) +
    (rowActions.length ? 1 : 0);

  function toggleSort(columnId: string) {
    if (sortColumnId === columnId) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumnId(columnId);
    setSortDirection("asc");
  }

  function toggleRowSelection(rowId: string) {
    if (!onSelectedIdsChange) {
      return;
    }

    if (selectedIds.includes(rowId)) {
      onSelectedIdsChange(selectedIds.filter((id) => id !== rowId));
      return;
    }

    onSelectedIdsChange([...selectedIds, rowId]);
  }

  function toggleAllVisibleRows() {
    if (!onSelectedIdsChange) {
      return;
    }

    const visibleIds = pageRows.map((row) => row.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      onSelectedIdsChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    onSelectedIdsChange(Array.from(new Set([...selectedIds, ...visibleIds])));
  }

  const allVisibleSelected =
    pageRows.length > 0 &&
    pageRows.every((row) => selectedIds.includes(row.id));

  return (
    <section className={cn("space-y-4", className)}>
      {searchable ? (
        <FilterBar
          search={
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
            />
          }
        />
      ) : null}

      <div className="hidden rounded-2xl border border-border/70 bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable ? (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleAllVisibleRows}
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.hideOnMobile && "hidden lg:table-cell", column.className)}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 font-medium"
                      onClick={() => toggleSort(column.id)}
                    >
                      {column.header}
                      {sortColumnId === column.id ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="size-4" />
                        ) : (
                          <ArrowDown className="size-4" />
                        )
                      ) : (
                        <ArrowUpDown className="size-4 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {rowActions.length ? <TableHead className="w-12 text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedIds.includes(row.id) ? "selected" : undefined}
                >
                  {selectable ? (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={() => toggleRowSelection(row.id)}
                        aria-label={`Select row ${row.id}`}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(column.hideOnMobile && "hidden lg:table-cell", column.className)}
                    >
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {rowActions.length ? (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                          aria-label="Open row actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action) => (
                            <DropdownMenuItem
                              key={action.label}
                              variant={action.destructive ? "destructive" : "default"}
                              onClick={() => action.onSelect(row)}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                  <p className={typography.bodyMuted}>{emptyMessage}</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {pageRows.length ? (
          pageRows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                {selectable ? (
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onCheckedChange={() => toggleRowSelection(row.id)}
                    aria-label={`Select row ${row.id}`}
                  />
                ) : null}
                {rowActions.length ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                      aria-label="Open row actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {rowActions.map((action) => (
                        <DropdownMenuItem
                          key={action.label}
                          variant={action.destructive ? "destructive" : "default"}
                          onClick={() => action.onSelect(row)}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
              <dl className="mt-3 space-y-3">
                {columns
                  .filter((column) => !column.hideOnMobile)
                  .map((column) => (
                    <div key={column.id} className="flex flex-col gap-1">
                      <dt className={typography.caption}>{column.header}</dt>
                      <dd className={typography.body}>{getCellValue(row, column)}</dd>
                    </div>
                  ))}
              </dl>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card p-8 text-center">
            <p className={typography.bodyMuted}>{emptyMessage}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className={typography.caption}>
          Showing {pageRows.length ? (currentPage - 1) * pageSize + 1 : 0}–
          {(currentPage - 1) * pageSize + pageRows.length} of {filteredRows.length}
        </p>
        <div className="flex items-center gap-2">
          <SecondaryButton
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </SecondaryButton>
          <span className={typography.caption}>
            Page {currentPage} of {totalPages}
          </span>
          <PrimaryButton
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
