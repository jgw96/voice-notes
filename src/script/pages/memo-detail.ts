import { LitElement, css, html, customElement, property } from 'lit-element';
import { Note } from '../../types/interfaces';
import { getMemo } from '../services/data';
import { Router } from '@vaadin/router';
import { set, get } from 'idb-keyval';

import "../components/app-toast";

declare var TimestampTrigger: any;


@customElement('memo-detail')
export class MemoDetail extends LitElement {

  @property() memo: Note | undefined = undefined;
  @property({ type: String }) reminderTime: string;
  @property({ type: Boolean }) showToast: boolean = false;
  @property({ type: Boolean }) showOneToast: boolean = false;
  @property({ type: Boolean }) showErrorToast: boolean = false;

  fileToUpload: any;

  static get styles() {
    return css`
      #backButton {
        border: none;
        background: transparent;
        position: fixed;
        right: 6px;
        top: 12px;
      }

      #backButton img {
        height: 30px;
      }

      #nameBlock {
        font-size: 16px;
        margin-left: 16px;
      }

      ul {
        padding-left: 16px;
      }

      li {
        font-size: 1.1em;
        font-weight: bold;
        margin-bottom: 10px;
      }

      #detailActions {
        display: flex;
        align-items: center;

        position: fixed;
        bottom: 0;
        width: 100%;
        justify-content: space-evenly;
        left: 0;
        right: 0;

        padding-top: 10px;
        padding-bottom: 10px;

        background: var(--app-color-primary);

        animation-name: slideup;
        animation-duration: 300ms;
      }

      #detailActions button {
        color: white;
        background: none;
        border: solid 1px white;
        border-radius: 2px;
        text-transform: uppercase;

        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 7.6em;
        padding: 6px 9px;
        cursor: pointer;
      }

      #detailActions img {
        width: 24px;
      }

      h2 {
        font-size: 20px;
      }

      #reminder, #exportToOnedrive {
        display: flex;
        flex-direction: column;
        width: 18em;
        margin-top: 1em;
        font-size: 17px;
      }

      #exportToOnedrive {
        align-items: flex-end;
        margin-top: 2em;
      }

      #exportToOnedrive button {
        background: var(--app-color-primary);
        color: white;
        border-radius: 4px;
        padding: 8px;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
      }

      #reminder label{
        font-weight: bold;
        margin-bottom: 6px;
      }

      #reminder button{
        color: var(--app-color-primary);
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4em;
        background: none;
        border-width: 1px;
        border-style: solid;
        border-color: var(--app-color-primary);
        border-image: initial;
        border-radius: 2px;
        padding: 6px 9px;
        margin-top: 1em;
        align-self: flex-end;
      }

      input {
        padding: 8px;
        color: var(--app-color-primary);
        border-radius: 4px;
        border: solid 2px var(--app-color-primary);
      }

      ul {
        background: #444444;
        border-radius: 4px;
        padding-left: 2em;
        padding-top: 1em;
        padding-bottom: 0.6em;
        padding-right: 2em;
        margin-right: 1em;
        width: fit-content;
      }

      @keyframes slideup {
        from {
          transform: translateY(50px);
        }

        to {
          transform: translateY(0);
        }
      }

      @keyframes slidedown {
        from {
          transform: translateY(-50px);
        }

        to {
          transform: translateY(0);
        }
      }

      @media(prefers-color-scheme: dark) {
        #nameBlock {
          color: white;
        }

        #detailActions button {
          color: white;
        }

        #reminder button {
          color: white;
        }
      }

      @media(prefers-color-scheme: light) {
        #backButton {
          background: #bbbbbb;
          border-radius: 50%;
          height: 3em;
          width: 3em;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        ul {
          background: lightgrey;
        }
      }

      @media (min-width: 1000px) {
        #detailActions {
          justify-content: flex-end;

          top: 0;
          bottom: initial;

          animation-name: slidedown;
        }

        #detailActions button {
          margin-right: 1em;
        }

        #nameBlock {
          margin-top: 5em;
        }

        #backButton {
          height: 4.35em;
          background: #686bd2;
          top: 0;
          width: 4em;

          left: 0;
          z-index: 1;
          cursor: pointer;
          background: #5759af;

          animation-name: slidedown;
          animation-duration: 300ms;
        }

        #nameBlock {
          padding-left: 12em;
          padding-right: 12em;
        }
      }

    `;
  }

  constructor() {
    super();

    this.reminderTime = new Date().toISOString();
  }

  async firstUpdated() {
    console.log(location.pathname.split("/").pop());
    const name = location.pathname.split("/").pop();
    this.memo = await getMemo(decodeURI(name || "") || "");
  }

  close() {
    Router.go("/");
  }

