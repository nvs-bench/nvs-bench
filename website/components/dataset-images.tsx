import { useState, useEffect } from "react";
import datasets from "@/lib/datasets.json";
import Image from "next/image";

interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

interface DatasetImagesProps {
  selectedDataset: string;
  selectedScene?: string;
}

interface DatasetImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

function DatasetImage({
  src,
  alt,
  className = "w-auto h-32 sm:h-36 md:h-40 object-contain block",
  onClick,
}: DatasetImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={`${className} ${onClick ? "cursor-pointer" : ""}`}
      loading="lazy"
      onClick={onClick}
    />
  );
}

interface DatasetImageButtonProps {
  imagePath: string;
  alt: string;
  onImageClick: () => void;
}

function DatasetImageButton({
  imagePath,
  alt,
  onImageClick,
}: DatasetImageButtonProps) {
  return (
    <div className="group flex-shrink-0">
      <button
        className="relative overflow-hidden rounded-lg cursor-pointer w-full text-left"
        onClick={onImageClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onImageClick();
          }
        }}
        type="button"
      >
        <img
          src={imagePath}
          alt={alt}
          className="w-auto h-32 sm:h-36 md:h-40 object-contain"
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
    </div>
  );
}

export function DatasetImages({
  selectedDataset,
  selectedScene,
}: DatasetImagesProps) {
  const [fullscreenImage, setFullscreenImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

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

  if (selectedDataset === "all") return null;

  const dataset = (datasets as DatasetMeta[]).find(
    (d) => d.dataset_name === selectedDataset,
  );
  if (!dataset) return null;

  // If "all" is selected, show images from all scenes
  // If a specific scene is selected, show only that scene's images
  // Otherwise, show images from all scenes in the dataset
  const scenesToShow =
    selectedScene === "all"
      ? dataset.scenes
      : selectedScene
        ? [selectedScene]
        : dataset.scenes;

  return (
    <>
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {selectedScene && selectedScene !== "all"
            ? // For specific scenes, show 5 images in horizontal scroll
              Array.from({ length: 5 }, (_, i) => {
                const imagePath = `/datasets/${dataset.dataset_name}/${selectedScene}/${i + 1}.jpg`;
                return (
                  <DatasetImageButton
                    key={`${selectedScene}-${i + 1}`}
                    imagePath={imagePath}
                    alt={`Sample ${i + 1} from ${selectedScene}`}
                    onImageClick={() =>
                      setFullscreenImage({
                        src: imagePath,
                        alt: `Sample ${i + 1} from ${selectedScene}`,
                      })
                    }
                  />
                );
              })
            : // For "all" scenes, show 1 image from each scene in horizontal scroll
              scenesToShow.map((scene) => {
                const imagePath = `/datasets/${dataset.dataset_name}/${scene}/1.jpg`;
                return (
                  <DatasetImageButton
                    key={`${scene}-1`}
                    imagePath={imagePath}
                    alt={`Sample from ${scene}`}
                    onImageClick={() =>
                      setFullscreenImage({
                        src: imagePath,
                        alt: `Sample from ${scene}`,
                      })
                    }
                  />
                );
              })}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setFullscreenImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFullscreenImage(null);
            }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <img
                src={fullscreenImage.src}
                alt={fullscreenImage.alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <button
              onClick={() => setFullscreenImage(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFullscreenImage(null);
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
