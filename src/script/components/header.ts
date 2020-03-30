import { LitElement, css, html, customElement } from 'lit-element';


@customElement('app-header')
export class AppHeader extends LitElement {

  static get styles() {
    return css`
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 16px;
        padding-right: 16px;
        color: var(--app-color-primary);
        height: 3.4em;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 18px;
        font-weight: normal;
      }

      nav {
        width: 7em;
        display: flex;
        justify-content: space-between;
      }

      nav a {
        color: white;
        font-size: 18px;
        font-weight: bold;
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <h1>Voice Notes</h1>
      </header>
    `;
  }
}