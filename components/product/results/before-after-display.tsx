"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getLandscapeDesignBrief, getStyleById } from "@/lib/landscape-styles";
import type {
  DesignVariantResult,
  GenerateResult,
} from "@/components/product/upload/landscape-upload-form";
import { cn } from "@/lib/utils";

interface BeforeAfterDisplayProps {
  result: GenerateResult;
  onTryAgain: () => void;
  compact?: boolean;
  isDemo?: boolean;
}

function createFallbackVariant(result: GenerateResult): DesignVariantResult {
  return {
    resultImageUrl: result.resultImageUrl,
    originalImageUrl: result.originalImageUrl,
    styleId: result.styleId,
    variantIndex: 0,
    designBrief: getLandscapeDesignBrief(result.styleId),
  };
}

export default function BeforeAfterDisplay({
  result,
  onTryAgain,
  compact = false,
  isDemo = false,
}: BeforeAfterDisplayProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const variants = useMemo(
    () => (result.designs && result.designs.length > 0 ? result.designs : [createFallbackVariant(result)]),
    [result]
  );
  const selectedVariant = variants[Math.min(selectedIndex, variants.length - 1)];
  const style = getStyleById(selectedVariant.styleId);
  const brief = selectedVariant.designBrief ?? getLandscapeDesignBrief(selectedVariant.styleId);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, percentage)));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full h-full min-h-0 flex flex-col gap-4", compact ? "max-w-none" : "max-w-5xl mx-auto")}
    >
      {variants.length > 1 && (
        <div className="shrink-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {variants.map((variant, index) => (
            <button
              key={`${variant.resultImageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "group overflow-hidden rounded-lg border bg-background text-left transition-colors",
                selectedIndex === index ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
              )}
            >
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={variant.resultImageUrl}
                  alt={`Landscape design option ${index + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  Option {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="shrink-0 space-y-4">
          <div
            ref={containerRef}
            className={cn("relative w-full overflow-hidden border border-border shadow-lg select-none cursor-ew-resize", compact ? "aspect-[16/9] rounded-xl" : "aspect-[4/3] rounded-2xl")}
            onMouseDown={() => (isDragging.current = true)}
            onMouseUp={() => (isDragging.current = false)}
            onMouseLeave={() => (isDragging.current = false)}
            onMouseMove={(e) => isDragging.current && updatePosition(e.clientX)}
            onTouchStart={() => (isDragging.current = true)}
            onTouchEnd={() => (isDragging.current = false)}
            onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedVariant.resultImageUrl}
              alt={`AI landscape design - ${style?.label ?? "custom"} style`}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedVariant.originalImageUrl}
                alt="Your original yard photo"
                className="h-full object-cover"
                style={{ width: `${(100 / Math.max(sliderPosition, 1)) * 100}%`, maxWidth: "none" }}
                draggable={false}
              />
            </div>

            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
              <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center text-xs">
                ||
              </div>
            </div>

            <span className="absolute top-3 left-3 text-xs font-medium bg-black/60 text-white px-2 py-1 rounded">
              Before
            </span>
            {isDemo && (
              <span className="absolute bottom-3 left-3 text-xs font-medium bg-primary/90 text-primary-foreground px-2 py-1 rounded">
                Example result
              </span>
            )}
            <span className="absolute top-3 right-3 text-xs font-medium bg-black/60 text-white px-2 py-1 rounded">
              After - {style?.label ?? "Custom"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 h-12" variant="default">
              <a href={selectedVariant.resultImageUrl} download target="_blank" rel="noopener noreferrer">
                Download Selected Design
              </a>
            </Button>
            {!isDemo && (
              <Button onClick={onTryAgain} variant="outline" className="flex-1 h-12">
                Try Another Style
              </Button>
            )}
          </div>
        </div>

        <aside className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-background p-5 pr-4 shadow-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Design brief
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">{brief.styleName}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{brief.designFocus}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Recommended plants</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {brief.plantSuggestions.map((plant) => (
                <span key={plant} className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                  {plant}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Materials</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {brief.materialSuggestions.map((material) => (
                <li key={material}>- {material}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Maintenance</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{brief.maintenanceLevel}</p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}






