import { html, MecComponent } from "mec-framework";

export class MecSample extends MecComponent {
  static properties = {};

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <h1>Mec Sample</h1>
      </div>
    `;
  }
}

customElements.define("mec-sample", MecSample);
