import process from "node:process";
import Logger from "./app/logger.js";
import { Server } from "./server/server.js";
import { Optimize } from "./frontend/optimize.js";
import Database from "./db/index.js";

/**
 * Main MecApp class to set up and manage the application.
 */
class MecApp {
  /**
   * Constructor to set up the initial state of the application.
   *
   * It creates a global `mec` object and initializes the models.
   * Additionally, it optimizes front-end component files if the node environment is set to production.
   */
  constructor() {
    // Creating a global object to hold application-level data.
    global.mec = {};

    /**
     * Optimize front-end component files if the environment is production.
     *
     * It creates an instance of the Optimize class and calls the minifyScripts method.
     */
    if (process.env.NODE_ENV === "production") {
      const optimize = new Optimize();
      optimize.minifyScripts();
    }
  }

  /**
   * Initializes core components of the application such as the logger and database.
   *
   * @return {MecApp} Returns the current instance of the MecApp for chaining.
   */
  async initialize() {
    mec.logger = new Logger(); // Initializing logger
    this.db = new Database(); // Setting up the database.
    await this.db.authenticate(); // Authenticating with the database.
    mec.db = this.db; // Assigning the database instance to the global object.

    return this;
  }

  /**
   * Creates a new server instance with the given options or default settings.
   *
   * @param {object} serverOpts - Configuration options for the server.
   *                              Includes port, routesRootDir, and gql flag.
   * @return {Server} Returns the server instance.
   */
  async createServer(serverOpts = {}) {
    const defaults = { port: 8081, routesRootDir: process.cwd(), gql: false }; // Default server settings.
    const options = { ...defaults, ...serverOpts }; // Merging user options with default settings.

    return await new Server(options).create(); // Creating and returning a server instance.
  }
}

const Mec = new MecApp();
export default Mec;