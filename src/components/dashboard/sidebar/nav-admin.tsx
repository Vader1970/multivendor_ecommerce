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
 * Renders a searchable navigation sidebar for the admin dashboard.
 * This component displays a list of menu links with icons, highlights the active route,
 * and provides search functionality to filter navigation items.
 * 
 * @param menuLinks - Array of navigation menu items, each containing:
 *   - label: Display text for the menu item
 *   - icon: Icon identifier string (used to lookup icon component)
 *   - link: URL path for navigation
 */
export default function SidebarNavAdmin({
    menuLinks,
}: {
    menuLinks: DashboardSidebarMenuInterface[];
}) {
    // Get the current pathname from Next.js router
    // This hook returns the current route path (e.g., "/dashboard/admin/categories")
    // We use this to determine which navigation item should be highlighted as active
    const pathname = usePathname();

    return (
        <nav className="relative grow">
            {/* Command component provides searchable list functionality */}
            {/* overflow-visible allows dropdowns/tooltips to extend beyond container */}
            <Command className="rounded-lg overflow-visible bg-transparent">
                {/* Search input to filter navigation items */}
                <CommandInput placeholder="Search..." />

                {/* Container for the list of navigation items */}
                <CommandList className="py-2 overflow-visible">
                    {/* Displayed when search returns no matching results */}
                    <CommandEmpty>No Links Found.</CommandEmpty>

                    {/* Group containing all navigation menu items */}
                    <CommandGroup className="overflow-visible pt-0 relative">
                        {/* Map through each menu link to render navigation items */}
                        {menuLinks.map((link: DashboardSidebarMenuInterface, index: number) => {
                            // Determine if this link is the currently active route
                            // Compares the link's path with the current pathname
                            // Exact match means this is the active page
                            const isActive = pathname === link.link;

                            // Look up the icon component from the icons registry
                            // The link.icon is a string identifier (e.g., "dashboard", "categories")
                            // We search the icons array to find a matching icon by its value property
                            const iconSearch = icons.find((icon) => icon.value === link.icon);

                            // If icon is found, render it as a React component
                            // If not found, render null (no icon will be displayed)
                            // iconSearch.path is the actual React component (e.g., DashboardIcon)
                            const icon = iconSearch ? <iconSearch.path /> : null;

                            return (
                                // CommandItem wraps each navigation link
                                // p-0 removes default padding since we handle spacing in the Link
                                // data-[selected]:... overrides the default "sticky" selected/background
                                // state from shadcn/ui CommandItem so that only our Link styles
                                // control the active/hover appearance.
                                <CommandItem
                                    key={index}
                                    className="p-0 data-[selected]:bg-transparent data-[selected]:text-foreground"
                                >
                                    {/* Next.js Link component for client-side navigation */}
                                    <Link
                                        href={link.link}
                                        className={cn(
                                            // Base styles: flex layout with gap, full width, fixed height, padding, rounded corners, smooth transitions
                                            "flex items-center gap-2 w-full h-12 px-3 rounded-md transition-colors",
                                            {
                                                // Active state: highlighted background and foreground color
                                                // Only applied when isActive is true (current route matches link)
                                                "bg-muted text-foreground": isActive,

                                                // Hover state: subtle background on hover
                                                // Only applied when NOT active (prevents hover effect on active item)
                                                "hover:bg-muted": !isActive
                                            }
                                        )}
                                    >
                                        {/* Render the icon component (or null if not found) */}
                                        {icon}

                                        {/* Display the menu item label text */}
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