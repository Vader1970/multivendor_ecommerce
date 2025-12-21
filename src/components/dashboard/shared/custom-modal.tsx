/**
 * Custom Modal Component
 * 
 * A reusable modal/dialog component that wraps the Radix UI Dialog component.
 * This component integrates with the modal provider to manage open/close state
 * and provides a consistent styling and behavior across the application.
 * 
 * Key Features:
 * - Integrates with modal provider for global state management
 * - Responsive design (full screen on mobile, max height on desktop)
 * - Scrollable content area for long forms
 * - Optional heading and subheading
 * - Can be controlled externally or use defaultOpen prop
 * 
 * Usage:
 * This component is typically used through the modal provider's setOpen function,
 * but can also be used directly with the defaultOpen prop for standalone modals.
 */

"use client";

// Provider
import { useModal } from "@/providers/modal-provider";

// UI components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

/**
 * Props interface for CustomModal component
 * 
 * @param heading - Optional title text displayed at the top of the modal
 * @param subheading - Optional description text displayed below the heading
 * @param children - The main content to display inside the modal (typically a form)
 * @param defaultOpen - Optional prop to control modal open state independently of provider
 */
type Props = {
    heading?: string;
    subheading?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

/**
 * CustomModal Component
 * 
 * Renders a modal dialog with optional heading and subheading.
 * The modal's open state is controlled by the modal provider, but can be
 * overridden with the defaultOpen prop for standalone usage.
 * 
 * @param props - Component props
 * @returns JSX containing the modal dialog
 */
const CustomModal = ({ children, defaultOpen, subheading, heading }: Props) => {
    // Get modal state from the modal provider
    // isOpen: current open state from provider
    // setClose: function to close the modal
    const { isOpen, setClose } = useModal();

    return (
        /**
         * Radix UI Dialog component
         * - open: controlled by provider's isOpen state OR defaultOpen prop
         * - onOpenChange: called when user tries to close (click outside, ESC key)
         */
        <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
            {/* 
                Dialog content container with responsive styling:
                - overflow-y-scroll: enables vertical scrolling for long content
                - md:max-h-[700px]: max height on medium screens and up
                - md:h-fit: auto height on medium screens and up
                - h-screen: full screen height on mobile
                - bg-card: uses theme's card background color
            */}
            <DialogContent className="overflow-y-scroll md:max-h-[700px] md:h-fit h-screen bg-card w-[95vw] max-w-[95vw] sm:max-w-[1200px] sm:rounded-lg">
                <DialogHeader className="pt-8 text-left">
                    {/* Conditionally render heading if provided */}
                    {heading && (
                        <DialogTitle className="text-2xl font-bold">{heading}</DialogTitle>
                    )}
                    {/* Conditionally render subheading if provided */}
                    {subheading && <DialogDescription>{subheading}</DialogDescription>}

                    {/* Main modal content (typically a form component) */}
                    {children}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default CustomModal;