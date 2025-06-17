import { html } from 'lit-html';

class AnimationControls {
  constructor(onPlayPause, onReset, onSpeedChange) {
    this.onPlayPause = onPlayPause;
    this.onReset = onReset;
    this.onSpeedChange = onSpeedChange;
  }

  render() {
    return html`
      <div class="animation-controls">
        <button id="play-pause" @click="${this.onPlayPause}">▶Play</button>
        <button id="reset" @click="${this.onReset}">Reset</button>
        <input type="range" id="speed-slider" min="0.1" max="5" step="0.1" value="1" @input="${(e) => this.onSpeedChange(e.target.value)}">
        <span id="speed-value">1x</span>
      </div>
    `;
  }
}

export default AnimationControls;