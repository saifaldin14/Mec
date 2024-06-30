/**
 * Custom router class that wraps Express router.
 */

import express from "express";

export default class Router {
  /**
   * Constructor function for the Router class.
   * It initializes an instance of Express router.
   */
  constructor() {
    /**
     * The Express router instance.
     * @type {Object}
     */
    this.router = express.Router();
  }

  /**
   * Registers a route with the specified path, handler, and HTTP method.
   *
   * @param {string} path - The path of the route.
   * @param {function} handler - The handler function for the route.
   * @param {string} [type='get'] - The HTTP method for the route. Defaults to 'get'.
   */
  addRoute(path, handler, type = "get") {
    this.router[type](path, handler);
  }

  /**
   * Middleware function wrapper. This function is used by Express to execute
   * the provided middleware function and then call the next middleware in the
   * chain.
   *
   * @param {string} name - The name of the middleware.
   * @param {function} middleware - The middleware function to be registered.
   */
  addMiddleware(name, middleware) {
    this.router.use((req, res, next) => {
      // Execute the middleware function with the request and response objects.
      middleware(req, res);
      // Call the next middleware in the chain.
      next();
    });
  }
}