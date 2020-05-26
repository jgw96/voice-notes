import { LitElement, css, html, customElement, property } from 'lit-element';
import { Router } from '@vaadin/router';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { get, set } from 'idb-keyval';
import { Note } from '../../types/interfaces';

@customElement('app-home')
export class AppHome extends LitElement {

  @property({ type: Array }) notes: Note[] | null = null;

  static get styles() {
    return css`
      button {
        cursor: pointer;
      }

      #newButton {
        background: none;
        border: solid 1px white;
        border-radius: 2px;
        color: white;
        padding: 6px;
        padding-left: 12px;
        padding-right: 12px;
        text-transform: uppercase;

        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 9em;
      }

      #newButton img {
        height: 18px;
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
        background: var(--app-color-primary);
        height: 3.4em;
        justify-content: flex-end;
        align-items: center;
        display: flex;
        padding-right: 16px;
        z-index: 9999;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        padding: 16px;
      }

      ul li {
        background: #686bd2bd;
        backdrop-filter: blur(10px);
        color: white;
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 2px;
        padding-bottom: 12px;
        border-radius: 16px;

        margin-bottom: 1em;
      }

      ul li:nth-child(-n+4) {
        animation-name: slidein;
        animation-duration: 300ms;
      }

      ul li audio {
        height: 34px;
      }

      ul li h5 {
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
      }

      .listHeader button {
        background: transparent;
        border: none;
        cursor: pointer;
      }

      .listHeader button img {
        height: 2em;
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
        color: white;
        margin-left: 4em;
        margin-right: 4em;
        font-size: 14px;
        text-align: center;
        margin-top: 4em;
      }

      #shareButton img, #downloadButton img {
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
        margin-top: 10px;
      }

      #detailBlock button{
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
        }

        pwa-install {
          top: 12px;
        }
      }

      @media(prefers-color-scheme: dark) {
        #firstIntro, #secondIntro {
          color: white;
        }
      }

      @media (min-width: 1000px) {
        ul {
          display: grid;
          grid-template-columns: auto auto;
          grid-gap: 16px;
          padding-left: 12em;
          padding-right: 12em;
        }

        #introImg {
          bottom: 16px;
          width: 40em;
        }

        #toolbar {
          top: 0;
          background: transparent;
        }

        #newButton {
          background: var(--app-color-primary);
          color: white;
          border-radius: 4px;
        }
      }

      @media (min-width: 1400px) {
        ul {
          padding-left: 18em;
          padding-right: 18em;
        }
      }

      @media(spanning: single-fold-vertical) {
        #welcomeBlock {
          width: 50%;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    const notes: Note[] = await get('notes');

    if (notes) {
      this.notes = notes;
    }
  }

  newNote() {
    Router.go('/new');
  }

  async deleteNote(i: Note) {
    const notes: Note[] = await get('notes');

    notes.forEach(async (note: Note) => {
      if (i.name === note.name) {
        const index = notes.indexOf(note);

        if (index > -1) {
          notes.splice(index, 1);

          this.notes = notes;

          await set('notes', notes);
        }
      }
    })
  }

  async shareNote(note: Note) {
    const file = new File([note.blob], note.name);

    if ((navigator as any).canShare && (navigator as any).canShare(file)) {
      await (navigator as any).share({
        file: file,
        title: 'Note',
        text: 'Check out this note',
      })
    }
  }

  async download(i: Note) {
    const opts = {
      type: 'save-file',
      accepts: [{
        description: 'audio file',
        extensions: ['webm'],
        mimeTypes: ['audio/webm'],
      }],
    };
    const handle = await (window as any).chooseFileSystemEntries(opts);

    const writable = await handle.createWritable();
    await writable.write(i.blob);
    await writable.close();
  }

  async detail(memo: Note) {
    console.log(memo);
    Router.go(`memo/${memo.name}`)
  }

  render() {
    return html`
    <app-header></app-header>

      <div>

        ${this.notes && this.notes.length > 0 ? html`<ul>
          ${this.notes.map(i => html`<li>
            <div class="listHeader">
              <h5 @click="${() => this.detail(i)}">${i.name}</h5>

              <div id="listHeaderActions">
                <button id="shareButton" @click="${() => this.shareNote(i)}"><img src="/assets/share.svg" alt="share icon"></button>
                <button id="downloadButton" @click="${() => this.download(i)}"><img src="/assets/save.svg" alt="Save icon"></button>
                <button @click="${() => this.deleteNote(i)}"><img src="/assets/close.svg" alt="close icon"></button>
              </div>
            </div>
            <audio .src="${URL.createObjectURL(i.blob)}" controls></audio>

            <div id="detailBlock">
              <button @click="${() => this.detail(i)}">Details</button>
            </div>
          </li>`)}
        </ul>` : html`<p id="firstIntro">
          Quickly and easily record an audio memo for yourself,
          tap the button below to start recording a new note!
        </p>

        <p id="secondIntro">
          All notes are only stored locally on your device, leaving you in complete control of your data.
        </p>
        
        `}
        <div id="toolbar">
          <button @click="${this.newNote}" id="newButton">
            New Note
            <img src="/assets/plus.svg" alt="add icon">
          </button>
        </div>

        <pwa-install>Install Memos</pwa-install>
      </div>

      <img id="introImg" src="/assets/intro.webp" alt="intro image">

    `;
  }
}