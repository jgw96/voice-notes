import { LitElement, css, html, customElement } from 'lit-element';

import './app-home';

import { Router } from '@vaadin/router';

import '../components/header';


@customElement('app-index')
export class AppIndex extends LitElement {

  static get styles() {
    return css`
      #routerOutlet memo-detail, #routerOutlet app-home {
        width: 100% !important;
      }

      #routerOutlet > .leaving {
        animation: 160ms fadeOut ease-in-out;
      }
    
      #routerOutlet > .entering {
        animation: 160ms fadeIn linear;
      }
    
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
    
        to {
          opacity: 0;
        }
      }
    
      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }
    
        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      ({
        path: "",
        animate: true,
        children: [
          {
            path: "/",
            component: 'app-home',
          },
          {
            path: "/new",
            component: "app-new",
            action: async () => {
              await import('./app-new.js');
            }
          },
          {
            path: "/memo/:name",
            component: "memo-detail",
            action: async () => {
              await import('./memo-detail.js');
            }
          },
        ]
      } as any)
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