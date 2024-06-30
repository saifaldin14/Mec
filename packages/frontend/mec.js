import { LitElement as MecComponent, html, css } from "lit";
import MecRouter from "./router.js";

/**
 * MecInternal class represents the core of the Mec application.
 * Currently, it serves as a placeholder with no internal logic.
 */
class MecInternal {
  /**
   * Constructor for the MecInternal class.
   */
  constructor() {}
}

/**
 * Mec function provides an instance of the MecInternal class.
 *
 * @return {MecInternal} An instance of the MecInternal class.
 */
export default function Mec() {
  return new MecInternal();
}

// Additional named exports for external use.
export { html, css, MecComponent, MecRouter };