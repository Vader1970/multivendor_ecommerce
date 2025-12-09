/**
 * Icons Registry
 * 
 * This file serves as a centralized registry for all dashboard icons used throughout the application.
 * Icons are organized as an array of objects, making them easy to search and reference by value.
 * 
 * Usage:
 * - Import icons from this file: `import { icons } from "@/constants/icons"`
 * - Find an icon by value: `icons.find(icon => icon.value === "dashboard")`
 * - Use the icon component: `<icon.path />`
 * 
 * Icon Object Structure:
 * - label: Human-readable name for the icon (used for display/accessibility)
 * - value: Unique identifier/key used to reference the icon (used for searching/matching)
 * - path: The actual React component for the icon
 */

import { BoxesIcon, DashboardIcon, StoreIcon, CreateStoreIcon, BoxListIcon, SettingsIcon, CategoriesIcon, ThreeBoxesIcon, ProductsIcon, InventoryIcon, CouponIcon, ShippingIcon, OfferIcon } from "@/components/dashboard/icons";

/**
 * Icons registry array
 * 
 * Contains all available icons for the dashboard navigation and UI elements.
 * Each icon entry can be looked up by its `value` property to retrieve the corresponding React component.
 * 
 * @type {Array<{label: string, value: string, path: React.ComponentType}>}
 */
export const icons = [
    {
        label: "Boxes", // Display name for the icon
        value: "boxes", // Unique identifier for this icon (used for lookup)
        path: BoxesIcon, // React component to render the icon
    },
    {
        label: "Dashboard", // Main dashboard/home icon
        value: "dashboard", // Used by admin dashboard navigation
        path: DashboardIcon,
    },
    {
        label: "Store", // Store/shop icon for store-related features
        value: "store", // Used by store management navigation
        path: StoreIcon,
    },
    {
        label: "Create Store", // Icon for creating a new store
        value: "create-store", // Used for store creation actions
        path: CreateStoreIcon,
    },
    {
        label: "Box List", // Icon representing a list of boxes/items
        value: "box-list", // Used for order/item lists
        path: BoxListIcon,
    },
    {
        label: "Settings", // Settings/configuration icon
        value: "settings", // Used for settings pages
        path: SettingsIcon,
    },
    {
        label: "Categories", // Category management icon
        value: "categories", // Used by admin category navigation
        path: CategoriesIcon,
    },
    {
        label: "Three Boxes", // Alternative boxes icon variant
        value: "three-boxes", // Used for sub-categories or grouped items
        path: ThreeBoxesIcon,
    },
    {
        label: "Products", // Product/item icon
        value: "products", // Used for product management pages
        path: ProductsIcon,
    },
    {
        label: "Inventory", // Inventory/stock management icon
        value: "inventory", // Used for inventory tracking pages
        path: InventoryIcon,
    },
    {
        label: "Coupon", // Discount coupon icon
        value: "coupon", // Used by admin coupons navigation
        path: CouponIcon,
    },
    {
        label: "Shipping", // Shipping/delivery icon
        value: "shipping", // Used for shipping-related pages
        path: ShippingIcon,
    },
    {
        label: "Offer", // Special offer/promotion icon
        value: "offer", // Used by admin offer tags navigation
        path: OfferIcon,
    },
]