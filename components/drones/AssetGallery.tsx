"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { surface, border, text } from "@/lib/theme";

interface AssetGalleryProps {
  droneId: string;
}

// Generate placeholder image paths (in production, these would come from an API)
const placeholderImages = Array.from({ length: 9 }, () => `/droneImg.png`);

export function AssetGallery({ droneId: _droneId }: AssetGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (placeholderImages.length === 0) {
    return (
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Photo Gallery</h2>
        <div className={cn("py-12 text-center", text.muted)}>
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("rounded-md border p-6", surface.base, border.default)}>
        <h2 className={cn("mb-4 text-lg font-semibold", text.primary)}>Photo Gallery</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {placeholderImages.map((src, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(src)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-md transition-opacity hover:opacity-80",
                surface.subtle
              )}
            >
              <Image
                src={src}
                alt={`Drone photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className={cn(
              "absolute right-4 top-4 rounded-md border p-2 transition-colors",
              surface.base,
              border.default,
              surface.hover
            )}
            aria-label="Close"
          >
            <X size={24} className={text.primary} />
          </button>
          <div
            className="relative h-full max-h-[90vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Drone photo"
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
