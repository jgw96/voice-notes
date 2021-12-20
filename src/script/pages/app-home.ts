import { LitElement, css, html, customElement, property } from "lit-element";
import { Router } from "@vaadin/router";

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import "@pwabuilder/pwainstall";

import "./app-new";

import { get, set } from "idb-keyval";
import { Note } from "../../types/interfaces";

@customElement("app-home")
export class AppHome extends LitElement {
  @property({ type: Array }) notes: Note[] | null = null;
  @property({ type: Boolean }) dualScreenStart: boolean = false;

  static get styles() {
    return css`
      button {
        cursor: pointer;
      }

      #newButton {
        background: var(--app-color-primary);
      }

      #newButton img {
        height: 14px;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;

        --install-button-color: var(--app-color-primary);
      }

      #toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #181818c9
        backdrop-filter: blur(10px);
        height: 3.4em;
        justify-content: flex-end;
        align-items: center;
        display: flex;
        padding-right: 16px;
        z-index: 9999;
      }

      #homeWrapper {
        background-color: transparent;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        margin-bottom: 2em;
        padding: 16px;

        background-color: transparent;
      }

      ul fast-card {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 2px;
        padding-bottom: 12px;

        margin-bottom: 1em;

        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
      }

      ul fast-card {
        padding: 12px;
      }

      ul fast-card:nth-child(-n + 4) {
        animation-name: slidein;
        animation-duration: 300ms;
      }

      ul fast-card audio {
        height: 34px;
        width: 70%;
      }

      ul fast-card h5 {
        margin-top: 12px;
        font-size: 18px;
        margin-bottom: 16px;
        margin-left: 4px;
        width: 100%;
        cursor: pointer;
      }

      .listHeader {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .listHeader h3 {
        margin-top: 0;
        margin-bottom: 0;
        overflow: hidden;

        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .listHeader button {
        background: transparent;
        border: none;
        cursor: pointer;
      }

      @media(prefers-color-scheme: light) {
        .listHeader button {
          background: var(--app-color-primary);
          border-radius: 50%;
          height: 2.4em;
          width: 2.4em;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 6px;
          margin-right: 4px;
        }
      }

      #listHeaderActions button img {
        height: 20px;
      }

      #firstIntro {
        text-align: center;
        font-weight: bold;
        margin-left: 3em;
        margin-right: 3em;
        font-size: 1.2em;
        margin-top: 2em;
      }

      #secondIntro {
        margin-left: 4em;
        margin-right: 4em;
        font-size: 14px;
        text-align: center;
        margin-top: 4em;
      }

      #shareButton img,
      #downloadButton img {
        height: 20px;
      }

      .listHeader #listHeaderActions {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #introImg {
        width: 24em;
        position: fixed;
        bottom: 3.6em;
        right: 0;

        z-index: -1;
      }

      #detailBlock {
        display: flex;
        justify-content: flex-end;
        margin-top: auto;
      }

      #detailBlock button {
        color: var(--app-color-primary);
        background: white;
        border: none;
        font-size: 16px;
        font-weight: bold;
        border-radius: 4px;
        padding: 6px;
      }

      @keyframes slidein {
        from {
          transform: translateY(20px);
          opacity: 0;
        }

        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideup {
        from {
          transform: translateY(50px);
        }

        to {
          transform: translateY(0);
        }
      }

      @media (max-width: 800px) {
        #toolbar {
          animation-name: slideup;
          animation-duration: 300ms;

          padding-left: 16px;

          background: #181818c7;
          backdrop-filter: blur(10px);
        }

        app-header #newButton {
          display: none;
        }

        #toolbar #newButton {
          margin-top: initial;
          flex: 1;
        }

        pwa-install {
          top: 12px;
          bottom: initial;

          display: none;
        }

        ul fast-card {
          border-radius: 8px;
        }
      }

      @media(max-width: 800px) and (prefers-color-scheme: light) {
        #toolbar {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
        }
      }

      @media (prefers-color-scheme: light) {
        #firstIntro, #secondIntro {
          color: black;
        }

        fast-card {
          background: white;
        }
      }

      @media (prefers-color-scheme: dark) {
        #firstIntro,
        #secondIntro {
          color: white;
        }

        fast-card {
          color: white;
        }
      }

      @media (min-width: 1000px) {
        ul {
          display: grid;
          grid-gap: 16px;
          padding-right: 10em;

          padding-left: 16px;
          grid-template-columns: auto auto auto;
        }

        #introImg {
          bottom: 16px;
          width: 40em;
        }

        #toolbar {
          display: none;
        }

        #newButton {
          background: var(--app-color-primary);
        }
      }

      @media (min-width: 1400px) {
        ul {
          padding-left: 18em;
          padding-right: 18em;
        }
      }

      @media(prefers-color-scheme: light) {
        fast-button {
          background: #e5e5e5;
          color: black;
        }

        #newButton {
          color: white;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        ul {
          width: calc(env(fold-left) - 32px);
          padding-left: 16px;
          padding-right: 16px;

          grid-template-columns: auto auto;
          gap: 16px 16px 16px;
          grid-column-gap: calc(env(viewport-segment-left 1 0) - env(viewport-segment-right 0 0) + 16px);
        }

        app-new {
          display: flex;
          width: 50%;
          position: absolute;
          right: 0;
          bottom: 0;
          top: 0;
          background: white;
          z-index: 999999;
        }

        app-new::part(canvas) {
          right: 0;
          position: absolute;
          bottom: 0;
          top: 0;
        }

        app-new::part(transcript) {
          width: 50%;
        }

        app-new::part(wrapper) {
          width: 100%;
        }

        app-new::part(audioDiv) {
          margin-top: 2em;
        }
      }

      @media (prefers-color-scheme: dark) {
        app-new {
          background: #181818;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    await this.getNotes();
  }

  async getNotes() {
    const notes: Note[] | undefined = await get("notes");

    if (notes) {
      this.notes = notes;
    }
  }

  newNote() {
    if (window.matchMedia("(screen-spanning: single-fold-vertical)").matches) {
      this.dualScreenStart = true;
    } else {
      Router.go("/new");
    }
  }

  async deleteNote(i: Note) {
    const notes: Note[] | undefined = await get("notes");

    if (notes) {
      notes.forEach(async (note: Note) => {
        if (i.name === note.name) {
          const index = notes.indexOf(note);

          if (index > -1) {
            notes.splice(index, 1);

            this.notes = notes;

            await set("notes", notes);
          }

          await this.getNotes();
        }
      });
    }
  }

  async shareNote(note: Note) {
    const file = new File([note.blob], note.name);

    if ((navigator as any).canShare && (navigator as any).canShare(file)) {
      await (navigator as any).share({
        file: file,
        title: "Note",
        text: "Check out this note",
      });
    }
  }

  async download(memo: Note | undefined) {
    const browserfs = await import("browser-nativefs");

    const options = {
      // Suggested file name to use, defaults to `''`.
      fileName: "Untitled.weba",
      // Suggested file extensions (with leading '.'), defaults to `''`.
      extensions: [".aac"],
      mimeTypes: ["audio/aac"],
    };

    if (memo) {
      await browserfs.fileSave(memo.blob, options);
    }
  }

  async detail(memo: Note) {
    console.log(memo);
    Router.go(`memo/${memo.name}`);
  }

  checkConnection() {
    if ((navigator as any).connection) {
      const type = (navigator as any).connection.effectiveType;

      if (type === "4g") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  render() {
    return html`
      <app-header>
        <fast-button @click="${this.newNote}" id="newButton">
          New Note
          <img src="/assets/plus.svg" alt="add icon" />
        </fast-button>
      </app-header>

      <div id="homeWrapper">
        ${this.notes && this.notes.length > 0
          ? html`<ul>
              ${this.notes.map(
                (i) => html`
          <fast-card>

          <div class="listHeader">
            <h3 @click="${() => this.detail(i)}">${i.name}</h3>


            
              <div id="listHeaderActions">
                  <button id="shareButton" @click="${() =>
                    this.shareNote(
                      i
                    )}"><img src="/assets/share.svg" alt="share icon"></button>
                  <button id="downloadButton" @click="${() =>
                    this.download(
                      i
                    )}"><img src="/assets/save.svg" alt="Save icon"></button>
                  <button @click="${() =>
                    this.deleteNote(
                      i
                    )}"><img src="/assets/close.svg" alt="close icon"></button>
                </div>
              </div>
            </div>
            <audio .src="${URL.createObjectURL(i.blob)}" controls></audio>

            <div id="detailBlock">
              <fast-button @click="${() =>
                this.detail(i)}">Details</fast-button>
            </div>
        </fast-card>
          `
              )}
            </ul>`
          : html`<p id="firstIntro">
                Quickly and easily record an audio memo for yourself, tap the
                Start Recording button to record a new note!
              </p>

              <p id="secondIntro">
                All notes are only stored locally on your device, leaving you in
                complete control of your data.
              </p> `}
        <div id="toolbar">
          <fast-button @click="${this.newNote}" id="newButton">
            New Note
            <img src="/assets/plus.svg" alt="add icon" />
          </fast-button>
        </div>

        ${this.dualScreenStart ? html`<app-new></app-new>` : null}

        <pwa-install>Install Memos</pwa-install>
      </div>
    `;
  }
}
