import { cn } from "@/lib/utils";

export const ImageGrid = ({ images }: {images: string[]}) => {
    //console.log(images, "IMAGES")
    const roundingFromIdx = (idx: number) => {
        switch(idx) {
            case 0: return "s"
            case 1: return "e"
            case 2: return "bs"
            case 3: return "be"
            default: return ""
        }
    }

    return (
        <div className="grid grid-cols-2 aspect-square h-full">
            {images.map((image, i) => (
                <img
                  src={image}
                  alt={`Image ${i + 1}`}
                  className={cn(`overflow-clip object-cover aspect-square rounded-${roundingFromIdx(i)}-lg`)}
                  key={image}
              />
            ))}
        </div>
    );
};

interface ListPreviewItemProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string,
    description: string,
    images: string[]
}

export function ListPreviewItem(
    { className, images, title }: ListPreviewItemProps 
) {
    return (
        <div className="overflow-clip">
            <div className={cn(className, "overflow-hidden row-span-3")}>
                <ImageGrid images={images}/>
            </div>
            <h3 className="font-semibold text-ellipsis text-xl row-span-2 my-2 line-clamp-2 w-46">
                {title}
            </h3>
        </div>
    )
}
