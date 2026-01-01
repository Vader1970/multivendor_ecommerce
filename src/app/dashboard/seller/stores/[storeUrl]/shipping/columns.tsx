/**
 * Shipping Rates Table Columns Configuration
 * 
 * This file defines the column structure for a data table that displays shipping rates
 * for different countries within a store. The table shows all countries with their
 * associated shipping rate configurations (if any).
 * 
 * Key Features:
 * - Displays country names and their shipping rate details
 * - Shows "Default" when no custom shipping rate is configured for a country
 * - Shows "Free" when shipping fees are set to 0
 * - Provides action menu to edit shipping rates for each country
 * - Integrates with modal provider to open edit forms
 * 
 * Table Structure:
 * - Each row represents a country with optional shipping rate data
 * - Columns display various shipping fee types and delivery information
 * - Actions column provides dropdown menu to edit shipping rates
 * 
 * Usage:
 * This columns array is used with TanStack React Table (via DataTable component)
 * to render a sortable, filterable table of shipping rates.
 * 
 * @see DataTable component for table rendering
 * @see ShippingRateDetails form component for editing
 */

"use client";

// React, Next.js imports
import { useParams } from "next/navigation";

// UI components
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks and utilities
import { useModal } from "@/providers/modal-provider";

// Lucide icons
import { Edit, MoreHorizontal } from "lucide-react";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { CountryWithShippingRatesType } from "@/lib/types";
import CustomModal from "@/components/dashboard/shared/custom-modal";
import ShippingRateDetails from "@/components/dashboard/forms/shippingRate-details";

/**
 * Table Columns Configuration
 * 
 * Defines all columns for the shipping rates table.
 * Each column specifies how data is accessed and displayed for each row.
 */
export const columns: ColumnDef<CountryWithShippingRatesType>[] = [
    /**
     * Country Name Column
     * Displays the name of the country (always present, no fallback needed)
     */
    {
        accessorKey: "countryName",
        header: "Country",
        cell: ({ row }) => {
            return <span>{row.original.countryName}</span>;
        },
    },
    /**
     * Shipping Service Column
     * Displays the shipping service name (e.g., "International Delivery", "Express Shipping")
     * Falls back to "Default" if no custom shipping rate is configured for this country
     */
    {
        accessorKey: "shippingService",
        header: "Shipping service",
        cell: ({ row }) => {
            return (
                <span>{row.original.shippingRate?.shippingService || "Default"}</span>
            );
        },
    },
    /**
     * Shipping Fee Per Item Column
     * Displays the base shipping fee charged for each item
     * Display logic:
     * - "Free" if value is exactly 0
     * - Actual numeric value if greater than 0
     * - "Default" if no custom shipping rate exists (value is undefined/null)
     */
    {
        accessorKey: "shippingFeePerItem",
        header: "Shipping Fee per item",
        cell: ({ row }) => {
            const value = row.original.shippingRate?.shippingFeePerItem;
            return (
                <span>{value === 0 ? "Free" : value > 0 ? value : "Default"}</span>
            );
        },
    },
    /**
     * Shipping Fee For Additional Item Column
     * Displays the fee charged for each item beyond the first one
     * Uses the same display logic as shippingFeePerItem
     */
    {
        accessorKey: "shippingFeeForAdditionalItem",
        header: "Shipping Fee for additional item",
        cell: ({ row }) => {
            const value = row.original.shippingRate?.shippingFeeForAdditionalItem;

            return (
                <span>
                    <span>{value === 0 ? "Free" : value > 0 ? value : "Default"}</span>
                </span>
            );
        },
    },
    /**
     * Shipping Fee Per Kilogram Column
     * Displays the weight-based shipping cost (fee per kilogram)
     * Uses the same display logic as other fee columns
     */
    {
        accessorKey: "shippingFeePerKg",
        header: "Shipping Fee per Kg",
        cell: ({ row }) => {
            const value = row.original.shippingRate?.shippingFeePerKg;

            return (
                <span>
                    <span>{value === 0 ? "Free" : value > 0 ? value : "Default"}</span>
                </span>
            );
        },
    },
    /**
     * Fixed Shipping Fee Column
     * Displays a flat shipping rate that doesn't depend on quantity or weight
     * Uses the same display logic as other fee columns
     */
    {
        accessorKey: "shippingFeeFixed",
        header: "Shipping Fee fixed",
        cell: ({ row }) => {
            const value = row.original.shippingRate?.shippingFeeFixed;

            return (
                <span>
                    <span>{value === 0 ? "Free" : value > 0 ? value : "Default"}</span>
                </span>
            );
        },
    },
    /**
     * Minimum Delivery Time Column
     * Displays the lower bound of the delivery time window (in days)
     * Shows the numeric value if a custom shipping rate exists, otherwise "Default"
     */
    {
        accessorKey: "deliveryTimeMin",
        header: "Delivery min days",
        cell: ({ row }) => {
            return (
                <span>
                    {row.original.shippingRate?.deliveryTimeMin
                        ? `${row.original.shippingRate?.deliveryTimeMin}`
                        : "Default"}
                </span>
            );
        },
    },
    /**
     * Maximum Delivery Time Column
     * Displays the upper bound of the delivery time window (in days)
     * Shows the numeric value if a custom shipping rate exists, otherwise "Default"
     */
    {
        accessorKey: "deliveryTimeMax",
        header: "Delivery max days",
        cell: ({ row }) => {
            return (
                <span>
                    {row.original.shippingRate?.deliveryTimeMax
                        ? `${row.original.shippingRate?.deliveryTimeMax}`
                        : "Default"}
                </span>
            );
        },
    },
    /**
     * Return Policy Column
     * Displays the return policy text for this country's shipping rate
     * Shows the policy text if a custom shipping rate exists, otherwise "Default"
     */
    {
        accessorKey: "returnPolicy",
        header: "Return policy",
        cell: ({ row }) => {
            return (
                <span>
                    {row.original.shippingRate?.returnPolicy
                        ? `${row.original.shippingRate?.returnPolicy}`
                        : "Default"}
                </span>
            );
        },
    },
    /**
     * Actions Column
     * Provides a dropdown menu with actions for each row (e.g., Edit shipping rate)
     * Renders the CellActions component which handles the action menu UI
     * Note: No accessorKey because this column doesn't display data, only actions
     */
    {
        id: "actions",
        cell: ({ row }) => {
            const rowData = row.original;

            return <CellActions rowData={rowData} />;
        },
    },
];

