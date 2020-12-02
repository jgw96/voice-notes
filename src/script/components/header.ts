import { LitElement, css, html, customElement, property } from 'lit-element';

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

        position: sticky;
        top: 0;

        z-index: 999999;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }

      mgt-login {
        margin-right: 1em;
        z-index: 999999;
        --color: white;
      }

      #nameSpan {
        margin-right: 8em;
        background: var(--app-color-primary);
        padding: 6px;
        border-radius: 22px;
        padding-left: 16px;
        padding-right: 16px;
      }

      #loginDiv {
        display: flex;
      }

      @media (max-width: 800px) {
        mgt-login {
          margin-right: 0em;
        }
      }

      @media (prefers-color-scheme: light) {
        header {
          background: #ffffffb8;
          backdrop-filter: blur(10px);
        }

        mgt-login {
          --color: var(--app-color-primary);
        }
      }

      @media (prefers-color-scheme: dark) {
        header {
          color: white;
          background: #181818d9;
          backdrop-filter: blur(10px);
        }

        mgt-login {
          --popup-content-background-color: #444444;
          --popup-color: white;
          --color: white;
          --background-color--hover: #444444;
          --color-hover: white;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <h1>Memos</h1>

        <div id="loginDiv">

          <slot></slot>
        </div>
      </header>
    `;
  }
}