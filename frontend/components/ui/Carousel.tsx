"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({
  children,
  autoplayDelay,
  showArrows = true,
  showDots = true,
  dotsOverlay = false,
  slideClassName = "flex-[0_0_100%]",
}: {
  children: React.ReactNode[];
  autoplayDelay?: number; // ms — omit for no autoplay
  showArrows?: boolean;
  showDots?: boolean;
  dotsOverlay?: boolean; // true = dots sit absolutely inside the carousel (for full-bleed dark slides), false = dots sit below in normal flow
  slideClassName?: string;
}) {
  const plugins = autoplayDelay
    ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: true })]
    : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, plugins);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children.map((child, i) => (
            <div key={i} className={`min-w-0 ${slideClassName}`}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* {showArrows && children.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-chalk/90 hover:bg-chalk text-ink shadow-md transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-chalk/90 hover:bg-chalk text-ink shadow-md transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )} */}

      {showDots && scrollSnaps.length > 1 && (
        <div
          className={
            dotsOverlay
              ? "absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
              : "flex items-center justify-center gap-2 mt-4"
          }
        >
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 transition-all ${
                i === selectedIndex
                  ? "w-6 bg-amber"
                  : dotsOverlay
                    ? "w-1.5 bg-chalk/40"
                    : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
