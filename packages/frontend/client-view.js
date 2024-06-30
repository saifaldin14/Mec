import makeDebug from "debug";

const debug = makeDebug("mec:frontend-client-view");

import { Renderer } from "./renderer.js";
import { cwd } from "node:process";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import path from "path";

/**
 * ClientView class responsible for managing the view components for the client-side.
 */
export class ClientView {
  /**
   * Constructs a ClientView instance.
   *
   * @property {string} name - The name of the view component.
   * @property {object} options - Configuration options for the view.
   */
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  /**
   * Asynchronously loads and renders the client-side component view.
   *
   * @param {object} request - The incoming HTTP request object.
   * @param {object} response - The outgoing HTTP response object.
   * @return {Promise<object>} Returns a promise that resolves to the collected rendering result.
   * @throws Will throw an error if the component is not found or not a function.
   */
  async create(request, response) {
    // Dynamically import the component using the provided name from the views directory.
    const viewPath = path.join(cwd(), "/views/", `${this.name}.js`);
    debug(`Creating view path: ${viewPath}`);

    // Import the component file using the file URL protocol.
    const component = await import(`file:///${viewPath}`);

    // Check if the imported component has a default export and it's a function.
    if (!component.default) {
      throw new Error(
        `Component ${this.name} is not a function or could not be found!`
      );
    }

    // Create a new Renderer instance for the component and render it.
    const result = await new Renderer(this.name).render(
      component.default,
      request,
      response,
      this.options
    );

    // Aggregate the rendering results and return the collected result.
    return await collectResult(result);
  }
}