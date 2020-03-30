import { LitElement, css, html, customElement } from 'lit-element';

import './app-home';

import { Router } from '@vaadin/router';

import '../components/header';


@customElement('app-index')
export class AppIndex extends LitElement {

  static get styles() {
    return css`

    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      { path: '/', component: 'app-home' },
      {
        path: "/new",
        component: "app-new",
        action: async() => {
          await import('./app-new.js');
        }
      },
      {
        path: "/about",
        component: "app-about",
        action: async() => {
          await import('./app-about.js');
        },
      }
    ]);
  }

  render() {
    return html`
      <div>
        <main>
          <div id="routerOutlet"></div>
        </main>
      </div>
    `;
  }
}