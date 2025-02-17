import chokidar from "chokidar";
import { spawn } from "node:child_process";
import initDev from "./init-dev.js";
import create from "./create.js";
import makeDebug from "debug";

const debug = makeDebug("mec:commands");
let server;

/**
 * Restarts the server process.
 * If a server process is already running, it is killed with SIGTERM signal.
 * Then, a new server process is started with the command "node --no-deprecation app.js".
 * The new server process inherits the standard I/O streams of the parent process.
 *
 * @returns {void}
 */
const restartServer = () => {
  if (server) {
    // If a server process is already running, kill it with SIGTERM signal
    server.kill("SIGTERM");
  }

  server = spawn("node", ["--no-deprecation", "app.js"], { stdio: "inherit" });

  // Add an event listener for when the server process closes
  server.on("close", (code, signal) => {
    if (signal) {
      debug(`Server process was killed with signal ${signal}`);
    } else if (code !== null) {
      console.log(`Server process exited with code ${code}`);
    } else {
      console.log("Server process exited");
    }
  });
}

/**
 * Restarts the server when a change is detected in the current directory.
 *
 * Watches for changes in the current directory and restarts the server
 * whenever a change is detected. Ignores changes in the 'node_modules' directory
 * and hidden files/folders.
 *
 * @returns {void}
 */
const restartDev = () => {
  const ignores = ["node_modules", /(^|[\/\\])\../];

  // Start watching the current directory for changes
  chokidar
    .watch(".", {
      ignored: ignores,
    })
    .on("all", (_, _) => {
      // When a change is detected, restart the server
      restartServer();
    });
}

export { restartDev, create, initDev };