/**
 * Data Table Component
 * 
 * A reusable, generic data table component built on TanStack React Table.
 * This component provides a fully-featured table with search, filtering, and
 * action buttons for creating new records.
 * 
 * Key Features:
 * - Generic/TypeScript generic for type-safe tables with any data type
 * - Built-in search/filter functionality
 * - Optional modal for creating records inline
 * - Optional link to create records in a new page
 * - Responsive design with proper styling
 * - Empty state handling
 * 
 * Usage:
 * Pass column definitions, data array, and configuration props.
 * The component handles all table rendering, filtering, and interactions.
 */

"use client";

// Custom components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "../dashboard/shared/custom-modal";

// Table components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Tanstack react table
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";

// Lucide icons
import { FilePlus2, Search } from "lucide-react";

// Modal provider hook
import { useModal } from "../../providers/modal-provider";
import Link from "next/link";

/**
 * Props interface for the DataTable component
 * 
 * @template TData - The type of data in each row
 * @template TValue - The type of values in the table (usually same as TData)
 * 
 * @param columns - Array of column definitions from TanStack React Table
 * @param data - Array of data objects to display in the table
 * @param filterValue - The accessor key of the column to filter by (e.g., "name")
 * @param actionButtonText - Text/content for the create button (opens modal)
 * @param modalChildren - React node to render inside the modal when creating new records
 * @param newTabLink - Optional URL to navigate to for creating records in a new page
 * @param searchPlaceholder - Placeholder text for the search input
 * @param heading - Optional heading for the modal
 * @param subheading - Optional subheading for the modal
 * @param noHeader - If true, hides the table header row
 */
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filterValue: string;
    actionButtonText?: React.ReactNode;
    modalChildren?: React.ReactNode;
    newTabLink?: string;
    searchPlaceholder: string;
    heading?: string;
    subheading?: string;
    noHeader?: true;
}

/**
 * DataTable Component
 * 
 * Generic table component that renders data with search, filtering, and action buttons.
 * Uses TanStack React Table for table functionality and state management.
 * 
 * @template TData - The type of data in each row
 * @template TValue - The type of values in the table
 * @param props - Component props
 * @returns JSX containing the search bar, action buttons, and table
 */
export default function DataTable<TData, TValue>({
    columns,
    data,
    filterValue,
    modalChildren,
    actionButtonText,
    searchPlaceholder,
    heading,
    subheading,
    noHeader,
    newTabLink,
}: DataTableProps<TData, TValue>) {
    // Modal state - used to open modal for creating new records
    const { setOpen } = useModal();

    /**
     * TanStack React Table instance
     * 
     * Configures the table with:
     * - data: The array of data to display
     * - columns: Column definitions (from columns.tsx files)
     * - getCoreRowModel: Provides basic row model functionality
     * - getFilteredRowModel: Enables filtering/search functionality
     */
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <>
            {/* Search input and action buttons section */}
            <div className="flex items-center justify-between">
                {/* Search input with icon */}
                <div className="flex items-center py-4 gap-2">
                    <Search />
                    <Input
                        placeholder={searchPlaceholder}
                        /**
                         * Get the current filter value from the table
                         * The filterValue prop specifies which column to filter
                         * Uses optional chaining and nullish coalescing for safety
                         */
                        value={
                            (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""
                        }
                        /**
                         * Update the filter value when user types
                         * This triggers the table's filtered row model to update
                         */
                        onChange={(event) =>
                            table.getColumn(filterValue)?.setFilterValue(event.target.value)
                        }
                        className="h-12"
                    />
                </div>
                {/* Action buttons section */}
                <div className="flex gap-2">
                    {/* 
                        Create button that opens a modal
                        Only renders if modalChildren prop is provided
                    */}
                    {modalChildren && (
                        <Button
                            className="flex- gap-2"
                            onClick={() => {
                                if (modalChildren)
                                    /**
                                     * Open modal with CustomModal wrapper
                                     * Passes heading, subheading, and modalChildren
                                     */
                                    setOpen(
                                        <CustomModal
                                            heading={heading || ""}
                                            subheading={subheading || ""}
                                        >
                                            {modalChildren}
                                        </CustomModal>
                                    );
                            }}
                        >
                            {actionButtonText}
                        </Button>
                    )}
                    {/* 
                        Link to create record in a new page
                        Only renders if newTabLink prop is provided
                        Alternative to modal-based creation
                    */}
                    {
                        newTabLink && <Link href={newTabLink}>
                            <Button variant="outline">
                                <FilePlus2 className="me-1" />Create in new page</Button>
                        </Link>
                    }
                </div>
            </div>

            {/* Table container with border and background */}
            <div className=" border bg-background rounded-lg">
                <Table className="">
                    {/* Table header row - conditionally rendered */}
                    {!noHeader && (
                        <TableHeader>
                            {/**
                             * Map through header groups (TanStack Table organizes headers)
                             * Each header group represents a row of headers
                             */}
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {/**
                                     * Map through individual headers in each group
                                     * flexRender is used to render the header content
                                     */}
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {/**
                                                 * Check if header is a placeholder (for grouped columns)
                                                 * If not, render the header using flexRender
                                                 * flexRender handles custom header components from column definitions
                                                 */}
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                    )}

                    {/* Table body with data rows */}
                    <TableBody>
                        {/**
                         * Check if there are any rows to display
                         * If rows exist, map through and render them
                         * Otherwise, show empty state message
                         */}
                        {table.getRowModel().rows.length ? (
                            /**
                             * Map through each row in the filtered table data
                             * Each row contains cells that need to be rendered
                             */
                            table.getRowModel().rows.map((row) => {
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {/**
                                         * Map through visible cells in each row
                                         * flexRender handles custom cell components from column definitions
                                         * This allows for custom rendering (like action buttons, images, etc.)
                                         */}
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="max-w-[400px] break-words"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            /**
                             * Empty state - shown when no rows match the filter/search
                             * Spans all columns and displays a centered message
                             */
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No Results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}