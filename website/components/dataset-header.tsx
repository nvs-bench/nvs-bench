import { useState, useEffect } from "react";
import datasets from "@/lib/datasets.json";
import { DatasetDownloadModal } from "@/components/dataset-download-modal";
import { DatasetImages } from "./dataset-images";
import Image from "next/image";

interface DatasetMeta {
  dataset_name: string;
  dataset_display_name: string;
  dataset_description: string;
  dataset_source_link: string;
  dataset_download_link: string;
  scenes: string[];
}

interface AllDatasetImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
}

function AllDatasetImage({ src, alt, onClick }: AllDatasetImageProps) {
  return (
    <div className="group flex-shrink-0">
      <button
        className="relative overflow-hidden rounded-lg cursor-pointer w-full text-left"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        type="button"
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
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

function AllDatasetImages() {
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

  // Get first image from each scene in each dataset
  const allImages = (datasets as DatasetMeta[]).flatMap((dataset) =>
    dataset.scenes.map((scene) => ({
      src: `/datasets/${dataset.dataset_name}/${scene}/1.jpg`,
      alt: `Sample from ${dataset.dataset_display_name} - ${scene}`,
      datasetName: dataset.dataset_display_name,
      sceneName: scene,
    }))
  );

  return (
    <>
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((image) => (
            <AllDatasetImage
              key={`${image.datasetName}-${image.sceneName}`}
              src={image.src}
              alt={image.alt}
              onClick={() =>
                setFullscreenImage({
                  src: image.src,
                  alt: image.alt,
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
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
              <Image
                src={fullscreenImage.src}
                alt={fullscreenImage.alt}
                width={1200}
                height={800}
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

export function DatasetHeader({
  selectedDataset,
  selectedScene,
}: {
  selectedDataset: string;
  selectedScene: string;
}) {
  if (selectedDataset === "all") {
    return (
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
          All Scenes
        </h2>
        <AllDatasetImages />
        <p className="text-lg text-foreground leading-relaxed mb-4">
          The benchmark aggregates the 17 most commonly used scenes in the NVS research community and standardizes them. 
        </p>
        <DatasetDownloadModal datasetName="all">
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground mb-4 text-sm"
          >
            Download
          </button>
        </DatasetDownloadModal>
      </div>
    );
  }

  const dataset = (datasets as DatasetMeta[]).find(
    (d) => d.dataset_name === selectedDataset,
  );
  if (!dataset) return null;

  return (
    <div className="mb-4">
      <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
        {dataset.dataset_display_name}
      </h2>
      <DatasetImages
        selectedDataset={dataset.dataset_name}
        selectedScene={selectedScene}
      />
      <p className="text-lg text-foreground leading-relaxed mb-4">
        {dataset.dataset_description}
      </p>
      <div className="flex items-center gap-4 text-sm mb-8">
        <a
          href={dataset.dataset_source_link}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Source
        </a>
        <span className="text-muted-foreground">•</span>
        <DatasetDownloadModal datasetName={dataset.dataset_name}>
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Download
          </button>
        </DatasetDownloadModal>
      </div>
    </div>
  );
}
