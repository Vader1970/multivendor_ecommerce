/**
 * Image Upload Component
 * 
 * A reusable component for uploading images to Cloudinary and displaying image previews.
 * This component handles the integration with Cloudinary's upload widget and provides
 * a user-friendly interface for image selection and upload.
 * 
 * Features:
 * - Cloudinary integration for image hosting
 * - Image preview display
 * - Support for different image types (profile, standard, cover)
 * - Client-side only component (uses "use client" directive)
 */

"use client";

// React, Next.js
import { FC, useEffect, useState } from "react";
import Image from "next/image";

// Cloudinary
import { CldUploadWidget } from "next-cloudinary";

// Shadcn/UI
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

/**
 * Props interface for the ImageUpload component
 * 
 * @param disabled - Whether the upload button should be disabled (e.g., during form submission)
 * @param onChange - Callback function called when an image is successfully uploaded (receives the image URL)
 * @param onRemove - Callback function called when an image should be removed (receives the image URL to remove)
 * @param value - Array of image URLs currently displayed (for preview purposes)
 * @param type - The type of image upload UI to render ("profile", "standard", or "cover")
 * @param dontShowPreview - Optional flag to hide the image preview (currently not implemented)
 * @param cloudinary_key - The Cloudinary upload preset key for authentication
 */
interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
    type: "standard" | "profile" | "cover";
    dontShowPreview?: boolean;
    // cloudinary_key: string;
}

/**
 * ImageUpload Component
 * 
 * Main component that renders the image upload interface. Currently implements
 * the "profile" type which displays a circular image with an upload button overlay.
 * 
 * Note: The component uses a mounting check to prevent hydration mismatches
 * between server and client rendering (Cloudinary widget is client-only).
 */
