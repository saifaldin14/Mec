import { html, MecComponent, MecRouter } from "mec-framework";

const routes = [
  {
    path: "/client-render",
    template: "<nested-component></nested-component>",
  },
  {
    path: "/page",
    template: "<navigated-component></navigated-component>",
  },
];

export class ClientRender extends MecComponent {
  static properties = {};

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.router = new MecRouter("client-render", routes, this.shadowRoot);
  }

  render() {
    return html``;
  }
}

customElements.define("client-render-two", ClientRender);
