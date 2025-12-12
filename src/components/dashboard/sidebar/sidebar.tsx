//React
import { FC } from "react";

//Clerk
import { currentUser } from "@clerk/nextjs/server";

//Custome UI Components
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./nav-admin";
import SidebarNavSeller from "./nav-seller";

//Menu Links
import { adminDashboardSidebarOptions, SellerDashboardSidebarOptions } from "@/constants/data";

//Prisma Modals
import { Store } from "@prisma/client";

/**
 * Props interface for the Sidebar component
 */
interface SidebarProps {
    /**
     * Optional flag to determine if this sidebar should display admin-specific navigation.
     * When true, the admin navigation menu will be rendered.
     */
    isAdmin?: boolean;
    /**
     * Optional list of stores associated with the authenticated user.
     * When provided, the sidebar will display navigation links for each store.
     */
    stores?: Store[];
}

/**
 * Sidebar Component
 * 
 * A server component that renders the main sidebar navigation for the dashboard.
 * This sidebar is fixed to the left side of the screen and contains:
 * - Application logo/branding
 * - Current user information (when authenticated)
 * - Admin-specific navigation menu (when isAdmin is true)
 * 
 * Features:
 * - Server-side rendered using Next.js server components
 * - Fetches current user data from Clerk authentication
 * - Conditionally renders admin navigation based on props
 * - Fixed positioning for persistent visibility during page navigation
 * 
 * @param {SidebarProps} props - Component props
 * @param {boolean} [props.isAdmin] - Whether to show admin navigation menu
 * @returns {Promise<JSX.Element>} The rendered sidebar component
 */
const Sidebar: FC<SidebarProps> = async ({ isAdmin }) => {
    // Fetch the currently authenticated user from Clerk
    // This is an async server-side operation, so the component must be async
    const user = await currentUser();

    return (
        <div className="w-[300px] border-r h-screen p-4 flex flex-col fixed top-0 left-0 bottom-0">
            {/* 
                Main sidebar container:
                - Fixed width of 300px
                - Right border for visual separation
                - Full screen height
                - Padding for internal spacing
                - Flex column layout for vertical stacking
                - Fixed positioning (stays in place during scroll)
                - Anchored to top, left, and bottom of viewport
            */}

            {/* 
                Application logo component
                Takes full width and fixed height of 180px
            */}
            <Logo width="100%" height="180px" />

            {/* Spacer element to add margin between logo and user info */}
            <span className="mt-3" />

            {/* 
                Conditionally render user information section
                Only displays if user is authenticated (user exists)
                Passes the user object to display name, email, and avatar
            */}
            {user && <UserInfo user={user} />}

            {/* 
                Conditionally render admin navigation menu
                Only displays if isAdmin prop is true
                Passes the admin dashboard menu links configuration
                This includes links like Dashboard, Stores, Orders, Categories, etc.
            */}
            {isAdmin ? (
                <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
            ) : (
                <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />
            )}
        </div>
    )
};

export default Sidebar;