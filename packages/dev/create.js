import input from "@inquirer/input";
import select from "@inquirer/select";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interactively allows the user to choose a scaffold type and
 * then performs corresponding actions.
 */
export default async function create() {
  const componentTemplate = await select({
    message: "What would you like to scaffold?",
    choices: [
      {
        name: "Model",
        value: "model",
        description: "Create a new database model"
      },
      {
        name: "Route",
        value: "route",
        description: "Create a new route file"
      },
      {
        name: "GraphQL Schema",
        value: "gql",
        description: "Create a new GraphQL schema"
      },
      {
        name: "Client View",
        value: "clientview",
        description: "Create a new frontend client application"
      }
    ]
  });

  const name = await input({
    message: `Enter a name for your ${componentTemplate.toUpperCase()}`,
  });

  // Determine the directory and file paths for the new component
  const templateDir = path.join(
    __dirname,
    "..",
    "template",
    "_create",
    `${componentTemplate}.js`
  );
  const sourcePath = path.resolve(templateDir);
  const currentDir = process.cwd();
  let destDir = path.join(currentDir, "models");

  // Set the destination directory based on the scaffold type
  switch (componentTemplate) {
    case "gql":
      destDir = path.join(currentDir, "routes", "gql");
      break;
    case "route":
      destDir = path.join(currentDir, "routes", "api");
      break;
    case "clientview":
      destDir = path.join(currentDir, "views");
      break;
  }

  // Create the destination directory if it doesn't exist
  try {
    await fs.mkdir(destDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }

  const destPath = path.resolve(path.join(destDir, `${toSnakeCase(name)}.js`));
  try {
    await fs.copyFile(sourcePath, destPath);
    console.log(`Created ${destPath}!`);
  } catch (error) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

/**
 * Converts a string to snake_case.
 *
 * @param {string} str - The string to convert.
 * @return {string} The snake_case version of the string.
 */
function toSnakeCase(str) {
  // Replace all whitespace and underscores with a single underscore.
  // Replace all sequences of lowercase letters or digits followed by
  // an uppercase letter with the lowercase letters or digits followed
  // by an underscore followed by the uppercase letter.
  // Convert the entire string to lowercase.
  return str
    .replace(/[\s_]+/g, "_")
    .replace(/([a-z\d_])([A-Z])/g, "$1_$2")
    .toLowerCase();
}
