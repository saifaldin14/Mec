/**
 * Server class - wraps and configures back-end servers.
 */

import express from "express";
import http from "http";
import { fileRoutes } from "./file-router.js";
import path, { dirname } from "path";
import { createGraphqlServer } from "./graphql.js";
import Router from "./router.js";
import { cwd } from "node:process";
import { ClientView } from "../frontend/client-view.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Valid HTTP methods
const VALID_METHODS = [
  "all",
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
];

export class Server {
  /**
   * Constructor
   *
   * @param {Object} options - The configuration options for the server.
   * @param {number} options.port - The port number to listen on.
   * @param {string} options.routesRootDir - The root directory for the server routes.
   * @param {boolean} [options.gql=false] - Whether to enable GraphQL server or not.
   */
  constructor(options) {
    this.app = express();
    this.port = options.port;
    this.routesRootDir = options.routesRootDir;
    this.gql = options.gql || false;
  }

  /**
   * Creates and starts the server.
   *
   * @return {Promise<Server>} Returns a promise that resolves to the server instance.
   */
  async create() {
    const app = this.app;
    const httpServer = http.createServer(app);

    app.listen(this.port);
    console.log(`Mec Server (PID: ${process.pid}) started on port: ${this.port}`);

    // Register file-based routes
    const result = await fileRoutes(
      path.join(cwd(), this.routesRootDir),
      app,
      this.gql
    );

    if (this.gql)
      await createGraphqlServer(app, httpServer, result.schemas);

    // Define framework paths
    const frameworkPaths = {
      "/_framework/lit-element-hydrate-support.js": [
        "@lit-labs",
        "ssr-client",
        "lit-element-hydrate-support.js",
      ],
      "/_framework/lit.js": ["lit", "index.js"],
      "/_framework/lit-html.js": ["lit-html", "lit-html.js"],
      "/_framework/lit-reactive-element.js": [
        "@lit",
        "reactive-element",
        "reactive-element.js",
      ],
      "/_framework/lit-element.js": ["lit-element", "lit-element.js"],
      "/_framework/lit-html/is-server.js": ["lit-html", "is-server.js"],
      "/_framework/css-tag.js": ["@lit", "reactive-element", "css-tag.js"],
      "/_framework/lib/hydrate-lit-html.js": [
        "@lit-labs",
        "ssr-client",
        "lib",
        "hydrate-lit-html.js",
      ],
      "/_framework/private-ssr-support.js": [
        "lit-html",
        "private-ssr-support.js",
      ],
      "/_framework/directive.js": ["lit-html", "directive.js"],
      "/_framework/directive-helpers.js": ["lit-html", "directive-helpers.js"],
      "/_framework/template-shadowroot.js": [
        "@webcomponents",
        "template-shadowroot",
        "template-shadowroot.js",
      ],
      "/_framework/_implementation/feature_detect.js": [
        "@webcomponents",
        "template-shadowroot",
        "_implementation",
        "feature_detect.js",
      ],
      "/_framework/_implementation/default_implementation.js": [
        "@webcomponents",
        "template-shadowroot",
        "_implementation",
        "default_implementation.js",
      ],
      "/_framework/_implementation/manual_walk.js": [
        "@webcomponents",
        "template-shadowroot",
        "_implementation",
        "manual_walk.js",
      ],
      "/_framework/_implementation/util.js": [
        "@webcomponents",
        "template-shadowroot",
        "_implementation",
        "util.js",
      ],
    };

    // Register framework paths
    for (const [route, segments] of Object.entries(frameworkPaths)) {
      app.get(route, (_, res) => {
        res.sendFile(
          path.join(__dirname, "..", "..", "node_modules", ...segments)
        );
      });
    }

    // Define local framework paths
    const localFrameworkPaths = {
      "/_framework/mec.js": ["..", "frontend", "mec.js"],
      "/_framework/router.js": ["..", "frontend", "router.js"],
    };

    // Register local framework paths
    for (const [route, segments] of Object.entries(localFrameworkPaths)) {
      app.get(route, (_, res) => {
        res.sendFile(path.join(__dirname, ...segments));
      });
    }

    // Register static paths
    if (process.env.NODE_ENV === "production") {
      app.use("/components", express.static(".mec/components"));
    } else {
      app.use("/components", express.static("components"));
    }

    app.use("/views", express.static("views"));
    app.use("/static", express.static("static"));

    return this;
  }

  /**
   * Adds a route to the application.
   *
   * @param {string} path - The path where the route will be accessible.
   * @param {function} handler - The handler function for the route.
   * @param {string} [type="get"] - The HTTP method for the route.
   * @throws {Error} Throws an error if the route is invalid.
   */
  addRoute(path, handler, type = "get") {
    type = type.toLowerCase();

    // Check if the method is valid and the path and handler are provided
    if (VALID_METHODS.includes(type) && path && handler) {
      // Add the route to the application
      this.app[type](path, handler);
    } else {
      throw new Error(
        `Invalid route for ${path} with type: '${type}' and handler: ${handler}`
      );
    }
  }

  /**
   * Adds a client view to the application.
   *
   * @param {string} path - The path where the client view will be accessible.
   * @param {string} name - The name of the client view.
   * @param {Object} options - Additional options for the client view.
   * @param {string} options.title - The title of the client view.
   */
  addClientView(path, name, options) {
    const server = this;

    /**
     * Handles the request and returns the client view.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise} A promise that resolves to the client view.
     */
    const handleRequest = async (req, res) => {
      const view = await server.createClientView(name, req, res, {
        title: options.title,
      });
      res.setHeader("Content-Type", "text/html");
      return res.send(view);
    };

    server.addRoute(path, handleRequest);
  }

  /**
   * Adds middleware to the application.
   *
   * @param {string} name - The name of the middleware.
   * @param {Function} middleware - The middleware function to be added.
   */
  addMiddleware(name, middleware) {
    this.app.use((req, res, next) => {
      // Call the middleware function
      middleware(req, res);
      // Call the next middleware in the stack
      next();
    });
  }

  /**
   * Creates a client view with the specified name and options.
   *
   * @param {string} name - The name of the client view.
   * @param {Object} request - The request object.
   * @param {Object} response - The response object.
   * @param {Object} options - Additional options for the client view.
   * @return {Promise<string>} A promise that resolves to the HTML content of the client view.
   */
  async createClientView(name, request, response, options) {
    // Create a new client view with the specified name and options.
    const view = await new ClientView(name, options).create(request, response);

    // Return the HTML content of the client view.
    return view;
  }

  /**
   * Creates a nested router with the specified route path.
   *
   * @param {string} route - The route path to attach the router to.
   * @return {Router} A new Router instance.
   */
  createRouter(route) {
    const newRouter = new Router();

    // Attach the router to the specified route path.
    this.app.use(route, newRouter.router);
    return newRouter;
  }

  /**
   * Registers a static directory to the server.
   *
   * @param {string} path - The path to serve the static directory from.
   * @param {string} directory - The directory containing the static files.
   */
  addStaticDirectory(path, directory) {
    // Use the express static middleware to serve the static directory
    // from the specified path.
    this.app.use(path, express.static(directory));
  }
}