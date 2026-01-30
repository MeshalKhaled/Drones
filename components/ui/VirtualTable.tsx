"use client";

import { FixedSizeList as List } from "react-window";
import { useMemo } from "react";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  width: number | string;
  render: (item: T) => React.ReactNode;
}

interface VirtualTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;
  headerHeight?: number; // Reserved for future use (sticky header height)
  className?: string;
  ariaLabel?: string;
}

export function VirtualTable<T>({
  columns,
  data,
  rowHeight = 52,
  headerHeight: _headerHeight = 40, // Reserved for future sticky header
  className,
  ariaLabel,
}: VirtualTableProps<T>) {
  // Calculate column widths (convert percentage strings to numbers)
  const columnWidths = useMemo(() => {
    return columns.map((col) => {
      if (typeof col.width === "string" && col.width.endsWith("%")) {
        // For percentage widths, we'll use a fixed total width calculation
        // This is a simplified approach - in production you'd want responsive handling
        return 200; // Default fallback
      }
      return typeof col.width === "number" ? col.width : 150;
    });
  }, [columns]);

  const totalWidth = useMemo(() => {
    return columnWidths.reduce((sum, width) => sum + width, 0);
  }, [columnWidths]);

  // Row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;
    return (
      <div
        style={style}
        className="flex border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
        role="row"
      >
        {columns.map((col, colIndex) => (
          <div
            key={col.key}
            style={{ width: columnWidths[colIndex], flexShrink: 0 }}
            className="px-4 py-3"
            role="cell"
          >
            {col.render(item)}
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className={className} role="table" aria-label={ariaLabel}>
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} role="table" aria-label={ariaLabel}>
      {/* Header */}
      <div
        className="flex border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
        role="rowgroup"
      >
        <div role="row" className="flex w-full">
          {columns.map((col, colIndex) => (
            <div
              key={col.key}
              style={{ width: columnWidths[colIndex], flexShrink: 0 }}
              className="px-4 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-400"
              role="columnheader"
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized body */}
      <List
        height={Math.min(data.length * rowHeight, 600)} // Max height 600px
        itemCount={data.length}
        itemSize={rowHeight}
        width={totalWidth}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
}
