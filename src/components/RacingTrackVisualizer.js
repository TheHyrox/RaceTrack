import { animate, svg } from 'animejs';
import { trackData } from '../data/tracks-data.js';

export class RacingTrackVisualizer {
  constructor() {
    this.tracks = trackData;
    this.currentTrack = null;
    this.currentAnimation = null;
    this.currentAccentAnimation = null;
    this.isAnimating = false;

    this.handleToggleAnimation = this.toggleAnimation.bind(this);
    this.handleResetAnimation = this.resetAnimation.bind(this);

    this.init();
  }

  init() {
    this.initCustomEventListeners();
    this.handleURLParameters();
  }

  destroy() {
    this.stopAnimation();
    this.removeCustomEventListeners();
  }

  initCustomEventListeners() {
    document.addEventListener('track:toggleAnimation', this.handleToggleAnimation);
    document.addEventListener('track:resetAnimation', this.handleResetAnimation);
  }

  removeCustomEventListeners() {
    document.removeEventListener('track:toggleAnimation', this.handleToggleAnimation);
    document.removeEventListener('track:resetAnimation', this.handleResetAnimation);
  }

  findTrackById(trackId) {
    for (const category in this.tracks) {
      if (Object.prototype.hasOwnProperty.call(this.tracks[category], trackId)) {
        return { category, trackData: this.tracks[category][trackId] };
      }
    }
    return null;
  }

  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('track');
    
    if (trackId) {
      const trackInfo = this.findTrackById(trackId);
      if (trackInfo) {
        this.loadTrack(trackInfo.category, trackId, trackInfo.trackData);
      } else {
        const trackNameElement = document.getElementById('track-name');
        if (trackNameElement) {
          trackNameElement.textContent = `Track with ID '${trackId}' not found.`;
        }
      }
    } else {
      const trackNameElement = document.getElementById('track-name');
      if (trackNameElement) {
        trackNameElement.textContent = 'No track specified. Please select one from a category page.';
      }
    }
  }

  loadTrack(category, trackId, track) {
    this.stopAnimation();
    
    if (!track) {
      console.error(`Track not found: ${category}-${trackId}`);
      return;
    }

    this.currentTrack = { category, trackId, ...track };
    this.updateTrackInfo(track);
    this.renderTrack(track, category);
    
    setTimeout(() => this.startAnimation(), 100);
  }

  updateTrackInfo(track) {
    const trackNameElement = document.getElementById('track-name');
    const trackLengthElement = document.getElementById('track-length');
    const trackLocationElement = document.getElementById('track-location');
    
    if (trackNameElement) trackNameElement.textContent = track.name;
    if (trackLengthElement) trackLengthElement.textContent = track.length || '';
    if (trackLocationElement) trackLocationElement.textContent = track.location || '';
  }

  renderTrack(track, category) {
    const svgElement = document.getElementById('track-svg');
    if (!svgElement) return;
    
    svgElement.setAttribute('viewBox', track.viewBox);

    const carColors = this.getCarColors();
    const trackGroup = document.getElementById('track-group');
    if (!trackGroup) return;
    
    trackGroup.innerHTML = `
      <path class="track-base" d="${track.path}"></path>
      <path id="track-accent-path" class="track-accent ${category}-track" d="${track.path}"></path>
      <g id="car-foreign" class="car">
        <circle cx="0" cy="0" r="15" fill="${carColors[category] || carColors.default}" />
      </g>
    `;
  }

  getCarColors() {
    return {
      f1: '#ff1e04',
      f2: '#043961',
      f3: '#e90300',
      fe: '#14b7ed',
      motogp: '#ffffff',
      wec: '#01b9ff',
      default: '#00ffc8'
    };
  }

  startAnimation() {
    if (!this.currentTrack || this.isAnimating) return;

    this.isAnimating = true;
    document.dispatchEvent(new CustomEvent('animation:stateChanged', { detail: { isPlaying: this.isAnimating } }));
    this.setRotatorPlayState('running');

    const pathSelector = '#track-accent-path';
    const carSelector = '#car-foreign';
    const duration = this.currentTrack.duration || 10000;

    if (this.currentAnimation && this.currentAccentAnimation) {
        this.currentAnimation.play();
        this.currentAccentAnimation.play();
    } else {
        const svgElement = document.getElementById('track-svg');
        if (!svgElement) return;

        this.currentAccentAnimation = animate(svg.createDrawable(pathSelector), {
            draw: '0 1',
            ease: 'linear',
            duration: duration,
            loop: true
        });

        this.currentAnimation = animate(carSelector, {
            ease: 'linear',
            duration: duration,
            loop: true,
            ...svg.createMotionPath(pathSelector)
        });
    }
  }

  stopAnimation() {
    if (!this.isAnimating && !this.currentAnimation) return;

    this.isAnimating = false;
    document.dispatchEvent(new CustomEvent('animation:stateChanged', { detail: { isPlaying: this.isAnimating } }));
    this.setRotatorPlayState('paused');

    if (this.currentAnimation) this.currentAnimation.pause();
    if (this.currentAccentAnimation) this.currentAccentAnimation.pause();
  }

  toggleAnimation() {
    if (!this.currentTrack) return;
    if (this.isAnimating) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  resetAnimation() {
    if (!this.currentTrack) return;

    this.stopAnimation();
    
    if (this.currentAnimation) this.currentAnimation.seek(0);
    if (this.currentAccentAnimation) this.currentAccentAnimation.seek(0);

    this.startAnimation();
  }

  setRotatorPlayState(state) {
    const rotator = document.querySelector('.svg-rotator');
    if (rotator) {
      rotator.style.animationPlayState = state;
    }
  }
}

export default RacingTrackVisualizer;