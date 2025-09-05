/* Used to populate the datasets directory with the images from the GCS bucket */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const TARGET_BASE_PATH = path.join(process.cwd(), "public", "datasets");

// GCS bucket configuration from your repository
const GCS_BUCKET = "gs://nvs-bench";

// Dataset configuration from lib/datasets.json
const datasets = [
  {
    dataset_name: "mipnerf360",
    scenes: [
      "bicycle",
      "treehill",
      "stump",
      "room",
      "kitchen",
      "garden",
      "flowers",
      "counter",
      "bonsai",
    ],
  },
  {
    dataset_name: "tanksandtemples",
    scenes: ["truck", "train"],
  },
  {
    dataset_name: "deepblending",
    scenes: ["playroom", "drjohnson"],
  },
  {
    dataset_name: "zipnerf",
    scenes: ["alameda", "berlin", "london", "nyc"],
  },
];

function getEvenlyDistributedIndices(totalCount, targetCount = 5) {
  if (totalCount <= targetCount) {
    // If we have fewer images than target, just return all indices
    return Array.from({ length: totalCount }, (_, i) => i + 1);
  }

  // Calculate evenly distributed indices
  const indices = [];
  const step = (totalCount - 1) / (targetCount - 1);

  for (let i = 0; i < targetCount; i++) {
    const index = Math.round(i * step) + 1; // +1 because images are 1-indexed
    indices.push(index);
  }

  return indices;
}

function listGCSFiles(gcsPath) {
  try {
    const command = `gsutil ls "${gcsPath}"`;
    const output = execSync(command, { encoding: "utf8" });
    return output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
  } catch (error) {
    console.error(`Error listing GCS files at ${gcsPath}:`, error.message);
    return [];
  }
}

function downloadGCSFile(gcsPath, localPath) {
  try {
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(localPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Download the file using gsutil
    const command = `gsutil cp "${gcsPath}" "${localPath}"`;
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(
      `Error downloading ${gcsPath} to ${localPath}:`,
      error.message,
    );
    return false;
  }
}

function getImageFilesFromGCS(gcsScenePath) {
  try {
    const files = listGCSFiles(gcsScenePath);
    return files
      .map((file) => path.basename(file))
      .filter((file) => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(file))
      .sort((a, b) => {
        // Sort by numeric filename (e.g., "1.jpg", "2.jpg", etc.)
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
      });
  } catch (error) {
    console.error(
      `Error reading GCS directory ${gcsScenePath}:`,
      error.message,
    );
    return [];
  }
}

function populateDataset(datasetName, scenes) {
  console.log(`\n📁 Processing dataset: ${datasetName}`);

  for (const scene of scenes) {
    console.log(`  📸 Processing scene: ${scene}`);

    const gcsScenePath = `${GCS_BUCKET}/data/${datasetName}/${scene}/images`;
    const targetScenePath = path.join(TARGET_BASE_PATH, datasetName, scene);

    // Get all image files in the scene from GCS
    const imageFiles = getImageFilesFromGCS(gcsScenePath);

    if (imageFiles.length === 0) {
      console.warn(`    ⚠️  No image files found in: ${gcsScenePath}`);
      continue;
    }

    console.log(`    📊 Found ${imageFiles.length} images`);

    // Get evenly distributed indices
    const selectedIndices = getEvenlyDistributedIndices(imageFiles.length, 5);
    console.log(`    🎯 Selected indices: ${selectedIndices.join(", ")}`);

    // Create target directory
    if (!fs.existsSync(targetScenePath)) {
      fs.mkdirSync(targetScenePath, { recursive: true });
    }

    // Download selected images with 1-indexed naming (1.jpg, 2.jpg, etc.)
    let downloadedCount = 0;
    for (let i = 0; i < selectedIndices.length; i++) {
      const sourceIndex = selectedIndices[i] - 1; // Convert to 0-indexed
      const sourceFileName = imageFiles[sourceIndex];
      const targetFileName = `${i + 1}.jpg`; // 1-indexed naming

      const gcsSourcePath = `${gcsScenePath}/${sourceFileName}`;
      const localTargetPath = path.join(targetScenePath, targetFileName);

      if (downloadGCSFile(gcsSourcePath, localTargetPath)) {
        downloadedCount++;
        console.log(`    ✅ Downloaded ${sourceFileName} → ${targetFileName}`);
      }
    }

    console.log(
      `    🎉 Successfully downloaded ${downloadedCount}/5 images for ${scene}`,
    );
  }
}

function checkGsutilInstallation() {
  try {
    execSync("gsutil --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

function main() {
  console.log(
    "🚀 Starting dataset population script from Google Cloud Storage...",
  );
  console.log(`📂 GCS Bucket: ${GCS_BUCKET}`);
  console.log(`📂 Target path: ${TARGET_BASE_PATH}`);

  // Check if gsutil is installed
  if (!checkGsutilInstallation()) {
    console.error("❌ gsutil is not installed or not in PATH");
    console.error(
      "Please install Google Cloud CLI: https://cloud.google.com/sdk/docs/install",
    );
    process.exit(1);
  }

  console.log("✅ gsutil is available");

  // Process each dataset
  for (const dataset of datasets) {
    populateDataset(dataset.dataset_name, dataset.scenes);
  }

  console.log("\n🎉 Dataset population completed!");
  console.log(
    "📝 Images downloaded from Google Cloud Storage with even distribution.",
  );
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { populateDataset, getEvenlyDistributedIndices };
