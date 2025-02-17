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
      const pathNameSplit = window.location.pathname.split("/");
      const pathSegs = pathNameSplit.length > 1 ? pathNameSplit.slice(1) : "";

      router.loadRoute(...pathSegs);
    }

    window.addEventListener("pushstate", onNavigate);
    window.addEventListener("popstate", onNavigate);
  }

  /**
   * Updates the browser URL and displays the matched route template.
   *
   * @param {...string} urlSegs - Segments of the URL.
   */
  loadRoute(...urlSegs) {
    const matchedRoute = this._matchUrlToRoute(urlSegs);
    const url = `/${urlSegs.join("/")}`;

    history.pushState({}, "", url);

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
    const routeMatches = (route) => {
      const routePathSegs = route.path.split("/").slice(1);

      if (routePathSegs.length !== urlSegs.length) {
        return false;
      }

      return routePathSegs.every(
        (routePathSeg, i) => routePathSeg === urlSegs[i]
      );
    };

    return this.routes.find(routeMatches);
  }

  /**
   * Load the route based on the current URL when the router is first initialized.
   * It extracts the path segments from the current URL and passes them to the
   * loadRoute method.
   */
  _loadInitialRoute() {
    const pathNameSplit = window.location.pathname.split("/").slice(1);
    const pathSegs = pathNameSplit.length > 1 ? pathNameSplit : "";
    this.loadRoute(...pathSegs);
  }
}