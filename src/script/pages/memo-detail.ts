import { LitElement, css, html, customElement, property } from "lit-element";
import { Note } from "../../types/interfaces";
import { getMemo } from "../services/data";
import { Router } from "@vaadin/router";
import { set, get } from "idb-keyval";
import { fileSave } from "browser-nativefs";

import "../components/app-toast";

declare var TimestampTrigger: any;

@customElement("memo-detail")
export class MemoDetail extends LitElement {
  @property() memo: Note | undefined = undefined;
  @property({ type: String }) reminderTime: string;
  @property({ type: Boolean }) showToast: boolean = false;

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

      #deleteButton {
        background: var(--accent-fill-rest);
      }

      @media (min-width: 800px) {
        #backButton {
          border-radius: 0px !important;
        }
      }

      #backButton img {
        height: 30px;
      }

      #nameBlock {
        font-size: 16px;
        margin-left: 16px;
        margin-bottom: 6em;
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
        justify-content: flex-end;
        left: 0;
        right: 0;

        padding: 6px;

        background: var(--app-color-primary);

        animation-name: slideup;
        animation-duration: 300ms;
      }

      #detailActions fast-button {
        cursor: pointer;
        margin-left: 8px;
      }

      #detailActions img {
        width: 14px;
      }

      h2 {
        font-size: 20px;
      }

      #reminder,
      #exportToOnedrive {
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
        border-radius: 4px;
        padding: 8px;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
      }

      #reminder label {
        font-weight: bold;
        margin-bottom: 6px;
      }

      #reminder fast-button {
        width: 5em;
        align-self: flex-end;
        margin-top: 16px;
      }

      input {
        padding: 8px;
        color: var(--app-color-primary);
        border-radius: 4px;
        border: solid 2px var(--app-color-primary);
      }

      #reminder-time {
        width: 93%;
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

      @media (prefers-color-scheme: dark) {
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

      @media (prefers-color-scheme: light) {
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

      @media (prefers-color-scheme: light) {
        fast-button {
          background: #e5e5e5;
          color: black;
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
          height: 3.9em;
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

      @media (max-width: 800px) {
        #detailActions button {
          height: 3em;
        }
      }

      @media (horizontal-viewport-segments: 2) {
        #nameBlock {
          display: flex;
          padding-left: 4em;
          padding-right: 0;
          margin-left: 0;
          justify-content: space-between;
        }

        #nameBlock div {
          flex: 1;
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
          title: "Note",
          text: "Check out this note",
        });
      }
    }
  }

  async download(memo: Note | undefined) {
    const options = {
      // Suggested file name to use, defaults to `''`.
      fileName: "Untitled.weba",
      // Suggested file extensions (with leading '.'), defaults to `''`.
      extensions: [".aac"],
      mimeTypes: ["audio/aac"],
    };

    if (memo) {
      await fileSave(memo.blob, options);
    }
  }

  async deleteNote(memo: Note | undefined) {
    if (memo) {
      const notes: Note[] | undefined = await get("notes");

      if (notes) {
        notes.forEach(async (note: Note) => {
          if (memo.name === note.name) {
            const index = notes.indexOf(note);

            if (index > -1) {
              notes.splice(index, 1);

              await set("notes", notes);
            }
          }
        });
      }
    }

    Router.go("/");
  }

  handleDate(event: any) {
    console.log(event.target.value);
    this.reminderTime = event.target.value;
  }

  askPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (
        result
      ) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    }).then(function (permissionResult) {
      if (permissionResult !== "granted") {
        throw new Error("We weren't granted permission.");
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
          showTrigger: new TimestampTrigger(
            Date.now() + (new Date(this.reminderTime).getTime() - Date.now())
          ),
          icon: "/assets/icons/icon_256.png",
        });

        this.showToast = true;

        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    } catch {
      console.log("couldnt set reminder");
    }
  }

  render() {
    return html`
      <div>
        <header>
          <button id="backButton" @click="${this.close}">
            <img src="/assets/close.svg" alt="close icon" />
          </button>
        </header>

        <div id="nameBlock">
          <div>
            <h2>${this.memo?.name}</h2>

            ${this.memo
              ? html`<audio
                  .src="${URL.createObjectURL(this.memo?.blob)}"
                  controls
                ></audio>`
              : null}

            <div id="detailActions">
              <fast-button
                id="shareButton"
                @click="${() => this.shareNote(this.memo)}"
                >Share</fast-button
              >
              <fast-button
                id="downloadButton"
                @click="${() => this.download(this.memo)}"
                >Save</fast-button
              >
              <fast-button
                id="deleteButton"
                @click="${() => this.deleteNote(this.memo)}"
                >Delete</fast-button
              >
            </div>
          </div>

          <div>
            ${this.memo?.transcript && this.memo?.transcript.length > 0
              ? html`<h3>Transcript</h3>`
              : html`<h3>No Transcript</h3>`}
            ${this.memo?.transcript && this.memo?.transcript.length > 0
              ? html`
                  <ul>
                    ${this.memo?.transcript.map((line: any) => {
                      return html` <li>${line}</li> `;
                    })}
                  </ul>
                `
              : null}
          </div>
        </div>
      </div>

      ${this.showToast ? html`<app-toast>reminder set</app-toast>` : null}
    `;
  }
}
