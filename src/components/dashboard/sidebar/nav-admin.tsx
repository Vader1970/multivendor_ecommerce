"use client";

// React, Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

// UI Components
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

// Icons
import { icons } from "@/constants/icons";

// types
import { DashboardSidebarMenuInterface } from "@/lib/types";

// Utils
import { cn } from "@/lib/utils";

/**
 * SidebarNavAdmin Component
 * 
 * Renders the navigation menu for the admin dashboard sidebar.
 * Features:
 * - Searchable/filterable navigation links using Command component
 * - Active link highlighting based on current route
 * - Consistent hover effects for all links
 * - Icon support for each menu item
 * - Accessible navigation with proper ARIA attributes
 * 
 * @param {Object} props - Component props
 * @param {DashboardSidebarMenuInterface[]} props.menuLinks - Array of menu link objects containing label, icon, and link path
 */
export default function SidebarNavAdmin({
    menuLinks,
}: {
    menuLinks: DashboardSidebarMenuInterface[];
}) {
    // Get the current route pathname to determine which link is active
    const pathname = usePathname();

    return (
        <nav className="relative grow">
            {/* 
                Command component provides searchable/filterable functionality.
                It's a composable command menu that allows users to search through menu items.
                bg-transparent removes default background to blend with sidebar design.
            */}
            <Command className="rounded-lg overflow-visible bg-transparent">
                {/* Search input for filtering menu items */}
                <CommandInput placeholder="Search..." />

                {/* Scrollable list container for menu items */}
                <CommandList className="py-2 overflow-visible">
                    {/* Displayed when no menu items match the search query */}
                    <CommandEmpty>No Links Found.</CommandEmpty>

                    {/* Group containing all navigation menu items */}
                    <CommandGroup className="overflow-visible pt-0 relative">
                        {/* Map through each menu link and render a navigation item */}
                        {menuLinks.map((link, index) => {
                            // Determine if this link is the currently active route
                            // Active if pathname exactly matches OR if pathname starts with the link path
                            // (This handles nested routes - e.g., /dashboard/admin/stores is active when on /dashboard/admin/stores/123)
                            const isActive = pathname === link.link || pathname.startsWith(link.link + "/");

                            // Find the corresponding icon component from the icons registry
                            let icon;
                            const iconSearch = icons.find((icon) => icon.value === link.icon);
                            if (iconSearch) icon = <iconSearch.path />;

                            return (
                                <CommandItem
                                    key={index}
                                    className={cn(
                                        // Base styles: full width, fixed height, pointer cursor, margin top
                                        "w-full h-12 cursor-pointer mt-1",
                                        // Hover effect: Apply sidebar accent background and text color on hover for ALL items
                                        "hover:!bg-sidebar-accent hover:!text-sidebar-accent-foreground",
                                        // Active state: Apply sidebar accent background and text color persistently for active items
                                        // The !important (!) ensures these styles override default CommandItem hover/selected states
                                        isActive && "!bg-sidebar-accent !text-sidebar-accent-foreground"
                                    )}
                                >
                                    {/* Next.js Link component for client-side navigation */}
                                    <Link
                                        href={link.link}
                                        className="flex items-center gap-2 rounded-md transition-all w-full"
                                        // Accessibility: Mark the active link for screen readers
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        {/* Render the icon if found */}
                                        {icon}
                                        {/* Display the menu item label */}
                                        <span>{link.label}</span>
                                    </Link>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </Command>
        </nav>
    );
}
