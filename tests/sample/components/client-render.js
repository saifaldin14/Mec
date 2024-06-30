import { html, MecComponent } from "mec";

export class ClientRender extends MecComponent {
  static properties = {};

  constructor() {
    super();
  }

  render() {
    return html`
      <div>
        <h1>Client Component!</h1>
      </div>
    `;
  }
}

customElements.define("client-render", ClientRender);