/**
 * CellActions Component Props Interface
 * 
 * @param rowData - The country data with optional shipping rate for the current table row
 */
interface CellActionsProps {
    rowData: CountryWithShippingRatesType;
}

/**
 * CellActions Component
 * 
 * Renders a dropdown menu button with actions for each table row.
 * Currently provides an "Edit Details" action that opens a modal form
 * to edit the shipping rate for the selected country.
 * 
 * Features:
 * - Three-dot menu button (MoreHorizontal icon) to trigger actions
 * - Dropdown menu with edit option
 * - Integrates with modal provider to open edit form
 * - Passes country data and store URL to the edit form
 * 
 * Implementation Notes:
 * - Uses AlertDialog wrapper (may not be necessary here, but kept for consistency)
 * - Modal is opened via setOpen() from useModal hook
 * - ShippingRateDetails form handles both create and edit modes based on data
 * 
 * @param rowData - Country data with optional shipping rate for the current row
 * @returns JSX containing the action menu button and dropdown
 */
const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
    // Get modal control functions from modal provider
    const { setOpen } = useModal();
    // Get store URL from route parameters (used to identify which store's rates to edit)
    const params = useParams<{ storeUrl: string }>();

    // Safety check: return null if rowData is missing (shouldn't happen, but prevents errors)
    if (!rowData) return null;

    return (
        <AlertDialog>
            <DropdownMenu>
                {/* Three-dot menu trigger button */}
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        {/* Screen reader accessible label */}
                        <span className="sr-only">Open menu</span>
                        {/* Three horizontal dots icon */}
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                {/* Dropdown menu content - aligned to the end (right side) */}
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {/* Edit Details menu item - opens modal with shipping rate form */}
                    <DropdownMenuItem
                        className="flex gap-2"
                        onClick={() => {
                            // Open modal with ShippingRateDetails form component
                            setOpen(
                                <CustomModal>
                                    <ShippingRateDetails
                                        data={rowData}
                                        storeUrl={params.storeUrl}
                                    />
                                </CustomModal>
                            );
                        }}
                    >
                        {/* Edit icon */}
                        <Edit size={15} />
                        Edit Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </AlertDialog>
    );
};
