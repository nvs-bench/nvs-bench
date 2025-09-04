const fs = require("fs");
const path = require("path");

function aggregateResults() {
  const resultsDir = path.join(process.cwd(), "public", "results");
  const results = [];

  // Recursively find all result.json files
  function findResultFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findResultFiles(fullPath));
      } else if (item.name === "result.json") {
        files.push(fullPath);
      }
    }

    return files;
  }

  try {
    const resultFiles = findResultFiles(resultsDir);

    // Load and parse each result.json file
    for (const filePath of resultFiles) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const result = JSON.parse(content);

        // Validate the result structure
        if (result.method_name && result.dataset_name && result.scene_name) {
          results.push(result);
        } else {
          console.warn(`Skipping invalid result file: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
      }
    }

    // Write the aggregated results to lib/results.json
    const outputPath = path.join(process.cwd(), "lib", "results.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(
      `✅ Aggregated ${results.length} result files into lib/results.json`,
    );
  } catch (error) {
    console.error("Error aggregating results:", error);
    process.exit(1);
  }
}

aggregateResults();
