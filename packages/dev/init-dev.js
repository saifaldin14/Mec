import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Initializes a new Mec application in the specified directory.
 *
 * @param {string} [dirPath] - The path of the directory to initialize the application in.
 *   If not provided, the current working directory is used.
 * @throws {Error} Throws an error if the directory already contains a "package.json" file.
 * @throws {Error} Throws an error if there is an issue creating a directory or copying a file.
 */
export default async function initDev(dirPath) {
  const templateDir = path.join(__dirname, "..", "template", "_app");
  const currentDir = dirPath || process.cwd();

  try {
    const currentDirContents = await fs.readdir(currentDir);

    if (currentDirContents.includes("package.json")) {
      throw new Error(
        `Directory ${currentDir} already contains a package.json. Aborting to prevent overwriting existing project.`
      );
    }

    if (currentDirContents.length > 0) {
      console.log(
        "Warning: New application directory not empty. New files will be added to existing ones."
      );
    }

    // Copy the template directory to the current directory
    await copyDirectoryRecursive(templateDir, currentDir);
    // Install npm dependencies
    await installDependencies(currentDir);

    console.log(
      "New Mec application initialized. Run `mec dev` to start the new app or `mec create` to scaffold!"
    );
  } catch (error) {
    console.error(`Error initializing Mec application: ${error.message}`);
  }
}

/**
 * Copies a directory recursively from the source to the target.
 *
 * @param {string} source - The path of the source directory.
 * @param {string} target - The path of the target directory.
 * @throws {Error} Throws an error if there is an issue creating a directory or copying a file.
 */
async function copyDirectoryRecursive(source, target) {
  // Get the list of files in the source directory
  const files = await fs.readdir(source);

  // Copy each file or directory to the target directory
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(target, file);

    // Get the stat object for the source path
    const stat = await fs.stat(sourcePath);
    console.log(`Creating ${destPath}...`);

    // If the source is a directory, create the directory in the target and recursively copy its contents
    if (stat.isDirectory()) {
      try {
        await fs.mkdir(destPath, { recursive: true });
      } catch (error) {
        console.error(`Error creating ${destPath}: ${error.message}`);
      }
      await copyDirectoryRecursive(sourcePath, destPath);
    } else {
      // If the source is a file, copy the file to the target
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

/**
 * Installs the dependencies in the specified directory.
 *
 * @param {string} dirPath - The path of the directory where the dependencies will be installed.
 * @returns {Promise<void>} - A promise that resolves when the installation is complete.
 * @throws {Error} - Throws an error if there is an issue with the installation process.
 */
function installDependencies(dirPath) {
  return new Promise((resolve, reject) => {
    console.log("Installing dependencies...");

    // Execute the 'npm install' command in the specified directory
    exec("npm install", { cwd: dirPath }, (error, _, _) => {
      if (error) {
        // If there is an error, log the error message and reject the promise
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      resolve();
    });
  });
}
