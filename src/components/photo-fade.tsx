import { useEffect, useState } from "react";

function useFadeIndex(count: number, interval: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (count < 2) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, interval);
    return () => window.clearInterval(id);
  }, [count, interval]);

  return active;
}

export function PhotoFade({
  images,
  alt,
  aspect = "aspect-[4/3]",
  interval = 4000,
  activeIndex,
}: {
  images: string[];
  alt: string;
  aspect?: string | undefined;
  interval?: number;
  activeIndex?: number;
}) {
  const internal = useFadeIndex(activeIndex === undefined ? images.length : 0, interval);
  const active = (activeIndex ?? internal) % images.length;

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

/** Before/after pair whose images crossfade in step, so the angles always match. */
export function PhotoFadePair({
  beforeImages,
  afterImages,
  name,
  aspect,
  interval = 4000,
}: {
  beforeImages: string[];
  afterImages: string[];
  name: string;
  aspect?: string | undefined;
  interval?: number;
}) {
  const steps = Math.max(beforeImages.length, afterImages.length);
  const active = useFadeIndex(steps, interval);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <PhotoFade
          images={beforeImages}
          alt={`${name} before renovation`}
          aspect={aspect}
          activeIndex={active % beforeImages.length}
        />
        <p className="eyebrow mt-2 text-muted-foreground">Before</p>
      </div>
      <div>
        <PhotoFade
          images={afterImages}
          alt={`${name} after renovation`}
          aspect={aspect}
          activeIndex={active % afterImages.length}
        />
        <p className="eyebrow mt-2 text-primary">After</p>
      </div>
    </div>
  );
}
