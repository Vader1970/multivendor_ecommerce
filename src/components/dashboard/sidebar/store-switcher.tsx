/**
 * Store Switcher Component
 * 
 * A dropdown/popover component that allows sellers to switch between their stores
 * or create a new store. This component is typically displayed in the sidebar
 * of the seller dashboard.
 * 
 * Features:
 * - Displays a button showing the currently active store
 * - Opens a searchable popover with a list of all stores
 * - Highlights the currently active store with a checkmark
 * - Provides a "Create Store" option at the bottom
 * - Navigates to the selected store's dashboard when clicked
 * 
 * Usage:
 * <StoreSwitcher stores={userStores} />
 * 
 * @component
 */

"use client";

// UI Components
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Utils
import { cn } from "@/lib/utils";

// Icons (from lucide-react)
import { Check, ChevronsUpDown, PlusCircle, StoreIcon } from "lucide-react";

// Next.js hooks for navigation and route params
import { useParams, useRouter } from "next/navigation";

// React hooks
import { FC, useState } from "react";

/**
 * Type definition for PopoverTrigger props
 * This extracts the component props from PopoverTrigger so we can extend them
 */
type PopoverTriggerProps = React.ComponentPropsWithoutRef<
    typeof PopoverTrigger
>;

/**
 * Props interface for StoreSwitcher component
 * 
 * @extends PopoverTriggerProps - Inherits all PopoverTrigger props (like className, etc.)
 * 
 * @property {Record<string, any>[]} stores - Array of store objects containing store data
 *   Each store object should have at least:
 *   - name: string (display name of the store)
 *   - url: string (URL slug used for routing, e.g., "my-store")
 */
interface StoreSwitcherProps extends PopoverTriggerProps {
    stores: Record<string, any>[];
}

/**
 * StoreSwitcher Component
 * 
 * Main component that renders a button and popover for switching between stores.
 * 
 * @param {StoreSwitcherProps} props - Component props
 * @param {Record<string, any>[]} props.stores - Array of store objects
 * @param {string} [props.className] - Optional additional CSS classes
 * @returns {JSX.Element} The rendered store switcher component
 */
const StoreSwitcher: FC<StoreSwitcherProps> = ({ stores, className }) => {
    // Get current route parameters (including storeUrl)
    // This allows us to detect which store is currently active
    const params = useParams();

    // Router instance for programmatic navigation
    const router = useRouter();

    /**
     * Transform the stores array into a simplified format for the dropdown
     * Maps each store object to an object with just label (name) and value (url)
     * This format is what the Command component expects
     * 
     * Example transformation:
     * { name: "My Store", url: "my-store", ... } 
     * => { label: "My Store", value: "my-store" }
     */
    const formattedItems = stores.map((store) => ({
        label: store.name,  // Display name in the dropdown
        value: store.url,   // URL slug used for routing
    }));

    /**
     * State to control whether the popover is open or closed
     * - true: popover is visible
     * - false: popover is hidden
     */
    const [open, setOpen] = useState(false);

    /**
     * Find the currently active store by comparing the store URL
     * with the storeUrl parameter from the current route
     * 
     * Returns undefined if no matching store is found
     */
    const activeStore = formattedItems.find(
        (store) => store.value === params.storeUrl
    );

    /**
     * Handler function called when a store is selected from the dropdown
     * 
     * @param {Object} store - The selected store object
     * @param {string} store.label - Display name of the store
     * @param {string} store.value - URL slug of the store
     */
    const onStoreSelect = (store: { label: string; value: string }) => {
        // Close the popover when a store is selected
        setOpen(false);

        // Navigate to the selected store's dashboard
        // Route format: /dashboard/seller/stores/{storeUrl}
        router.push(`/dashboard/seller/stores/${store.value}`);
    };

    return (
        /**
         * Popover component that wraps the entire store switcher
         * - Controlled by the 'open' state
         * - onOpenChange is called when the popover should open/close (e.g., clicking outside)
         */
        <Popover open={open} onOpenChange={setOpen}>
            {/* 
                Trigger button that opens the popover
                asChild prop merges the PopoverTrigger props with the Button component
            */}
            <PopoverTrigger asChild>
                <Button
                    variant="outline"      // Outlined button style
                    size="sm"              // Small button size
                    role="combobox"        // ARIA role for accessibility (combobox pattern)
                    aria-expanded={open}   // ARIA attribute indicating if popover is open
                    aria-label="Select a store"  // ARIA label for screen readers
                    className={cn("w-[250px] justify-between", className)}  // Fixed width with space-between layout
                >
                    {/* Store icon displayed before the store name */}
                    <StoreIcon className="mr-2 w-4 h-4" />

                    {/* Display the active store's name, or nothing if no store is active */}
                    {activeStore?.label}

                    {/* Chevron icon indicating this is a dropdown */}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            {/* 
                Popover content that appears when the button is clicked
                w-[250px] matches the button width for visual consistency
                p-0 removes default padding (Command component handles its own spacing)
            */}
            <PopoverContent className="w-[250px] p-0">
                {/* 
                    Command component provides searchable list functionality
                    This is a reusable component from shadcn/ui that handles:
                    - Search/filtering
                    - Keyboard navigation
                    - Selection handling
                */}
                <Command>
                    {/* 
                        First CommandList contains the store selection section
                        This list is scrollable and searchable
                    */}
                    <CommandList>
                        {/* 
                            Search input for filtering stores by name
                            As user types, the list is automatically filtered
                        */}
                        <CommandInput placeholder="Search stores..." />

                        {/* 
                            Displayed when search returns no matching results
                            This is shown inside the Command component when filtered list is empty
                        */}
                        <CommandEmpty>No Store Selected.</CommandEmpty>

                        {/* 
                            Group of stores with a heading
                            All store items are grouped under this heading
                        */}
                        <CommandGroup heading="Stores">
                            {/* 
                                Map through each store and render it as a selectable item
                                Each item can be clicked to switch to that store
                            */}
                            {formattedItems.map((store) => (
                                <CommandItem
                                    key={store.value}                    // Unique key for React (using store URL)
                                    onSelect={() => onStoreSelect(store)} // Handler when item is clicked/selected
                                    className="text-sm cursor-pointer"   // Small text with pointer cursor
                                >
                                    {/* Store icon for each store item */}
                                    <StoreIcon className="mr-2 w-4 h-4" />

                                    {/* Store name label */}
                                    {store.label}

                                    {/* 
                                        Checkmark icon that appears only for the active store
                                        - opacity-0 by default (hidden)
                                        - opacity-100 when this store matches the active store (visible)
                                        This provides visual feedback showing which store is currently selected
                                    */}
                                    <Check
                                        className={cn("ml-auto h-4 w-4 opacity-0", {
                                            "opacity-100": activeStore?.value === store.value,
                                        })}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>

                    {/* 
                        Visual separator between the store list and the "Create Store" option
                        This creates a clear distinction between switching stores and creating a new one
                    */}
                    <CommandSeparator />

                    {/* 
                        Second CommandList contains the "Create Store" action
                        This is separate from the stores list to keep the UI organized
                    */}
                    <CommandList>
                        {/* 
                            CommandItem for creating a new store
                            When clicked, navigates to the store creation page
                        */}
                        <CommandItem
                            className="cursor-pointer"
                            onSelect={() => {
                                // Close the popover
                                setOpen(false);

                                // Navigate to the new store creation page
                                router.push(`/dashboard/seller/stores/new`);
                            }}
                        >
                            {/* Plus circle icon indicating "add new" action */}
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create Store
                        </CommandItem>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default StoreSwitcher;
