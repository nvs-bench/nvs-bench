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

export function DatasetImages({
  selectedDataset,
  selectedScene,
}: DatasetImagesProps) {
  if (selectedDataset === "all") return null;

  const dataset = (datasets as DatasetMeta[]).find(
    (d) => d.dataset_name === selectedDataset,
  );
  if (!dataset) return null;

  // If "all" is selected, show images from the first 3 scenes
  // If a specific scene is selected, show only that scene's images
  // Otherwise, show images from all scenes in the dataset
  const scenesToShow = selectedScene === "all" 
    ? dataset.scenes.slice(0, 3) 
    : selectedScene 
    ? [selectedScene] 
    : dataset.scenes;

  return (
    <div className="mb-6">
      <div className="space-y-4">
        {scenesToShow.map((scene) => (
          <div key={scene} className="space-y-2">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const imagePath = `/datasets/${dataset.dataset_name}/${scene}/${i + 1}.jpg`;

                return (
                  <div
                    key={`${scene}-${i + 1}`}
                    className="relative rounded-md overflow-hidden"
                  >
                    <Image
                      src={imagePath}
                      alt={`Sample ${i + 1} from ${scene}`}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain block max-h-28 sm:max-h-32 md:max-h-36"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
