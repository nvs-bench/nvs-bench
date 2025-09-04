"use client";

import { useEffect, useState } from "react";
import methodsData from "@/lib/methods.json";
import datasets from "@/lib/datasets.json";
import type { MethodMeta, DatasetMeta } from "@/lib/types";

interface MethodImagesProps {
  selectedMethod: string | null;
  datasetName: string;
  sceneName: string;
}

interface ImagePair {
  render: ImageInfo;
  gt: ImageInfo;
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
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenPair, setFullscreenPair] = useState<ImagePair | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    if (!selectedMethod || !datasetName) {
      setImagePairs([]);
      return;
    }

    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        let pairs: ImagePair[] = [];

        if (sceneName === "all") {
          // When "all" is selected, show images from the first 3 scenes
          const dataset = (datasets as DatasetMeta[]).find(
            (d) => d.dataset_name === datasetName
          );
          
          if (dataset) {
            const firstThreeScenes = dataset.scenes.slice(0, 3);
            
            // For each of the first 3 scenes, get the first image pair
            firstThreeScenes.forEach((scene) => {
              pairs.push({
                render: {
                  url: `/results/${selectedMethod}/${datasetName}/${scene}/website_images/render_0.png`,
                  filename: `render_0.png`,
                },
                gt: {
                  url: `/results/${selectedMethod}/${datasetName}/${scene}/website_images/gt_0.png`,
                  filename: `gt_0.png`,
                },
                sceneName: scene,
              });
            });
          }
        } else {
          // For individual scenes, show all 3 image pairs
          pairs = [
            {
              render: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/render_0.png`,
                filename: `render_0.png`,
              },
              gt: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/gt_0.png`,
                filename: `gt_0.png`,
              },
              sceneName: sceneName,
            },
            {
              render: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/render_1.png`,
                filename: `render_1.png`,
              },
              gt: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/gt_1.png`,
                filename: `gt_1.png`,
              },
              sceneName: sceneName,
            },
            {
              render: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/render_2.png`,
                filename: `render_2.png`,
              },
              gt: {
                url: `/results/${selectedMethod}/${datasetName}/${sceneName}/website_images/gt_2.png`,
                filename: `gt_2.png`,
              },
              sceneName: sceneName,
            },
          ];
        }

        setImagePairs(pairs);
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
        setFullscreenPair(null);
      }
    };

    if (fullscreenPair) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [fullscreenPair]);

  const handleImageClick = (pair: ImagePair) => {
    setFullscreenPair(pair);
    setSliderPosition(50);
  };

  const handleSliderMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!fullscreenPair) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

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
            Click on a method in the table to see its renderings.
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
              Renderings vs Ground Truth
            </h3>
            <p className="text-muted-foreground">
              {methodMeta?.method_display_name || selectedMethod} -{" "}
              {datasetName}
              {sceneName === "all" ? " (First 3 scenes)" : `/${sceneName}`}
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

        {!loading && !error && imagePairs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagePairs.map((pair, index) => (
              <div
                key={`${pair.render.filename}-${pair.gt.filename}`}
                className="flex flex-col"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">Render</span>
                  </p>
                </div>

                {/* Combined Render and GT Images */}
                <div className="group">
                  <button
                    className="relative overflow-hidden rounded-lg border border-border bg-muted cursor-pointer w-full text-left"
                    onClick={() => handleImageClick(pair)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleImageClick(pair);
                      }
                    }}
                    type="button"
                  >
                    {/* Render Image (top half) */}
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={pair.render.url}
                        alt={`${selectedMethod} rendering ${sceneName === "all" ? `${pair.sceneName} ` : ""}${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    </div>

                    {/* GT Image (bottom half) */}
                    <div className="relative h-48 overflow-hidden rounded-b-lg">
                      <img
                        src={pair.gt.url}
                        alt={`Ground truth ${sceneName === "all" ? `${pair.sceneName} ` : ""}${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    </div>

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
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Ground Truth</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && imagePairs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No images found for this method
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Comparison Modal */}
      {fullscreenPair && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setFullscreenPair(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <div className="relative">
                {/* Background GT Image (full width) */}
                <img
                  src={fullscreenPair.gt.url}
                  alt="Ground Truth comparison"
                  className="max-w-full max-h-full object-contain"
                />

                {/* Foreground Render Image (clipped by slider) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={fullscreenPair.render.url}
                    alt="Render comparison"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Interactive Slider Area */}
                <button
                  className="absolute inset-0 cursor-col-resize border-0 bg-transparent p-0"
                  onClick={(e) => e.stopPropagation()}
                  onMouseMove={handleSliderMove}
                  onKeyDown={(e) => e.stopPropagation()}
                  type="button"
                />

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-800"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label="Slider handle"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                  Render
                </div>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                  Ground Truth
                </div>
                {sceneName === "all" && (
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                    Scene: {fullscreenPair.sceneName}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setFullscreenPair(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFullscreenPair(null);
                }
              }}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200 z-20"
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
          </div>
        </div>
      )}
    </>
  );
}
