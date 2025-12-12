import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@clerk/nextjs/server";

/**
 * UserInfo Component
 * 
 * Displays the current authenticated user's information in the dashboard sidebar.
 * Shows the user's avatar, full name, email address, and role-based dashboard badge.
 * 
 * Features:
 * - User avatar with fallback to initials
 * - User's full name and email address
 * - Role badge indicating the type of dashboard (Admin, Seller, etc.)
 * - Clickable button wrapper (can be extended for profile actions)
 * 
 * @param {Object} props - Component props
 * @param {User | null} props.user - The Clerk user object containing user information
 * 
 * @returns {JSX.Element | null} The user info component, or null if no user provided
 */
export default function UserInfo({ user }: { user: User | null }) {
    // Extract the user's role from Clerk's privateMetadata
    // Roles are typically stored as: "ADMIN", "SELLER", "USER", etc.
    // Convert to string and use optional chaining to handle null/undefined
    const role = user?.privateMetadata.role?.toString();

    return (
        <div>
            <div>
                {/* 
                    Main container button - uses ghost variant for minimal styling
                    Can be extended with onClick handler for profile actions/dropdown
                    Full width with vertical padding and margin for spacing
                    h-auto allows button to expand vertically for wrapped content
                    overflow-hidden ensures content stays within hover background
                */}
                <Button className="w-full mt-5 mb-4 flex items-start justify-start py-10 whitespace-normal h-auto overflow-hidden" variant="ghost">
                    {/* 
                        Container for avatar and user details
                        Flex layout with gap for spacing between avatar and text
                        min-w-0 allows flex item to shrink below content size for proper wrapping
                        w-full ensures it takes full width of button
                    */}
                    <div className="flex items-start text-left gap-2 min-w-0 flex-1 w-full overflow-hidden">
                        {/* 
                            User avatar component
                            Large size (64x64px / w-16 h-16) for prominent display
                            flex-shrink-0 prevents avatar from shrinking
                        */}
                        <Avatar className="w-16 h-16 flex-shrink-0">
                            {/* 
                                User's profile image from Clerk
                                Falls back to initials if image is not available
                            */}
                            <AvatarImage
                                src={user?.imageUrl}
                                alt={`${user?.firstName!} ${user?.lastName!}`}
                            />
                            {/* 
                                Fallback avatar showing user's initials
                                Displays when profile image is not available
                                Uses primary background color with white text
                            */}
                            <AvatarFallback className="bg-primary text-white">
                                {user?.firstName}
                                {user?.lastName}
                            </AvatarFallback>
                        </Avatar>

                        {/* 
                            User details container
                            Vertical flex layout with small gap between elements
                            min-w-0 and overflow-wrap allow text to wrap properly
                            w-full and overflow-hidden ensure content stays within bounds
                        */}
                        <div className="flex flex-col gap-y-1 min-w-0 flex-1 w-full overflow-hidden">
                            {/* User's full name */}
                            <span className="break-words w-full">{user?.firstName} {user?.lastName}</span>

                            {/* 
                                User's email address
                                Uses muted foreground color for secondary information
                                Displays the first email address from Clerk's emailAddresses array
                                break-all allows long email addresses to wrap to multiple lines
                                w-full ensures it respects container width
                            */}
                            <span className="text-xs text-muted-foreground break-all w-full">
                                {user?.emailAddresses[0].emailAddress}
                            </span>

                            {/* 
                                Role badge indicating dashboard type
                                Shows role in lowercase with "Dashboard" suffix
                                Example: "admin Dashboard", "seller Dashboard"
                                Uses secondary variant with capitalize class for styling
                            */}
                            <span className="w-fit">
                                <Badge variant="secondary" className="capitalize">
                                    {role?.toLowerCase()} Dashboard
                                </Badge>
                            </span>
                        </div>
                    </div>
                </Button>
            </div>
        </div>
    )
}

