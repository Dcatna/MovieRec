import { cn } from "@/lib/utils";

export const ImageGrid = ({ images }: { images: string[] }) => {
  return (
    <div className="grid aspect-square h-full rounded-md overflow-clip">
      {images.length > 3 ? (
        // If there are more than 3 images, display a 2x2 grid
        <div className="grid grid-cols-2">
          {images.slice(0, 4).map((image, i) => (
            <img
              src={image}
              alt={`Image ${i + 1}`}
              className={cn(
                "object-cover aspect-square",
              )}
              key={image}
            />
          ))}
        </div>
      ) : (
        // If there are 3 or fewer images, display only the first image
        <img
          src={images[0]}
          alt="Single Image"
          className="object-cover aspect-square w-full h-full"
        />
      )}
    </div>
  );
};

interface ListPreviewItemProps extends React.HTMLAttributes<HTMLDivElement> {
  listName: string | undefined | null;
  description: string;
  images: string[];
}

export function ListPreviewItem({
  className,
  images,
  listName,
}: ListPreviewItemProps) {
  return (
    <div className="overflow-clip">
      <div className={cn(className, "overflow-hidden row-span-3")}>
        <ImageGrid images={images} />
      </div>
      {listName ? (
        <text className="font-semibold text-ellipsis text-xl row-span-2 my-2 line-clamp-2 w-46">
          {listName}
        </text>
      ) : undefined}
    </div>
  );
}
