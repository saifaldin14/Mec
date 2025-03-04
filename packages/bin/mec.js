#!/usr/bin/env node
import yargs from "yargs/yargs";
import { initDev, restartDev, create } from "../dev/commands.js";
import { createRequire } from "node:module";

// Import the package.json file to get the version number by using the createRequire function
const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

/**
 * The main CLI script for the Mec framework.
 * Utilizes yargs for argument parsing and command execution.
 */

// Set up yargs for command-line argument parsing
yargs(process.argv.slice(2))
  .scriptName("mec")
  .usage("$0 <cmd> [args]")
  .command(
    "init",
    "initialize a new Mec app ",
    () => {},
    () => initDev()
  )
  .command("dev", "watch for server changes and restart", () => {}, restartDev)
  .command("create", "create a framework component", () => {}, create)
  .version(version)
  .demandCommand(1, "")

  .help().argv; // Add a default help option // Parse the process arguments