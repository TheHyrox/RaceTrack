import { animate, svg } from 'animejs';
import { trackData } from '../data/tracks-data';

export class RacingTrackVisualizer {
  constructor() {
    this.currentAnimation = null;
    this.currentAccentAnimation = null;
    this.isPlaying = true;
    this.currentSpeed = 1;
    this.currentTrack = null;
    this.tracks = trackData;
    this.init();
  }

  getAvailableCategories() {
    return Object.keys(this.tracks).filter(category => 
      Object.keys(this.tracks[category]).length > 0
    );
  }

  getTracksForCategory(category) {
    return this.tracks[category] || {};
  }

  getTrackData(category, trackId) {
    const categoryData = this.getTracksForCategory(category);
    return categoryData[trackId] || null;
  }

  init() {
    this.setupEventListeners();
    this.updateCategoryButtons();
    this.updateTrackOptions('f1');
    this.updateRotationSpeed(1);
  }

  updateCategoryButtons() {
    const availableCategories = this.getAvailableCategories();
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
      const category = btn.dataset.category;
      if (!availableCategories.includes(category)) {
        btn.disabled = true;
        btn.classList.add('disabled');
      } else {
        btn.disabled = false;
        btn.classList.remove('disabled');
      }
    });
  }

  setupEventListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.disabled) return;
        
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
    const tracks = this.getTracksForCategory(category);
    
    select.innerHTML = '<option value="">Select a track...</option>';
    
    if (Object.keys(tracks).length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No tracks available for this category';
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    Object.entries(tracks).forEach(([trackId, track]) => {
      const option = document.createElement('option');
      option.value = `${category}-${trackId}`;
      option.textContent = track.name;
      select.appendChild(option);
    });
  }

  loadTrack(category, trackId) {
    this.stopAnimation();
    
    const track = this.getTrackData(category, trackId);
    if (!track) {
      console.error(`Track not found: ${category}-${trackId}`);
      return;
    }

    this.currentTrack = { category, trackId, ...track };
    this.updateTrackInfo(track);
    this.renderTrack(track, category);
    this.startAnimation();
  }

  updateTrackInfo(track) {
    document.getElementById('track-name').textContent = track.name;
    
    // Update additional track info if elements exist
    const locationElement = document.getElementById('track-location');
    const lengthElement = document.getElementById('track-length');
    
    if (locationElement && track.location) {
      locationElement.textContent = track.location;
    }
    if (lengthElement && track.length) {
      lengthElement.textContent = track.length;
    }
  }

  renderTrack(track, category) {
    const svgElement = document.getElementById('track-svg');
    svgElement.setAttribute('viewBox', track.viewBox);

    const carColors = this.getCarColors();
    const trackGroup = document.getElementById('track-group');
    
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
      f1: '#e10600',
      f2: '#0090d0',
      f3: '#ff8c00',
      fe: '#00e6cc',
      motogp: '#ff9900',
      wec: '#00ffc8',
      default: '#00ffc8'
    };
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