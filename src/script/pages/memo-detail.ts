import { LitElement, css, html, customElement, property } from 'lit-element';
import { Note } from '../../types/interfaces';
import { getMemo } from '../services/data';
import { Router } from '@vaadin/router';
import { set, get } from 'idb-keyval';


@customElement('memo-detail')
export class MemoDetail extends LitElement {

  @property() memo: Note | undefined = undefined;

  static get styles() {
    return css`
      #backButton {
        border: none;
        background: transparent;
        position: fixed;
        top: 16px;
        right: 6px;
      }

      #backButton img {
        height: 30px;
      }

      #nameBlock {
        color: white;
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

      #listHeaderActions {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-top: 14px;
      }

      #listHeaderActions button {
        background: transparent;
        border: none;
        padding: 8px;
        display: flex;
        align-items: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        width: 5.6em;
        justify-content: space-between;
        border: solid var(--app-color-primary);
        border-radius: 8px;
        margin-right: 12px;
      }

      #listHeaderActions img {
        width: 24px;
      }

      h4 {
        font-size: 1.2em;
      }

    `;
  }

  constructor() {
    super();
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
    await writable.write(memo?.blob);
    await writable.close();
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

          <div id="listHeaderActions">
                <button id="shareButton" @click="${() => this.shareNote(this.memo)}">Share <img src="/assets/share.svg" alt="share icon"></button>
                <button id="downloadButton" @click="${() => this.download(this.memo)}">Save <img src="/assets/save.svg" alt="Save icon"></button>
                <button @click="${() => this.deleteNote(this.memo)}">Delete <img src="/assets/close.svg" alt="close icon"></button>
          </div>

          <h4>Transcript</h4>

          ${
      this.memo?.transcript ? html`
              <ul>
              ${
        this.memo?.transcript.map((line) => {
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
    `;
  }
}