/**
 * File routing middleware.
 * Automatically registers routes based on the file structure in /routes.
 * Supports GET, POST, and GraphQL schema files.
 */

import fs from "fs";
import path from "path";
import makeDebug from "debug";
import { makeExecutableSchema } from "@graphql-tools/schema";

const debug = makeDebug("mec:file-router");

/**
 * Registers route handlers based on files in the routes directory.
 * @param {string} dir - The routes directory
 * @param {object} app - Express app instance
 * @param {object} gql - Apollo Server instance (optional)
 * @returns {object} - GraphQL schemas
 */
export const fileRoutes = async (dir, app, gql) => {
  let schemas = [];

  /**
   * Recursively reads files in the routes directory and registers route handlers.
   * @param {string} dir - The current directory to read
   * @param {object} app - Express app instance
   * @param {object} gql - Apollo Server instance (optional)
   * @returns {object} - GraphQL schemas
   */
  const fileRoutesInternal = async (dir, app, gql) => {
    let files = [];
    const root = dir;

    try {
      files = fs.readdirSync(root);
    } catch (err) {
      debug(`No file based routes found, skipping... ${err}`);
    }

    for (const file of files) {
      const filePath = path.join(root, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        await fileRoutesInternal(filePath, app, gql);
      } else if (stat.isFile() && path.extname(filePath) === ".js") {
        // Parse the file path to get the route path
        const pathArray = filePath.split(path.sep);
        const routePath = `/${pathArray.slice(pathArray.indexOf("routes") + 1, -1).join("/")}`;

        // Parse the file name to get the route name and file type
        const fileBlocks = path.basename(filePath).split(".");
        const routeName = fileBlocks[0];
        const fileType = fileBlocks[1];

        const routeHandler = await import(`file:///${filePath}`);

        debug(`Registering ${fileType.toUpperCase()} ${routePath} `);

        // Construct the API path based on the route path and route name
        const apiPath = routePath === "/" ? `/${routeName}` : `${routePath}/${routeName}`;

        // Register route handlers based on the file type
        if (fileType === "js" && routeName === "_index") {
          app.get(routePath, routeHandler.default);
        } else if (fileType === "get" || fileType === "js") {
          app.get(apiPath, routeHandler.default);
        } else if (fileType === "post") {
          // TODO: Pass, no route handler registered for POST requests
        } else if (fileType === "gql" && gql) {
          const { typeDefs, resolvers } = await import(`file:///${filePath}`);
          const schema = makeExecutableSchema({ typeDefs, resolvers });
          schemas.push(schema);
        }
      }
    };

    await fileRoutesInternal(dir, app, gql);
    return { schemas };
  }
}
