import makeDebug from "debug";
const debug = makeDebug("mec:optimize");

import { readdirSync, statSync, mkdirSync } from "fs";
import { join, extname, relative, dirname } from "path";
import { exec } from "child_process";

/**
 * The Optimize class provides methods to optimize application assets like minifying scripts.
 */
export class Optimize {
  constructor() {};

  /**
   * Minify all JavaScript scripts in the components directory.
   */
  async minifyScripts() {
    debug("Minify scripts running...");

    // Source directory containing original components.
    const srcDir = join(process.cwd(), "components");
    // Destination directory to store minified components.
    const destDir = join(process.cwd(), ".mec/components");

    /**
     * Recursively process all files in a directory.
     *
     * @param {string} dir - The directory path to process.
     * @param {Function} callback - Function to call with each file's path.
     */
    const recurseDir = (dir, callback) => {
      readdirSync(dir).forEach((f) => {
        let dirPath = join(dir, f);
        let isDirectory = statSync(dirPath).isDirectory();
        isDirectory ? recurseDir(dirPath, callback) : callback(join(dir, f));
      });
    };

    /**
     * Minify a given JavaScript file using esbuild.
     *
     * @param {string} filePath - The path to the JavaScript file to minify.
     */
    const minifyFile = (filePath) => {
      if (extname(filePath) === ".js") {
        // Determine the new path for the minified file.
        let newFilePath = join(destDir, relative(srcDir, filePath));
        let newFileDir = dirname(newFilePath);

        // Ensure the directory for the minified file exists.
        mkdirSync(newFileDir, { recursive: true });

        // Use esbuild to minify the file.
        exec(
          `../../node_modules/.bin/esbuild ${filePath} --minify --outfile=${newFilePath}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            if (stderr) {
              console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
          }
        );
      }
    };

    // Start the minification process by recursively processing each file.
    recurseDir(srcDir, minifyFile);
  }
}