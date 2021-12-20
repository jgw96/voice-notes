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

      #innerAudio {
        box-shadow: #00000059 2px 2px 8px 2px;
        display: flex;
        flex-direction: column;
        padding: 1em 2em 2em 2em;
      }

      @media(prefers-color-scheme: light) {
        #innerAudio {
          background: white;
          box-shadow: none;
        }
      }

      @media(prefers-color-scheme: dark) {
        #innerAudio {
          background: var(--neutral-fill-active);
        }
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
        width: 12em;

        animation-name: slideup;
        animation-duration: 300ms;
      }

      #recordButton img {
        height: 14px;
      }
      
      #stopButton {
        background: red;
        width: 12em;

        animation-name: slideup;
        animation-duration: 300ms;
      }

      #stopButton img {
        height: 14px;
      }

      #saveButton {
        background: var(--app-color-primary);

        align-self: flex-end;
        margin-top: 2em;
      }

      @media(prefers-color-scheme: light) {
        #saveButton {
          color: white;
        }
      }

      #audioDiv {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 56vh;
      }

      #audioDiv h3 {
        font-size: 1.6em;
      }

      input {
        margin-bottom: 1em;
        width: 14em;
        border-radius: 4px;
        border: solid 2px;
        padding: 12px;
        font-size: 16px;
        border-color: var(--app-color-primary);
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
      }

      @media(min-width: 800px) {
        #backButton {
          border-radius: 0px !important;
        }

        #recordButton, #stopButton {
          position: fixed;
          top: 10px;
          right: 5em;
          animation: none;
        }
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

      @media (prefers-color-scheme: light) {
        #transcript {
          color: black;
        }

        #recordButton, #stopButton {
          color: white;
        }
      }

      @media(max-width: 800px) {
        #recordButton, #stopButton {
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

      @media(prefers-color-scheme: light) {
        fast-button {
          background: #e5e5e5;
          color: black;
        }
      }

      @media (max-width: 400px) {
        #innerAudio audio {
          width: auto;
        }

        #innerAudio {
          margin-top: 6em;
        }
      }

      @media(horizontal-viewport-segments: 2) {
        #introText {
          width: 33%;
        }

        #audioDiv {
          width: 49vw;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {

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

        if (e.result.text && e.result.text.length > 0) {
          this.lines.push(e.result.text);
        }
      }
    }
  }

  async startRecording() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(this.stream);

    this.analyser = audioContext.createAnalyser();

    source.connect(this.analyser);

    this.analyser.fftSize = 2048;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.runVisual(dataArray);

    this.recorded = null;
    this.recording = true;

    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge();
    }

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

    if ('wakeLock' in navigator) {
      await this.requestWakeLock();
    }

    this.recog.startContinuousRecognitionAsync();
  }

  stopRecording() {
    const track = this.stream?.getTracks()[0];
    track?.stop();

    this.mediaRecorder?.stop();

    this.recog.stopContinuousRecognitionAsync();

    this.recording = false;

    const blob = new Blob(this.recordedChunks, {type: "audio/webm"});

    this.recorded = blob;

    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge();
    }
  }

  runVisual(data: Uint8Array) {
    let onscreenCanvas = null;

    if ('OffscreenCanvas' in window) {
      onscreenCanvas = this.shadowRoot?.querySelector('canvas')?.getContext('bitmaprenderer');
    }
    else {
      onscreenCanvas = this.shadowRoot?.querySelector('canvas');
    }

    let canvas = null;

    if ('OffscreenCanvas' in window) {
      // @ts-ignore
      canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    }
    else {
      canvas = document.createElement('canvas');
    }
    

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext('2d');

    context?.clearRect(0, 0, canvas.width, canvas.height);

    this.draw(data, context, canvas, onscreenCanvas);
  }

  // @ts-ignore
  draw(data: Uint8Array, context: any, canvas: HTMLCanvasElement | OffscreenCanvas, onScreenCanvas: ImageBitmapRenderingContext | HTMLCanvasElement | null | undefined) {
    this.analyser?.getByteFrequencyData(data);

    context.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#181818' : '#edebe9';
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

    if ('OffscreenCanvas' in window) {
      // @ts-ignore
      let bitmapOne = (canvas as OffscreenCanvas).transferToImageBitmap();
      (onScreenCanvas as ImageBitmapRenderingContext).transferFromImageBitmap(bitmapOne);
    }

    window.requestAnimationFrame(() => this.draw(data, context, canvas, onScreenCanvas));
  }

  async save() {
    const notes: Note[] | undefined = await get('notes');

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

    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge();
    }

    Router.go('/');
  }

  handleInput(event: any) {
    this.fileName = event.target?.value;
  }

  async requestWakeLock() {
    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Wake Lock is active');
    } catch (err: any) {
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

      <div part="wrapper">

      <canvas part="canvas"></canvas>

      ${this.transcript && this.recording ? html`<span id="transcript" part="transcript">${this.transcript}</span>` : null}

        ${!this.recording && this.recorded === null ? html`<h3 id="introText">Tap the Start Recording button to start a new note!</h3>` : null}

        ${
      this.recorded ? html`<div id="audioDiv" part="audioDiv">

         <div id="innerAudio">
           <h3>New Note</h3>

            <input type="text" placeholder="note name..." @change="${this.handleInput}" .value="${this.fileName}">

            <audio controls .src="${URL.createObjectURL(this.recorded)}"></audio>

            <fast-button id="saveButton" @click="${this.save}">Save</fast-button>
         </div>
          
        </div>` : null
      }
        
        <div id="toolbar">
          ${!this.recording ? html`<fast-button @click="${this.startRecording}" id="recordButton">
            Start Recording
            <img src="/assets/mic.svg" alt="mic icon">
          </fast-button>` : html`<fast-button id="stopButton" @click="${this.stopRecording}">
            Stop Recording
            <img src="/assets/stop.svg" alt="stop icon">
          </fast-button>`}
        </div>
      </div>
    `;
  }
}