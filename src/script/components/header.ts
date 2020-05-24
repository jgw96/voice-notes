import { LitElement, css, html, customElement, property } from 'lit-element';

import '@pwabuilder/pwaauth';
import { set } from 'idb-keyval';

@customElement('app-header')
export class AppHeader extends LitElement {

  @property({ type: String }) username: string | null = null;

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
        font-size: 20px;
        font-weight: bold;
      }

      pwa-auth {
        margin-right: 9em;
      }

      pwa-auth::part(signInButton) {
        background: none;
        border: solid 1px;
        border-radius: 2px;
        padding: 6px;
        padding-left: 12px;
        padding-right: 12px;
        text-transform: uppercase;

        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 800px) {
        pwa-auth {
          margin-right: 0em;
        }
      }

      @media (prefers-color-scheme: dark) {
        header {
          color: white;
        }

        pwa-auth::part(signInButton) {
          color: white;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    this.shadowRoot?.querySelector('pwa-auth')?.addEventListener('signin-completed', async (e: any) => {
      console.log(e.detail);

      if (e.detail.providerData) {
        await set('local', e.detail.providerData)
      }

      this.username = e.detail.name;
    })
  }

  render() {
    return html`
      <header>
        <h1>Memos</h1>

        ${this.username && this.username.length > 1 ? html`<span>${this.username}</span>` : html`<pwa-auth 
          microsoftkey="e7e2eedb-420c-4034-8f16-a6cd4e3c81b5"
          credentialmode="none"
          menuPlacement="end">
        </pwa-auth>`}
      </header>
    `;
  }
}