import { render } from "@lit-labs/ssr";
import { html } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

import makeDebug from "debug";
const debug = makeDebug("mec:frontend-renderer");

/**
 * Renderer class is responsible for rendering lit components in a server-side context.
 */
export class Renderer {
  /**
   * Constructor for the Renderer class.
   * @param {string} name - The name of the component being rendered.
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Renders a given lit component along with necessary scripts and styles.
   *
   * @param {Function} component - The lit component to render.
   * @param {Object} request - The express.js request object.
   * @param {Object} response - The express.js response object.
   * @param {Object} options - Options for rendering like title.
   * @returns {Promise<unknown>} - The rendered HTML as a promise.
   */
  async render(component, request, response, options) {
    const title = `<title>${options.title}</title>`;
    const entrypoint = `<script type="module">await import("/components/${this.name}.js");</script>`;
    debug(`Entrypoint file ${entrypoint}`);
    const componentRender =
      component !== null ? component(request, response) : "";

    // Rendering the complete HTML including the component, styles, and scripts.
    return render(html`
      <!-- This is the root HTML template for the server-side rendered application -->
      <!DOCTYPE html>
      <html>
        <head>
          ${unsafeHTML(title)}
          <!-- Dynamically insert the title -->
        </head>
        <style>
          /* Styles to hide the body content until the component is ready. */
          body[dsd-pending] {
            display: none;
          }
        </style>
        <body dsd-pending>
          <script>
            // Check if the browser supports declarative Shadow DOM
            if (HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot")) {
              // If it does, remove the 'dsd-pending' attribute from the body
              document.body.removeAttribute("dsd-pending");
            }
          </script>
          <script type="importmap">
            {
              "imports": {
                "mec": "/_framework/mec.js",
                "lit": "/_framework/lit.js",
                "lit-html": "/_framework/lit-html.js",
                "hydrate-lit-html": "/_framework/lib/lit-html.js",
                "lit-html/private-ssr-support.js": "/_framework/private-ssr-support.js",
                "lit-html/directive.js": "/_framework/directive.js",
                "lit-html/directive-helpers.js": "/_framework/directive-helpers.js",
                "@lit/reactive-element": "/_framework/lit-reactive-element.js",
                "lit-element/lit-element.js": "/_framework/lit-element.js",
                "lit-html/is-server.js": "/_framework/lit-html/is-server.js"
              }
            }
          </script>
          ${unsafeHTML(componentRender)}
          <!-- Dynamically render the component -->
          <script type="module">
            // Importing hydration support for lit components.
            const litHydrateSupportInstalled = import(
              "/_framework/lit-element-hydrate-support.js"
            );

            // Check if the browser supports declarative Shadow DOM
            if (!HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot")) {
              // If it doesn't, import the polyfill and call the hydrateShadowRoots function
              const { hydrateShadowRoots } = await import(
                "/_framework/template-shadowroot.js"
              );

              hydrateShadowRoots(document.body);

              document.body.removeAttribute("dsd-pending");
            }

            // Wait for the lit hydration support to be installed
            await litHydrateSupportInstalled;
          </script>

          ${unsafeHTML(entrypoint)}
          <!-- Insert the component entry point script -->
        </body>
      </html>
    `);
  }
}