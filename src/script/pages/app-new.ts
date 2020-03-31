import { LitElement, css, html, customElement, property } from 'lit-element';

import { set, get } from 'idb-keyval';
import { Router } from '@vaadin/router';

declare var MediaRecorder: any;

@customElement('app-new')
export class AppNew extends LitElement {

  @property({ type: Boolean }) recording: boolean = false;
  @property({ type: Blob }) recorded: Blob | null = null;
  @property({ type: String }) fileName: string | null = null;

  analyser: AnalyserNode | null = null;
  stream: MediaStream | null = null;
  recordedChunks: any[] = [];
  mediaRecorder: any;

  static get styles() {
    return css`
      button {
        cursor: pointer;
      }

      #toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3.4em;
        justify-content: space-between;
        align-items: center;
        display: flex;
        padding-right: 16px;
        padding-left: 16px;

        color: white;
      }

      #toolbar span {
        font-weight: bold;
        color: var(--app-color-primary);
      }

      #introText {
        text-align: center;
        padding-left: 4em;
        padding-right: 4em;
        height: 45vh;
        justify-content: center;
        align-items: center;
        display: flex;
        font-size: 20px;
      }
      
      #recordButton {
        background: var(--app-color-primary);
        border: solid 1px var(--app-color-primary);
        border-radius: 2px;
        color: var(--app-color-primary);
        padding: 6px;
        padding-left: 12px;
        padding-right: 12px;
        text-transform: uppercase;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #recordButton img {
        height: 22px;
      }
      
      #stopButton {
        background: #ff4141;
        border: none;
        border-radius: 2px;
        color: red;
        padding: 6px;
        text-transform: uppercase;
        padding-left: 12px;
        padding-right: 12px;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #stopButton img {
        height: 22px;
      }

      #saveButton {
        margin-top: 16px;
        background: var(--app-color-primary);
        color: white;
        text-transform: uppercase;
        border: none;
        padding: 10px;
        width: 8em;
        border-radius: 2px;
      }

      #audioDiv {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 56vh;
      }

      input {
        margin-bottom: 1em;
        width: 14em;
        padding: 5px;
        border-radius: 4px;
        border: solid 2px black;
        color: var(--app-color-primary);
      }

      #backButton {
        border: none;
        background: transparent;
        position: fixed;
        top: 8px;
        left: 6px;
      }

      #backButton img {
        height: 30px;
      }

      canvas {
        height: 100vh;
        width: 100%;
      }

      @media(prefers-color-scheme: dark) {
        #introText {
          color: white;
        }

        #audioDiv h3 {
          color: white;
        }

        #toolbar span {
          color: white;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async startRecording() {
    this.recorded = null;

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });

    var options = { mimeType: 'audio/webm' };
    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.start(1000);

    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(this.stream);

    this.analyser = audioContext.createAnalyser();

    source.connect(this.analyser);

    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.runVisual(dataArray);

    this.recording = true;
  }

  stopRecording() {
    const track = this.stream?.getTracks()[0];
    track?.stop();

    this.mediaRecorder.stop();

    this.recording = false;

    const blob = new Blob(this.recordedChunks);

    this.recorded = blob;
  }

  runVisual(data: Uint8Array) {
    const canvas = this.shadowRoot?.querySelector('canvas');

    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const context = canvas?.getContext('2d');

    if (canvas) {
      context?.clearRect(0, 0, canvas.width, canvas.height);

      this.draw(data, context);
    }

  }

  draw(data: Uint8Array, context: any) {
    this.analyser?.getByteFrequencyData(data);

    context.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#292929' : 'white';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    let barWidth = (window.innerWidth / data.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      barHeight = data[i];

      context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      context.fillRect(x, window.innerHeight - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }

    window.requestAnimationFrame(() => this.draw(data, context));
  }

  async save() {
    const notes: any[] = await get('notes');

    if (notes) {
      notes.push({name: this.fileName, blob: this.recorded});
      await set('notes', notes);
    }
    else {
      await set('notes', [{name: this.fileName, blob: this.recorded}]);
    }

    Router.go('/');
  }

  handleInput(event: any) {
    this.fileName = event.target.value;
  }

  close() {
    Router.go('/');
  }

  render() {
    return html`
      <header>
        <button id="backButton" @click="${this.close}">
          <img src="/assets/close.svg">
        </button>
      </heaer>

      <div>

        ${!this.recorded ? html`${!this.recording ? html`<h3 id="introText">Hit the button below to start recording!</h3>` : null } <canvas></canvas>` : html`<div id="audioDiv">
          <h3>New Note</h3>

          <input type="text" placeholder="note name..." @change="${this.handleInput}" .value="${this.fileName}">

          <audio controls .src="${URL.createObjectURL(this.recorded)}"></audio>

          <button id="saveButton" @click="${this.save}">Save</button>
        </div>`}
        
        <div id="toolbar">
          ${this.recording ? html`<span>Recording...</span>` : html`<span></span>`}
          ${!this.recording ? html`<button @click="${this.startRecording}" id="recordButton">
            <img src="/assets/mic.svg">
          </button>` : html`<button id="stopButton" @click="${this.stopRecording}">
            <img src="/assets/stop.svg">
          </button>`}
        </div>
      </div>
    `;
  }
}