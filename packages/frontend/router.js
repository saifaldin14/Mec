/**
 * MecRouter is a client-side routing mechanism that listens to browser
 * history changes, updates the URL, and displays the matching route template.
 */
export default class MecRouter {
  /**
   * Constructor for the MecRouter class.
   *
   * @param {HTMLElement} element - The DOM element to bind the router.
   * @param {Array} routes - An array of route objects with path and template properties.
   * @param {HTMLElement} root - The DOM element where matched templates will be rendered.
   */
  constructor(element, routes, root) {
    this.element = element;
    this.routes = routes;
    this.root = root;

    const router = this;
    this._loadInitialRoute();

    /**
     * This function handles browser navigation events.
     * It splits the current URL to get its segments and loads the matched route.
     */
    const onNavigate = () => {
      // Split the current URL to get its segments.
      const pathNameSplit = window.location.pathname.split("/");
      const pathSegs = pathNameSplit.length > 1 ? pathNameSplit.slice(1) : "";

      // Load the matched route for the current URL segments.
      router.loadRoute(...pathSegs);
    }

    // Listen to browser navigation events.
    window.addEventListener("pushstate", onNavigate);
    window.addEventListener("popstate", onNavigate);
  }

  /**
   * Updates the browser URL and displays the matched route template.
   *
   * @param {...string} urlSegs - Segments of the URL.
   */
  loadRoute(...urlSegs) {
    // Find the route that matches the given URL segments.
    // The route is matched based on the path segments of the URL.
    const matchedRoute = this._matchUrlToRoute(urlSegs);

    // Construct the full URL from the segments.
    const url = `/${urlSegs.join("/")}`;

    // Update the browser URL with the constructed URL.
    history.pushState({}, "", url);

    // Update the root element's content with the matched route's template.
    // The root element is the DOM element where the matched route's template
    // will be rendered.
    const routerOutElem = this.root;
    routerOutElem.innerHTML = matchedRoute.template;
  }

  /**
   * Match a given URL to one of the defined routes.
   *
   * @param {Array} urlSegs - Segments of the URL.
   * @returns {Object|undefined} The matched route or undefined if no match found.
   */
  _matchUrlToRoute(urlSegs) {
    /**
     * Check if the given URL segments matches the route's path segments.
     *
     * @param {Object} route - The route to match against.
     * @returns {boolean} True if the route matches the URL segments, false otherwise.
     */
    const routeMatches = (route) => {
      const routePathSegs = route.path.split("/").slice(1);

      // If the number of segments in the route's path and the URL is different,
      // the route cannot match the URL.
      if (routePathSegs.length !== urlSegs.length) {
        return false;
      }

      // Check if every segment of the route's path matches the given URL segments.
      return routePathSegs.every(
        (routePathSeg, i) => routePathSeg === urlSegs[i]
      );
    };

    // Find the route that matches the given URL segments.
    return this.routes.find(routeMatches);
  }

  /**
   * Load the route based on the current URL when the router is first initialized.
   * It extracts the path segments from the current URL and passes them to the
   * loadRoute method.
   */
  _loadInitialRoute() {
    // Split the current URL pathname by "/" and remove the empty string
    // obtained from the initial split.
    const pathNameSplit = window.location.pathname.split("/").slice(1);

    // If pathNameSplit is empty, set pathSegs to an empty string.
    // Otherwise, set pathSegs to the sliced array.
    const pathSegs = pathNameSplit.length > 1 ? pathNameSplit : "";
    this.loadRoute(...pathSegs);
  }
}