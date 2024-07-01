import Mec from "mec-framework";

/**
 * Main application skeleton
 */
const app = await Mec.initialize();

// Create server instance with specified options
const server = await app.createServer({
  name: "new-app",
  routesRootDir: "routes",
  port: 9000,
});

// Root View
server.addClientView("/", "mec", {
  title: "Mec ",
});

server.addStaticDirectory("/static", "static");
