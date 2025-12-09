"use client";

import { useTheme } from "next-themes";
//UI Component
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

//Icons
import { MoonIcon, SunIcon } from "lucide-react";

/**
 * ThemeToggle Component
 * 
 * A client-side component that provides a dropdown menu for switching between light, dark, and system themes.
 * 
 * Features:
 * - Animated icon transitions (sun/moon) that reflect the current theme
 * - Dropdown menu with three theme options: Light, Dark, and System
 * - Uses next-themes for theme management with persistent storage
 * - Accessible with screen reader support
 * 
 * How it works:
 * - The button displays a sun icon in light mode and a moon icon in dark mode
 * - Icons animate with rotation and scaling effects when theme changes
 * - Clicking the button opens a dropdown menu with theme options
 * - Theme preference is stored and persists across page reloads
 * 
 * @returns {JSX.Element} The theme toggle dropdown component
 */
export default function ThemeToggle() {
    // Get the setTheme function from next-themes hook
    // This allows us to programmatically change the theme
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            {/* 
                Trigger button that displays the theme icon
                Uses asChild to merge Button props with DropdownMenuTrigger
            */}
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    {/* 
                        Sun Icon - Visible in light mode
                        Animation: Starts at 0° rotation and full scale, 
                        rotates -90° and scales to 0 in dark mode
                        Smooth transition applies to all transform properties
                    */}
                    <SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

                    {/* 
                        Moon Icon - Visible in dark mode
                        Animation: Starts at 90° rotation and 0 scale (hidden),
                        rotates to 0° and scales to full size in dark mode
                        Absolutely positioned to overlay the sun icon
                        Smooth transition applies to all transform properties
                    */}
                    <MoonIcon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                    {/* Screen reader only text for accessibility */}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>

            {/* 
                Dropdown menu content
                Aligned to the end (right side) of the trigger button
            */}
            <DropdownMenuContent align="end">
                {/* 
                    Light theme option
                    Sets the theme to light mode when clicked
                */}
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>

                {/* 
                    Dark theme option
                    Sets the theme to dark mode when clicked
                */}
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>

                {/* 
                    System theme option
                    Follows the user's operating system theme preference
                    Automatically switches between light and dark based on OS settings
                */}
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}