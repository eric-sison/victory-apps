import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TTable,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings2,
  X,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@workspace/ui/components/Button"
import { Checkbox } from "@workspace/ui/components/Checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/DropdownMenu"
import { Input } from "@workspace/ui/components/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/Table"

// ─── Column Header ────────────────────────────────────────────────────────────
// Export so consumers can use it in their column defs for consistent sort UI.

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`-ml-3 h-8 data-[state=open]:bg-accent ${className ?? ""}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 size-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 size-4" />
      ) : (
        <ArrowUpDown className="ml-2 size-4 opacity-40" />
      )}
    </Button>
  )
}

// ─── Select-All Checkbox Column ───────────────────────────────────────────────
// A pre-built column def for row selection. Add it to the start of your columns.
//
// Usage:
//   import { selectionColumn } from "./DataTable"
//   const columns = [selectionColumn<Payment>(), ...rest]

export function selectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  }
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface DataTableToolbarProps<TData> {
  table: TTable<TData>
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search all columns…"
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters()
              onGlobalFilterChange("")
            }}
          >
            Reset
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* Column visibility toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <Settings2 className="mr-2 size-4" />
          View
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((col) => col.getCanHide())
            .map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className="capitalize"
                checked={col.getIsVisible()}
                onCheckedChange={(value) => col.toggleVisibility(!!value)}
              >
                {/* Prefer a display name from column meta, fall back to id */}
                {(col.columnDef.meta as { displayName?: string } | undefined)?.displayName ?? col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface DataTablePaginationProps<TData> {
  table: TTable<TData>
}

function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {selectedCount > 0 ? (
          <>
            <span className="font-medium text-foreground">{selectedCount}</span> of {totalCount} row(s)
            selected
          </>
        ) : (
          <>{totalCount} row(s)</>
        )}
      </p>

      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="h-8 w-17.5 justify-between" />}
            >
              {table.getState().pagination.pageSize}
              <ChevronDown className="size-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[10, 20, 30, 50, 100].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onSelect={() => table.setPageSize(size)}
                  className={table.getState().pagination.pageSize === size ? "bg-accent" : ""}
                >
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page counter */}
        <p className="text-sm font-medium whitespace-nowrap">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </p>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="size-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="size-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  /**
   * SSR / server-side mode
   *
   * Set manualSorting/manualFiltering/manualPagination to true when the server
   * handles those operations. Pass the current state as controlled props and
   * respond to changes via the onXxxChange callbacks (typically by updating
   * TanStack Router search params, which re-runs the loader).
   *
   * Example with TanStack Router:
   *
   *   const { pagination, sorting } = Route.useSearch()
   *   const navigate = useNavigate()
   *
   *   <DataTable
   *     data={loaderData}
   *     columns={columns}
   *     pageCount={loaderData.pageCount}
   *     manualPagination
   *     manualSorting
   *     pagination={pagination}
   *     sorting={sorting}
   *     onPaginationChange={(updater) => {
   *       const next = typeof updater === "function" ? updater(pagination) : updater
   *       navigate({ search: (prev) => ({ ...prev, ...next }) })
   *     }}
   *   />
   */
  pageCount?: number

  manualSorting?: boolean
  manualFiltering?: boolean
  manualPagination?: boolean

  // Controlled state — provide these when using manual/SSR mode
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  globalFilter?: string
  pagination?: PaginationState
  columnVisibility?: VisibilityState
  rowSelection?: RowSelectionState

  // Change callbacks — provide these when using manual/SSR mode
  onSortingChange?: OnChangeFn<SortingState>
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  onGlobalFilterChange?: OnChangeFn<string>
  onPaginationChange?: OnChangeFn<PaginationState>
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  manualSorting = false,
  manualFiltering = false,
  manualPagination = false,
  sorting: controlledSorting,
  columnFilters: controlledColumnFilters,
  globalFilter: controlledGlobalFilter,
  pagination: controlledPagination,
  columnVisibility: controlledColumnVisibility,
  rowSelection: controlledRowSelection,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onPaginationChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  // Internal state — only used when not in controlled/SSR mode
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("")
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})

  // Resolve: prefer controlled props, fall back to internal state
  const sorting = controlledSorting ?? internalSorting
  const columnFilters = controlledColumnFilters ?? internalColumnFilters
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const pagination = controlledPagination ?? internalPagination
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility
  const rowSelection = controlledRowSelection ?? internalRowSelection

  const table = useReactTable({
    data,
    columns,
    // Only forward pageCount when caller provided it (manual pagination)
    ...(pageCount !== undefined ? { pageCount } : {}),

    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
      rowSelection,
    },

    // Sorting
    manualSorting,
    onSortingChange: onSortingChange ?? setInternalSorting,
    getSortedRowModel: getSortedRowModel(),

    // Filtering
    manualFiltering,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),

    // Pagination
    manualPagination,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getPaginationRowModel: getPaginationRowModel(),

    // Core
    getCoreRowModel: getCoreRowModel(),

    // Visibility & selection
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    enableRowSelection: true,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={onGlobalFilterChange ?? setInternalGlobalFilter}
      />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
