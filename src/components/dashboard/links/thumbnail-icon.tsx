import Image from "next/image";
import { getIconComp, isImageUrl } from "@/lib/thumbnail-icons";

interface ThumbnailIconProps {
  icon: string | null | undefined;
  className?: string;
  size?: number;
  fill?: boolean;
}

export function ThumbnailIcon({
  icon,
  className = "h-5 w-5",
  size = 48,
  fill = false,
}: ThumbnailIconProps) {
  if (!icon) return null;

  if (isImageUrl(icon)) {
    if (fill) {
      return (
        <div className="w-5 h-5 rounded-md overflow-hidden relative shrink-0">
          <Image
            src={icon}
            alt="Thumbnail"
            fill
            sizes="20px"
            className="object-cover"
            unoptimized={icon.startsWith("https://")}
          />
        </div>
      );
    }
    return (
      <Image
        src={icon}
        alt="Thumbnail"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized={icon.startsWith("https://")}
      />
    );
  }

  const IconComp = getIconComp(icon);
  if (IconComp) {
    return <IconComp className={className} />;
  }

  return <span className="text-xl leading-none shrink-0">{icon}</span>;
}
