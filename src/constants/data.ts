/**
 * Dashboard Navigation Configuration
 * 
 * This file contains the navigation menu configuration for the admin dashboard sidebar.
 * Each menu option represents a section or feature that administrators can access.
 * 
 * Usage:
 * - Imported in the Sidebar component to render the admin navigation menu
 * - Used by SidebarNavAdmin component to generate navigation links
 * - Icon values must match entries in the icons registry (@/constants/icons)
 */

import { DashboardSidebarMenuInterface } from "@/lib/types";

/**
 * Admin Dashboard Sidebar Navigation Options
 * 
 * Defines the menu items displayed in the admin dashboard sidebar navigation.
 * Each menu item consists of:
 * - label: The display text shown in the sidebar
 * - icon: The icon identifier that maps to an icon in the icons registry
 * - link: The route path where the menu item navigates to
 * 
 * The order of items in this array determines the order they appear in the sidebar.
 * 
 * @type {DashboardSidebarMenuInterface[]}
 */
export const adminDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
    {
        label: "Dashboard", // Main dashboard/home page label
        icon: "dashboard", // References DashboardIcon from icons registry
        link: "/dashboard/admin", // Route to the main admin dashboard page
    },
    {
        label: "Stores", // Store management section label
        icon: "store", // References StoreIcon from icons registry
        link: "/dashboard/admin/stores", // Route to store management page
    },
    {
        label: "Orders", // Order management section label
        icon: "box-list", // References BoxListIcon from icons registry
        link: "/dashboard/admin/orders", // Route to order management page
    },
    {
        label: "Categories", // Product categories management label
        icon: "categories", // References CategoriesIcon from icons registry
        link: "/dashboard/admin/categories", // Route to categories management page
    },
    {
        label: "Sub-Categories", // Sub-categories management label
        icon: "categories", // Reuses CategoriesIcon (could use a different icon in the future)
        link: "/dashboard/admin/subCategories", // Route to sub-categories management page
    },
    {
        label: "Offer Tags", // Special offer/promotion tags label
        icon: "offer", // References OfferIcon from icons registry
        link: "/dashboard/admin/offer-tags", // Route to offer tags management page
    },
    {
        label: "Coupons", // Discount coupons management label
        icon: "coupon", // References CouponIcon from icons registry
        link: "/dashboard/admin/coupons", // Route to coupons management page
    },
]

export const SellerDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
    {
        label: "Dashboard",
        icon: "dashboard",
        link: "",
    },
    {
        label: "Products",
        icon: "products",
        link: "products",
    },
    {
        label: "Orders",
        icon: "box-list",
        link: "orders",
    },
    {
        label: "Inventory",
        icon: "inventory",
        link: "inventory",
    },
    {
        label: "Coupons",
        icon: "coupon",
        link: "coupons",
    },
    {
        label: "Shipping",
        icon: "shipping",
        link: "shipping",
    },
    {
        label: "Settings",
        icon: "settings",
        link: "settings",
    },
];