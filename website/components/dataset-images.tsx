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
}

function DatasetImage({ src, alt, className = "w-auto h-32 sm:h-36 md:h-40 object-contain block" }: DatasetImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={className}
      loading="lazy"
    />
  );
}

export function DatasetImages({
  selectedDataset,
  selectedScene,
}: DatasetImagesProps) {
  if (selectedDataset === "all") return null;

  const dataset = (datasets as DatasetMeta[]).find(
    (d) => d.dataset_name === selectedDataset,
  );
  if (!dataset) return null;

  // If "all" is selected, show images from all scenes
  // If a specific scene is selected, show only that scene's images
  // Otherwise, show images from all scenes in the dataset
  const scenesToShow = selectedScene === "all" 
    ? dataset.scenes 
    : selectedScene 
    ? [selectedScene] 
    : dataset.scenes;

  return (
    <div className="mb-6">
      {selectedScene && selectedScene !== "all" ? (
        // For specific scenes, show 5 images in horizontal scroll
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 5 }, (_, i) => {
            const imagePath = `/datasets/${dataset.dataset_name}/${selectedScene}/${i + 1}.jpg`;
            return (
              <div
                key={`${selectedScene}-${i + 1}`}
                className="relative rounded-md overflow-hidden flex-shrink-0"
              >
                <DatasetImage
                  src={imagePath}
                  alt={`Sample ${i + 1} from ${selectedScene}`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        // For "all" scenes, show 1 image from each scene in horizontal scroll
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {scenesToShow.map((scene) => {
            const imagePath = `/datasets/${dataset.dataset_name}/${scene}/1.jpg`;
            return (
              <div
                key={`${scene}-1`}
                className="relative rounded-md overflow-hidden flex-shrink-0"
              >
                <DatasetImage
                  src={imagePath}
                  alt={`Sample from ${scene}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
