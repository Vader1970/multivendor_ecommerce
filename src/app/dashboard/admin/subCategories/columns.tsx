/**
 * SubCategories Table Columns Configuration
 * 
 * This file defines the column structure for the subcategories data table.
 * It uses TanStack React Table (formerly React Table) to create a table with
 * columns for displaying subcategory information and action buttons.
 * 
 * Key Features:
 * - Displays subcategory image, name, URL, parent category, and featured status
 * - Provides edit and delete actions via dropdown menu
 * - Uses modals for editing and confirmation dialogs for deletion
 * - Fetches categories data needed for the edit form
 */

"use client";

// React, Next.js imports
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Custom components
import CustomModal from "@/components/dashboard/shared/custom-modal";
import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";

// UI components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks and utilities
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/providers/modal-provider";

// Lucide icons
import {
    BadgeCheck,
    BadgeMinus,
    Edit,
    MoreHorizontal,
    Trash,
} from "lucide-react";

// Queries
import { getAllCategories } from "@/queries/category";
import { deleteSubCategory, getSubCategory } from "@/queries/subCategory";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Prisma models
import { Category } from "@prisma/client";

//Types
import { SubCategoryWithCategoryType } from "@/lib/types";

/**
 * Column definitions for the subcategories table
 * Each object defines how a column should be rendered in the table
 * The 'cell' function receives the row data and returns JSX to render
 */
export const columns: ColumnDef<SubCategoryWithCategoryType>[] = [
    /**
     * Image Column
     * Displays the subcategory's image as a circular thumbnail
     * Uses Next.js Image component for optimized image loading
     */
    {
        accessorKey: "image",
        header: "", // Empty header for image column
        cell: ({ row }) => {
            return (
                <div className="relative h-44 min-w-64 rounded-xl overflow-hidden">
                    <Image
                        src={row.original.image}
                        alt=""
                        width={1000}
                        height={1000}
                        className="w-40 h-40 rounded-full object-cover shadow-2xl"
                    />
                </div>
            );
        },
    },
    /**
     * Name Column
     * Displays the subcategory name with bold, capitalized styling
     */
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <span className="font-extrabold text-lg capitalize">
                    {row.original.name}
                </span>
            );
        },
    },
    /**
     * URL Column
     * Displays the subcategory's URL slug with a leading slash
     * This is the URL-friendly identifier used in routes
     */
    {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => {
            return <span>/{row.original.url}</span>;
        },
    },
    /**
     * Category Column
     * Displays the parent category name that this subcategory belongs to
     * Accesses the nested category object from the row data
     */
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            return <span>{row.original.category.name}</span>;
        },
    },
    /**
     * Featured Column
     * Shows a visual indicator (checkmark or minus icon) for featured status
     * Green checkmark indicates featured, minus icon indicates not featured
     */
    {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) => {
            return (
                <span className="text-muted-foreground flex justify-center">
                    {row.original.featured ? (
                        <BadgeCheck className="stroke-green-300" />
                    ) : (
                        <BadgeMinus />
                    )}
                </span>
            );
        },
    },
    /**
     * Actions Column
     * Custom column that doesn't map to a data field
     * Renders the action buttons (edit/delete) for each row
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
 * Props interface for CellActions component
 * Receives the full row data for the subcategory being acted upon
 */
interface CellActionsProps {
    rowData: SubCategoryWithCategoryType;
}

/**
 * CellActions Component
 * 
 * Renders the action buttons (edit/delete) for each table row.
 * This component handles:
 * - Opening a modal to edit subcategory details
 * - Showing a confirmation dialog before deletion
 * - Fetching categories list needed for the edit form
 * - Managing loading states during async operations
 * 
 * Note: All React hooks must be called before any conditional returns
 * to comply with React's Rules of Hooks
 */
const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
    // Hooks - must be called before any conditional returns
    // Modal provider for opening/closing modals
    const { setOpen, setClose } = useModal();
    // Loading state to disable buttons during async operations
    const [loading, setLoading] = useState(false);
    // Toast notifications for user feedback
    const { toast } = useToast();
    // Router for refreshing the page after mutations
    const router = useRouter();

    // State to store categories list - needed for the edit form dropdown
    const [categories, setCategories] = useState<Category[]>([]);

    /**
     * Fetch all categories on component mount
     * Categories are needed in the edit form to allow changing the parent category
     */
    useEffect(() => {
        const fetchCategories = async () => {
            const categories = await getAllCategories();
            setCategories(categories);
        }
        fetchCategories();
    }, []);

    // Return null if rowData or rowData.id don't exist
    // This prevents errors when rendering rows with incomplete data
    if (!rowData || !rowData.id) return null;

    return (
        /**
         * AlertDialog wraps the entire component to provide delete confirmation
         * DropdownMenu provides the action buttons menu
         */
        <AlertDialog>
            {/* Dropdown menu with three horizontal dots icon */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {/* Edit action - opens modal with subcategory form */}
                    <DropdownMenuItem
                        className="flex gap-2"
                        onClick={() => {
                            /**
                             * Opens a modal with the SubCategoryDetails form component
                             * The second parameter is an async function that fetches fresh data
                             * This ensures the form has the latest data when opened
                             */
                            setOpen(
                                // Custom modal component
                                <CustomModal>
                                    {/* Subcategory form component with categories dropdown and existing data */}
                                    <SubCategoryDetails categories={categories} data={{ ...rowData }} />
                                </CustomModal>,
                                async () => {
                                    // Fetch fresh subcategory data when modal opens
                                    return {
                                        rowData: await getSubCategory(rowData?.id),
                                    };
                                }
                            );
                        }}
                    >
                        <Edit size={15} />
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Delete action - triggers confirmation dialog */}
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="flex gap-2" onClick={() => { }}>
                            <Trash size={15} /> Delete subCategory
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* Confirmation dialog for delete action */}
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        This action cannot be undone. This will permanently delete the
                        subCategory and related data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                    {/* Delete button - performs the actual deletion */}
                    <AlertDialogAction
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive mb-2 text-white"
                        onClick={async () => {
                            setLoading(true);
                            // Delete the subcategory from the database
                            await deleteSubCategory(rowData.id);
                            // Show success notification
                            toast({
                                title: "Deleted subCategory",
                                description: "The subCategory has been deleted.",
                            });
                            setLoading(false);
                            // Refresh the page to update the table
                            router.refresh();
                            // Close the modal/dialog
                            setClose();
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};