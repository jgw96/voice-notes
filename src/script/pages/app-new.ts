import { LitElement, css, html, customElement, property } from 'lit-element';
import { Router } from '@vaadin/router';

import { set, get } from 'idb-keyval';
import { Note } from '../../types/interfaces';

@customElement('app-new')
export class AppNew extends LitElement {

  @property({ type: Boolean }) recording: boolean = false;
  @property({ type: Blob }) recorded: Blob | null = null;
  @property({ type: String }) fileName: string | null = null;
  @property({ type: String }) transcript: string | null = null;

  analyser: AnalyserNode | null = null;
  stream: MediaStream | null = null;
  recordedChunks: Blob[] = [];
  mediaRecorder: MediaRecorder | null = null;
  recog: any;
  lines: any[] = [];
  wakeLock: any = null;

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
        color: white;
        padding: 6px;
        padding-left: 12px;
        padding-right: 12px;
        text-transform: uppercase;

        display: flex;
        align-items: center;
        justify-content: space-between;

        width: 14em;

        animation-name: slideup;
        animation-duration: 300ms;
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
        right: 6px;
      }

      #backButton img {
        height: 30px;
      }

      canvas {
        height: 100vh;
        width: 100%;

        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
      }

      #transcript {
        position: fixed;
        top: 8em;
        color: white;
        font-weight: bold;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        font-size: 1.2em;
        text-align: center;
      }

      @media(max-width: 800px) {
        #recordButton {
          width: 100%;
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

      @media(prefers-color-scheme: dark) {
        #introText {
          color: white !important;
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

  async firstUpdated() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });

    const audioContext = new window.AudioContext();
    const source = audioContext.createMediaStreamSource(this.stream);

    this.analyser = audioContext.createAnalyser();

    source.connect(this.analyser);

    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.runVisual(dataArray);

    (window as any).requestIdleCallback(async () => {
      // speech to text
      //@ts-ignore
      await (import('/assets/speech.js') as any);

      const audioConfig = (window as any).SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription('94691c9f125a497b917e0c60eeec9197', 'westus');

      speechConfig.speechRecognitionLanguage = 'en-us';

      this.recog = new (window as any).SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      console.log(this.recog);

      this.setUpListeners();
    })
  }

  setUpListeners() {
    this.lines = [];

    if (this.recog) {
      this.recog.recognizing = (s?: any, e?: any) => {
        console.log(s);
        window.console.log(e.result);

        if ('requestIdleCallback' in window) {
          // Use requestIdleCallback to schedule work.
          (window as any).requestIdleCallback(() => {
            this.transcript = e.result.text;
          });
        }
      };

      this.recog.recognized = (s?: any, e?: any) => {
        console.log(s);
        console.log('recognized', e.result.text);

        this.lines.push(e.result.text);
      }
    }
  }

  async startRecording() {
    this.recorded = null;
    this.recording = true;

    (navigator as any).setAppBadge();

    const options = { mimeType: 'audio/webm' };

    if (this.stream) {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(1000);
    }

    await this.requestWakeLock();

    this.recog.startContinuousRecognitionAsync();
  }

  stopRecording() {
    const track = this.stream?.getTracks()[0];
    track?.stop();

    this.mediaRecorder?.stop();

    this.recog.stopContinuousRecognitionAsync();

    this.recording = false;

    const blob = new Blob(this.recordedChunks);

    this.recorded = blob;

    (navigator as any).clearAppBadge();
  }

  runVisual(data: Uint8Array) {
    const onscreenCanvas = this.shadowRoot?.querySelector('canvas')?.getContext('bitmaprenderer');
    const canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext('2d');

    context?.clearRect(0, 0, canvas.width, canvas.height);

    this.draw(data, context, canvas, (onscreenCanvas as ImageBitmapRenderingContext));
  }

  draw(data: Uint8Array, context: any, canvas: OffscreenCanvas, onScreenCanvas: ImageBitmapRenderingContext) {
    this.analyser?.getByteFrequencyData(data);

    context.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#292929' : 'white';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    let barWidth = (window.innerWidth / data.length) * 4.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      barHeight = data[i];

      context.fillStyle = 'rgb(' + (barHeight + 100) + ',107,210)';
      context.fillRect(x, window.innerHeight - barHeight * 4, barWidth, barHeight * 4);

      x += barWidth + 1;
    }

    let bitmapOne = canvas.transferToImageBitmap();
    onScreenCanvas.transferFromImageBitmap(bitmapOne);

    window.requestAnimationFrame(() => this.draw(data, context, canvas, onScreenCanvas));
  }

  async save() {
    const notes: Note[] = await get('notes');

    if (notes && this.recorded) {
      notes.push({ name: this.fileName || "No name provided", blob: this.recorded, transcript: this.lines });
      await set('notes', notes);
    }
    else {
      await set('notes', [{ name: this.fileName, blob: this.recorded, transcript: this.lines }]);
    }

    if (this.wakeLock) {
      this.wakeLock.release();
    }

    (navigator as any).clearAppBadge();

    Router.go('/');
  }

  handleInput(event: any) {
    this.fileName = event.target?.value;
  }

  async requestWakeLock() {
    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  close() {
    const track = this.stream?.getTracks()[0];
    track?.stop();

    this.recog.stopContinuousRecognitionAsync();

    if (this.wakeLock) {
      this.wakeLock.release();
    }

    Router.go('/');
  }

  render() {
    return html`
      <header>
        <button id="backButton" @click="${this.close}">
          <img src="/assets/close.svg" alt="close icon">
        </button>
      </header>

      <div>

      <canvas></canvas>

      ${this.transcript && this.recording ? html`<span id="transcript">${this.transcript}</span>` : null}

        ${!this.recording && this.recorded === null ? html`<h3 id="introText">Hit the button below to start recording!</h3>` : null}

        ${
      this.recorded ? html`<div id="audioDiv">
          <h3>New Note</h3>

          <input type="text" placeholder="note name..." @change="${this.handleInput}" .value="${this.fileName}">

          <audio controls .src="${URL.createObjectURL(this.recorded)}"></audio>

          <button id="saveButton" @click="${this.save}">Save</button>
        </div>` : null
      }
        
        <div id="toolbar">
          ${this.recording ? html`<span>Recording...</span>` : html`<span></span>`}
          ${!this.recording ? html`<button @click="${this.startRecording}" id="recordButton">
            Start Recording
            <img src="/assets/mic.svg" alt="mic icon">
          </button>` : html`<button id="stopButton" @click="${this.stopRecording}">
            <img src="/assets/stop.svg" alt="stop icon">
          </button>`}
        </div>
      </div>
    `;
  }
}