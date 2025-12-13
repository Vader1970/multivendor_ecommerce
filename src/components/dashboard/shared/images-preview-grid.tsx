//React
import Image from "next/image";
import { FC } from "react";

//Import of the image shown when there are no images available
import NoImageImg from "../../../../public/assets/images/no_image_2.png";
import { cn, } from "@/lib/utils";

interface ImagesPreviewGridProps {
    images: { url: string }[]; // Array of image URLs
    onRemove: (value: string) => void;
}

const ImagesPreviewGrid: FC<ImagesPreviewGridProps> = ({
    images,
    onRemove
}) => {

    //Calculate the number of images
    let imagesLength = images.length;

    const gridClassName =
        imagesLength === 2 ? "grid-cols-2" :
            imagesLength === 3 ? "grid-cols-2 grid-rows-2" :
                imagesLength === 4 ? "grid-cols-2" :
                    imagesLength === 5 ? "grid-cols-2 grid-rows-6" :
                        imagesLength === 6 ? "grid-cols-2" :
                            "";


    // If there are no images, display a placeholder image
    if (imagesLength === 0) {
        return (
            <div>
                <Image
                    src={NoImageImg}
                    alt="No images available"
                    width={500}
                    height={600}
                    className="rounded-md"
                />
            </div>
        );
    } else {
        // If there are images, display the images in a grid
        return (
            <div className="max-w-4xl">
                <div
                    className={cn(
                        "grid h-[800px] overflow-hidden bg-white rounded-md",
                        gridClassName
                    )}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={cn(
                                "relative group h-full w-full border border-gray-300",
                                `grid_${imagesLength}_image_${i + 1}`,
                                {
                                    "h-[266.66px]": images.length === 6,
                                }
                            )}
                        >
                            {/* Image */}
                            <Image
                                src={img.url}
                                alt=""
                                width={800}
                                height={800}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    ))
                    }
                </div>
            </div>
        )
    }
}

export default ImagesPreviewGrid;