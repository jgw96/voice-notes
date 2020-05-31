import { LitElement, css, html, customElement } from 'lit-element';


@customElement('app-toast')
export class AppToast extends LitElement {

  static get styles() {
    return css`
      #toast {
        position: absolute;
        top: 16px;
        right: 16px;
        background: var(--app-color-primary);
        color: white;
        padding: 12px;
        border-radius: 6px;
        font-weight: bold;
        animation-name: slideup;
        animation-duration: 300ms;
      }

      @media(min-width: 800px) {
        #toast {
          bottom: 16px;
          top: initial;

          animation-name: slidedown;
          animation-duration: 300ms;
        }
      }

      @keyframes slideup {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0px);
        }
      }

      @keyframes slidedown {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0px);
        }
      }
    `
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="toast">
        <slot></slot>
      </div>
    `
  }
}