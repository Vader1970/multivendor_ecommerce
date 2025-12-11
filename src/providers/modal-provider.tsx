/**
 * Modal Provider
 * 
 * A React Context Provider that manages global modal state across the application.
 * This provider allows any component to open/close modals and pass data to them
 * without prop drilling.
 * 
 * Key Features:
 * - Global modal state management using React Context
 * - Support for async data fetching before opening modals
 * - Prevents hydration issues with client-side only rendering
 * - Type-safe modal data storage
 * 
 * Usage:
 * 1. Wrap your app with <ModalProvider>
 * 2. Use useModal() hook in any component to open/close modals
 * 3. Pass React components as modals and optional async data fetchers
 * 
 * Example:
 * const { setOpen } = useModal();
 * setOpen(<MyModal />, async () => ({ data: await fetchData() }));
 */

"use client";

// React, Next.js
import { createContext, useContext, useEffect, useState } from "react";

// Prisma models
import { User } from "@prisma/client";

/**
 * Props interface for ModalProvider component
 */
interface ModalProviderProps {
    children: React.ReactNode;
}

/**
 * Modal Data Type
 * 
 * Defines the structure of data that can be passed to modals.
 * Currently supports user data, but can be extended for other types.
 * This data is available to modal components via the useModal hook.
 */
export type ModalData = {
    user?: User;
};

/**
 * Modal Context Type
 * 
 * Defines the shape of the context value provided by ModalProvider.
 * This includes:
 * - data: Any data passed to the modal
 * - isOpen: Current open/closed state
 * - setOpen: Function to open a modal with optional data fetching
 * - setClose: Function to close the modal and clear data
 */
type ModalContextType = {
    data: ModalData;
    isOpen: boolean;
    setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
    setClose: () => void;
};

/**
 * Modal Context
 * 
 * React Context for modal state management.
 * Provides default values that will be overridden by the provider.
 */
export const ModalContext = createContext<ModalContextType>({
    data: {},
    isOpen: false,
    setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => { },
    setClose: () => { },
});

/**
 * ModalProvider Component
 * 
 * Context provider that manages global modal state.
 * 
 * State Management:
 * - isOpen: Controls whether a modal is currently visible
 * - data: Stores data to be passed to modal components
 * - showingModal: Stores the React component to render as the modal
 * - isMounted: Prevents hydration issues by only rendering on client
 * 
 * Features:
 * - Supports async data fetching before opening modals
 * - Handles client-side only rendering to prevent SSR issues
 * - Renders modal components outside the main component tree
 */
const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    // State for modal visibility
    const [isOpen, setIsOpen] = useState(false);
    // State for data to pass to modals
    const [data, setData] = useState<ModalData>({});
    // State for the modal component to render
    const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
    // State to track if component is mounted (client-side only)
    const [isMounted, setIsMounted] = useState(false);

    /**
     * Set mounted state on client-side only
     * This prevents hydration mismatches between server and client
     * Modals should only render on the client
     */
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * Open Modal Function
     * 
     * Opens a modal and optionally fetches data before displaying it.
     * 
     * @param modal - React component to render as the modal
     * @param fetchData - Optional async function to fetch data before opening
     * 
     * Flow:
     * 1. If fetchData is provided, execute it and store the result
     * 2. Store the modal component to render
     * 3. Set isOpen to true to trigger modal display
     */
    const setOpen = async (
        modal: React.ReactNode,
        fetchData?: () => Promise<any>
    ) => {
        if (modal) {
            // If fetchData is provided, execute it and merge results into data state
            if (fetchData) {
                const fetchedData = await fetchData();
                setData({ ...data, ...(fetchedData || {}) });
            }
            // Store the modal component to render
            setShowingModal(modal);
            // Open the modal
            setIsOpen(true);
        }
    };

    /**
     * Close Modal Function
     * 
     * Closes the modal and clears all associated data.
     * This ensures a clean state when opening the next modal.
     */
    const setClose = () => {
        setIsOpen(false);
        setData({});
    };

    /**
     * Prevent rendering on server to avoid hydration issues
     * Modals are client-side only components
     */
    if (!isMounted) return null;

    return (
        /**
         * Provide modal context to all children
         * Render children normally
         * Render modal component outside main tree (at provider level)
         */
        <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
            {children}
            {showingModal}
        </ModalContext.Provider>
    );
};

/**
 * useModal Hook
 * 
 * Custom hook to access modal context.
 * Must be used within a component tree wrapped by ModalProvider.
 * 
 * @returns ModalContext value with data, isOpen, setOpen, and setClose
 * @throws Error if used outside of ModalProvider
 * 
 * Usage:
 * const { setOpen, setClose, isOpen, data } = useModal();
 */
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within the modal provider");
    }
    return context;
};

export default ModalProvider;