  async shareNote(memo: Note | undefined) {
    if (memo) {
      const file = new File([memo.blob], memo.name);

      if ((navigator as any).canShare && (navigator as any).canShare(file)) {
        await (navigator as any).share({
          file: file,
          title: 'Note',
          text: 'Check out this note',
        })
      }
    }
  }

  async download(memo: Note | undefined) {
    const opts = {
      type: 'save-file',
      accepts: [{
        description: 'audio file',
        extensions: ['weba'],
        mimeTypes: ['audio/webm'],
      }],
    };
    const handle = await (window as any).chooseFileSystemEntries(opts);

    const writable = await handle.createWritable();

    if (memo) {
      await writable.write(memo.blob);
      await writable.close();
    }
  }

  async deleteNote(memo: Note | undefined) {
    if (memo) {
      const notes: Note[] = await get('notes');

      notes.forEach(async (note: Note) => {
        if (memo.name === note.name) {
          const index = notes.indexOf(note);

          if (index > -1) {
            notes.splice(index, 1);

            await set('notes', notes);
          }
        }
      })
    }
  }

  handleDate(event: any) {
    console.log(event.target.value);
    this.reminderTime = event.target.value;
  }

  askPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (result) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
      .then(function (permissionResult) {
        if (permissionResult !== 'granted') {
          throw new Error('We weren\'t granted permission.');
        }
      });
  }

  async setReminder() {
    try {
      await this.askPermission();

      const r: any = await navigator.serviceWorker.getRegistration();
      console.log(r);

      if (r) {
        r.showNotification("Memos Reminder", {
          tag: Math.random(),
          body: `Your reminder from Memos: ${location.href}`,
          showTrigger: new TimestampTrigger(Date.now() + (new Date(this.reminderTime).getTime() - Date.now())),
          icon: "/assets/icons/icon_256.png"
        });

        this.showToast = true;

        setTimeout(() => {
          this.showToast = false;
        }, 3000)
      };
    }
    catch {
      console.log("couldnt set reminder");
    }
  }

  async export() {
    try {
      let provider = (window as any).mgt.Providers.globalProvider;

      console.log(provider);
      if (provider) {
        let graphClient = provider.graph.client;
        const driveItem = await graphClient.api('/me/drive/root/children').middlewareOptions((window as any).mgt.prepScopes('user.read', 'files.readwrite.all')).post({
          "name": "memosapp",
          "folder": {}
        });

        this.fileToUpload = await graphClient.api(`/me/drive/items/${driveItem.id}:/${this.memo?.name}.weba:/content`).middlewareOptions((window as any).mgt.prepScopes('user.read', 'files.readwrite.all')).put(this.memo?.blob);

        this.showOneToast = true;

        setTimeout(() => {
          this.showOneToast = false;
        }, 1400)
      }
    }
    catch (err) {
      this.showErrorToast = true;

      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000)
    }
  }

  render() {
    return html`
      <div>
        <header>
          <button id="backButton" @click="${this.close}">
            <img src="/assets/close.svg" alt="close icon">
          </button>
        </header>

        <div id="nameBlock">
          <h2>${this.memo?.name}</h2>

          ${this.memo ? html`<audio .src="${URL.createObjectURL(this.memo?.blob)}" controls>` : null}

          <div id="reminder">
            <label for="reminder-time">Set a Reminder:</label>

            <input type="datetime-local" id="reminder-time"
                  name="reminder-time" @change="${this.handleDate}" .value="${this.reminderTime}">

            <button @click="${() => this.setReminder()}">Set</button>
          </div>

          <div id="exportToOnedrive">
            <button @click="${this.export}">Export To OneDrive</button>
          </div>

          <div id="detailActions">
                <button id="shareButton" @click="${() => this.shareNote(this.memo)}">Share <img src="/assets/share.svg" alt="share icon"></button>
                <button id="downloadButton" @click="${() => this.download(this.memo)}">Save <img src="/assets/save.svg" alt="Save icon"></button>
                <button @click="${() => this.deleteNote(this.memo)}">Delete <img src="/assets/close.svg" alt="close icon"></button>
          </div>

          ${this.memo?.transcript && this.memo?.transcript.length > 0 ? html`<h4>Transcript</h4>` : null}

          ${
      this.memo?.transcript && this.memo?.transcript.length > 0 ? html`
              <ul>
              ${
        this.memo?.transcript.map((line: any) => {
          return html`
                   <li>${line}</li>
                  `
        })
        }
              </ul>
            ` : null
      }
        </div>
      </div>

      ${this.showToast ? html`<app-toast>reminder set</app-toast>` : null}

      ${this.showOneToast ? html`<app-toast>Exported to OneDrive <a .href="${this.fileToUpload.webUrl}">Link</a></app-toast>` : null}

      ${this.showErrorToast ? html`<app-toast>Must be signed in</app-toast>` : null}
    `;
  }
}