const ImageUpload: FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    type,
    dontShowPreview,

    // cloudinary_key,
}) => {
    /**
     * State to track if component has mounted on the client
     * 
     * This is necessary because Cloudinary's upload widget only works on the client side.
     * We need to prevent rendering it during server-side rendering to avoid hydration errors.
     */
    const [isMounted, setIsMounted] = useState(false);

    /**
     * Effect to set mounted state after component mounts on client
     * 
     * This ensures the Cloudinary widget only renders after the component
     * has been mounted in the browser, preventing SSR/hydration issues.
     */
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Return null during SSR to prevent hydration mismatches
    if (!isMounted) {
        return null;
    }

    /**
     * Callback function called when Cloudinary upload succeeds
     * 
     * @param result - The result object from Cloudinary containing upload information
     *                 The secure_url property contains the uploaded image's URL
     */
    const onUpload = (result: any) => {
        console.log("result", result);
        // Extract the secure URL from the upload result and notify parent component
        onChange(result.info.secure_url);
    };

    /**
     * Render profile-type image upload UI
     * 
     * This renders a circular image container with:
     * - A preview of the current image (if one exists)
     * - An upload button overlay positioned at the bottom-right
     * - Styling for a profile picture appearance
     */
    if (type === "profile") {
        return (
            <div className="relative rounded-full w-52 h-52  bg-gray-200 border-2 border-white shadow-2xl overflow-visible">
                {/* 
                    Conditionally render image preview if an image URL exists
                    The image is displayed as a circular profile picture
                */}
                {value.length > 0 && (
                    <Image
                        src={value[0]}
                        alt=""
                        width={300}
                        height={300}
                        className="w-52 h-52 rounded-full object-cover absolute top-0 left-0 bottom-0 right-0"
                    />
                )}

                {/* 
                    Cloudinary Upload Widget
                    This widget provides the file picker and upload functionality.
                    When a user selects an image, it's automatically uploaded to Cloudinary,
                    and the onSuccess callback is triggered with the result.
                    
                    Wrapped in a div with pointerEvents: "auto" to prevent Dialog from blocking
                    pointer events when the widget is inside a modal.
                */}
                <div style={{ pointerEvents: "auto" }}>
                    <CldUploadWidget
                        onSuccess={onUpload}
                        uploadPreset="acba8r8m"
                        onClose={() => {
                            // Restore the pointer events when widget closes
                            document.body.style.pointerEvents = "";
                        }}
                    >
                        {({ open }) => {
                            /**
                             * Handler function to open the Cloudinary upload widget
                             * 
                             * The 'open' function is provided by the CldUploadWidget's render prop.
                             * Calling it opens the Cloudinary file picker dialog.
                             * 
                             * Sets pointerEvents to "auto" on the body to allow interactions
                             * with the Cloudinary widget when inside a modal.
                             */
                            const onClick = () => {
                                document.body.style.pointerEvents = "auto";
                                open();
                            };

                            return (
                                <>
                                    {/* 
                                    Upload Button
                                    Positioned absolutely at the bottom-right of the image container.
                                    Clicking this button opens the Cloudinary upload dialog.
                                    The button is disabled during form submission or when explicitly disabled.
                                */}
                                    <button
                                        type="button"
                                        className="z-20 absolute right-0 bottom-6 flex items-center font-medium text-[17px] h-14 w-14 justify-center  text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm"
                                        disabled={disabled}
                                        onClick={onClick}
                                    >
                                        {/* Upload icon (cloud with arrow pointing up) */}
                                        <svg
                                            viewBox="0 0 640 512"
                                            fill="white"
                                            height="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                                        </svg>
                                    </button>
                                </>
                            );
                        }}
                    </CldUploadWidget>
                </div>
            </div>
        );
    }
    else if (type === "cover") {
        return (
            <div
                className="relative w-full bg-gray-100 rounded-lg bg-gradient-to-b from-gray-100 via-gray-100 to-gray-400 overflow-hidden"
                style={{ height: "348px" }}
            >
                {
                    value.length > 0 && <Image
                        src={value[0]}
                        alt=""
                        width={1200}
                        height={1200}
                        className="w-full h-full rounded-lg object-cover"
                    />
                }
                <div style={{ pointerEvents: "auto" }}>
                    <CldUploadWidget
                        onSuccess={onUpload}
                        uploadPreset="acba8r8m"
                        onClose={() => {
                            // Restore the pointer events when widget closes
                            document.body.style.pointerEvents = "";
                        }}
                    >
                        {({ open }) => {
                            /**
                             * Handler function to open the Cloudinary upload widget
                             * 
                             * The 'open' function is provided by the CldUploadWidget's render prop.
                             * Calling it opens the Cloudinary file picker dialog.
                             * 
                             * Sets pointerEvents to "auto" on the body to allow interactions
                             * with the Cloudinary widget when inside a modal.
                             */
                            const onClick = () => {
                                document.body.style.pointerEvents = "auto";
                                open();
                            };

                            return (
                                <>
                                    {/* 
                                    Upload Button
                                    Positioned absolutely at the bottom-right of the image container.
                                    Clicking this button opens the Cloudinary upload dialog.
                                    The button is disabled during form submission or when explicitly disabled.
                                */}
                                    <button
                                        type="button"
                                        className="absolute bottom-4 right-4 flex items-center font-medium text-[17px] py-3 px-6 text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm"
                                        disabled={disabled}
                                        onClick={onClick}
                                    >
                                        <svg
                                            viewBox="0 0 640 512"
                                            fill="white"
                                            height="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2"
                                        >
                                            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                                        </svg>
                                        <span>
                                            {value.length > 0 ? "Change cover" : "Upload a cover"}
                                        </span>
                                    </button>
                                </>
                            );
                        }}
                    </CldUploadWidget>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <div className="mb-4 flex items-center gap-4 flex-wrap">
                    {value.length > 0 && !dontShowPreview &&
                        value.map((imageUrl) => (
                            <div key={imageUrl}
                                className="relative w-[200px] min-h-[100px] max-h-[200px]"
                            >
                                {/* Delete image button */}
                                <div className="z-10 absolute top-2 right-2">
                                    <Button
                                        onClick={() => onRemove(imageUrl)}
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="rounded-full"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                                {/* Image */}
                                <Image
                                    fill
                                    className="object-cover rounded-md"
                                    alt=""
                                    src={imageUrl}
                                />
                            </div>
                        ))
                    }
                </div>
                <div style={{ pointerEvents: "auto" }}>
                    <CldUploadWidget
                        onSuccess={onUpload}
                        uploadPreset="acba8r8m"
                        onClose={() => {
                            // Restore the pointer events when widget closes
                            document.body.style.pointerEvents = "";
                        }}
                    >
                        {({ open }) => {
                            /**
                             * Handler function to open the Cloudinary upload widget
                             * 
                             * The 'open' function is provided by the CldUploadWidget's render prop.
                             * Calling it opens the Cloudinary file picker dialog.
                             * 
                             * Sets pointerEvents to "auto" on the body to allow interactions
                             * with the Cloudinary widget when inside a modal.
                             */
                            const onClick = () => {
                                document.body.style.pointerEvents = "auto";
                                open();
                            };

                            return (
                                <>
                                    {/* 
                                    Upload Button
                                    Positioned absolutely at the bottom-right of the image container.
                                    Clicking this button opens the Cloudinary upload dialog.
                                    The button is disabled during form submission or when explicitly disabled.
                                */}
                                    <button
                                        type="button"
                                        className="flex items-center font-medium text-[17px] py-3 px-6 text-white bg-gradient-to-t from-blue-primary to-blue-300 border-none shadow-lg rounded-full hover:shadow-md active:shadow-sm"
                                        disabled={disabled}
                                        onClick={onClick}
                                    >
                                        <svg
                                            viewBox="0 0 640 512"
                                            fill="white"
                                            height="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2"
                                        >
                                            <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39V392c0 13.3 10.7 24 24 24s24-10.7 24-24V257.9l39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                                        </svg>
                                        <span>Upload images</span>
                                    </button>
                                </>
                            );
                        }}
                    </CldUploadWidget>
                </div>
            </div>
        )
    }
}


export default ImageUpload;