import { animate, svg } from 'animejs';
import { tracksData } from '../data/tracks-data.js';

export class RacingTrackVisualizer {
  constructor() {
    this.currentAnimation = null;
    this.currentAccentAnimation = null;
    this.isPlaying = true;
    this.currentSpeed = 1;
    this.currentTrack = null;
    this.tracks = tracksData;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateTrackOptions('f1');
    this.updateRotationSpeed(1);
  }

  setupEventListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.updateTrackOptions(e.target.dataset.category);
      });
    });
    document.getElementById('track-select').addEventListener('change', (e) => {
      if (e.target.value) {
        const [category, trackId] = e.target.value.split('-');
        this.loadTrack(category, trackId);
      }
    });
    document.getElementById('play-pause').addEventListener('click', () => this.toggleAnimation());
    document.getElementById('reset').addEventListener('click', () => this.resetAnimation());
    document.getElementById('speed-slider').addEventListener('input', (e) => this.updateSpeed(parseFloat(e.target.value)));
  }

  updateTrackOptions(category) {
    const select = document.getElementById('track-select');
    select.innerHTML = '<option value="">Select a track...</option>';
    Object.entries(this.tracks[category]).forEach(([trackId, track]) => {
      const option = document.createElement('option');
      option.value = `${category}-${trackId}`;
      option.textContent = track.name;
      select.appendChild(option);
    });
  }

  loadTrack(category, trackId) {
    this.stopAnimation();
    const track = this.tracks[category][trackId];
    this.currentTrack = { category, trackId, ...track };
    document.getElementById('track-name').textContent = track.name;

    const svgElement = document.getElementById('track-svg');
    svgElement.setAttribute('viewBox', track.viewBox);

    const carColors = {
      f1: '#e10600',
      motogp: '#ff9900',
      wec: '#00ffc8'
    };

    const trackGroup = document.getElementById('track-group');
    trackGroup.innerHTML = `
      <path class="track-base" d="${track.path}"></path>
      <path id="track-accent-path" class="track-accent ${category}-track" d="${track.path}"></path>
      <g id="car-foreign" class="car">
        <circle cx="0" cy="0" r="15" fill="${carColors[category] || '#00ffc8'}" />
      </g>
    `;

    this.startAnimation();
  }

  startAnimation() {
    if (!this.currentTrack) return;

    const pathSelector = '#track-accent-path';
    const carSelector = '#car-foreign';
    const duration = (this.currentTrack.duration || 4000) / this.currentSpeed;

    if (this.currentAccentAnimation) this.currentAccentAnimation.pause();
    this.currentAccentAnimation = animate(svg.createDrawable(pathSelector), {
      draw: '0 1',
      ease: 'linear',
      duration: duration,
      loop: true
    });

    if (this.currentAnimation) this.currentAnimation.pause();
    this.currentAnimation = animate(carSelector, {
      ease: 'linear',
      duration: duration,
      loop: true,
      ...svg.createMotionPath(pathSelector)
    });

    this.isPlaying = true;
    document.getElementById('play-pause').textContent = 'Pause';
    this.setRotatorPlayState('running');
  }

  stopAnimation() {
    if (this.currentAnimation) {
      this.currentAnimation.pause();
      this.currentAnimation = null;
    }
    if (this.currentAccentAnimation) {
      this.currentAccentAnimation.pause();
      this.currentAccentAnimation = null;
    }
  }

  toggleAnimation() {
    if (!this.currentAnimation) return;
    if (this.isPlaying) {
      this.currentAnimation.pause();
      this.currentAccentAnimation.pause();
      this.setRotatorPlayState('paused');
      document.getElementById('play-pause').textContent = 'Play';
    } else {
      this.currentAnimation.play();
      this.currentAccentAnimation.play();
      this.setRotatorPlayState('running');
      document.getElementById('play-pause').textContent = 'Pause';
    }
    this.isPlaying = !this.isPlaying;
  }

  resetAnimation() {
    if (this.currentAnimation) {
      this.currentAnimation.restart();
      this.currentAccentAnimation.restart();
      if (!this.isPlaying) {
        this.currentAnimation.pause();
        this.currentAccentAnimation.pause();
      }
    }
  }

  updateSpeed(speed) {
    this.currentSpeed = speed;
    document.getElementById('speed-value').textContent = `${speed}x`;
    if (this.currentTrack) {
      this.loadTrack(this.currentTrack.category, this.currentTrack.trackId);
    }
    this.updateRotationSpeed(speed);
  }

  updateRotationSpeed(multiplier) {
    const rotator = document.querySelector('.svg-rotator');
    if (rotator) {
      rotator.style.animationDuration = `${16 / multiplier}s`;
    }
  }

  setRotatorPlayState(state) {
    const rotator = document.querySelector('.svg-rotator');
    if (rotator) {
      rotator.style.animationPlayState = state;
    }
  }
}