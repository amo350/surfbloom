"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  enableSelection?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onSelectionChange,
  enableSelection = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const prevSelectionRef = useRef<string>("");

  // Create a stable key that changes when data changes
  const dataKey = useMemo(
    () => data.map((row) => (row as { id?: string }).id ?? "").join(","),
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  // Notify parent of selection changes (with deduplication)
  useEffect(() => {
    if (!onSelectionChange) return;

    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);

    const selectionKey = JSON.stringify(Object.keys(rowSelection).sort());

    if (selectionKey !== prevSelectionRef.current) {
      prevSelectionRef.current = selectionKey;
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onSelectionChange]);

  // Clear selection when data changes (e.g., after filter)
  // biome-ignore lint/correctness/useExhaustiveDependencies: dataKey tracks data identity
  useEffect(() => {
    setRowSelection({});
    prevSelectionRef.current = "";
  }, [dataKey]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
