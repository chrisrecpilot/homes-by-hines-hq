import { useEffect, useState } from "react";

export function PhotoFade({
  images,
  alt,
  aspect = "aspect-[4/3]",
  interval = 4000,
}: {
  images: string[];
  alt: string;
  aspect?: string;
  interval?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className={`relative w-full overflow-hidden bg-muted ${aspect}`}>
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={index === 0 ? alt : ""}
          aria-hidden={index === 0 ? undefined : true}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: index === active ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
