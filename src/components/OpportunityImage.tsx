import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Fills its (position: relative) parent. Uploaded photos are already resized on the client, so skip the optimiser for them. */
export default function OpportunityImage({ src, alt = "", sizes, priority, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("/api/")}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
