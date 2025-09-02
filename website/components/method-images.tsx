"use client";

import { useEffect, useState } from "react";
import methodsData from "@/lib/methods.json";
import type { MethodMeta } from "@/lib/types";

interface MethodImagesProps {
  selectedMethod: string | null;
  datasetName: string;
  sceneName: string;
}

interface ImageInfo {
  url: string;
  filename: string;
}

export function MethodImages({
  selectedMethod,
  datasetName,
  sceneName,
}: MethodImagesProps) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<ImageInfo | null>(
    null,
  );

  useEffect(() => {
    if (!selectedMethod || !datasetName || !sceneName) {
      setImages([]);
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Real GCS URLs - these should be publicly accessible
        const gcsImages: ImageInfo[] = [
          {
            url: `https://storage.googleapis.com/nvs-bench/output/${datasetName}/${sceneName}/${selectedMethod}/test_renders/00000.png`,
            filename: `00000.png`,
          },
          {
            url: `https://storage.googleapis.com/nvs-bench/output/${datasetName}/${sceneName}/${selectedMethod}/test_renders/00001.png`,
            filename: `00001.png`,
          },
          {
            url: `https://storage.googleapis.com/nvs-bench/output/${datasetName}/${sceneName}/${selectedMethod}/test_renders/00002.png`,
            filename: `00002.png`,
          },
        ];

        setImages(gcsImages);
      } catch (err) {
        setError("Failed to load images");
        console.error("Error loading images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [selectedMethod, datasetName, sceneName]);

  // Close fullscreen on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreenImage(null);
      }
    };

    if (fullscreenImage) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [fullscreenImage]);

  const methodMeta = methodsData.find(
    (m: MethodMeta) => m.method_name === selectedMethod,
  );

  if (!selectedMethod) {
    return (
      <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Method Selected
          </h3>
          <p className="text-muted-foreground">
            Click on a method to see its renderings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {methodMeta?.method_display_name || selectedMethod} Renderings
            </h3>
            <p className="text-muted-foreground">
              Test renders from {datasetName}/{sceneName}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Loading images...
            </span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-destructive mb-2">⚠️ {error}</div>
            <p className="text-muted-foreground text-sm">
              Unable to load images
            </p>
          </div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div key={image.filename} className="group">
                <button
                  className="relative overflow-hidden rounded-lg border border-border bg-muted cursor-pointer w-full text-left"
                  onClick={() => setFullscreenImage(image)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFullscreenImage(image);
                    }
                  }}
                  type="button"
                >
                  <img
                    src={image.url}
                    alt={`${selectedMethod} rendering ${index + 1}`}
                    className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg
                      className="w-5 h-5 text-white drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </button>
                <p className="mt-2 text-sm text-muted-foreground text-center truncate">
                  {image.filename}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No images found for this method
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={fullscreenImage.url}
              alt={`${selectedMethod} rendering - ${fullscreenImage.filename}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenImage(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFullscreenImage(null);
                }
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
              {fullscreenImage.filename}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
