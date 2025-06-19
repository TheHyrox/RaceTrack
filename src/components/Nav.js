export class Nav {
    constructor() {
        if (window.currentNav && typeof window.currentNav.destroy === 'function') {
            window.currentNav.destroy();
        }
        window.currentNav = this;

        this.idleTimer = null;
        this.navContainer = null;
        this.handleAnimationStateChange = this.handleAnimationStateChange.bind(this);
        this.render();
    }

    render() {
        this.navContainer = document.createElement('nav');
        this.navContainer.className = 'nav-container';
        const isTrackPage = window.location.pathname === '/tracks';

        let leftControlsHTML = '';
        if (isTrackPage) {
            leftControlsHTML = `
                <div class="nav-links track-controls-left">
                    <a href="#" id="nav-play-pause" title="Play/Pause">
                        <svg id="nav-pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        <svg id="nav-play-icon" viewBox="0 0 24 24" style="display:none;"><path d="M8 5v14l11-7z"/></svg>
                    </a>
                    <a href="#" id="nav-reset" title="Reset">
                        <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                    </a>
                    <a href="javascript:history.back()" title="Go Back">
                        <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                    </a>
                </div>`;
        } else {
            leftControlsHTML = `
                <div class="nav-links track-controls-left">
                    <a href="javascript:history.back()" title="Go Back">
                        <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                    </a>
                </div>
            `;
        }

        const triggerHTML = `
            <div class="nav-trigger">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="8"/><circle cx="50" cy="25" r="8"/><circle cx="75" cy="25" r="8"/>
                    <circle cx="25" cy="50" r="8"/><circle cx="50" cy="50" r="8"/><circle cx="75" cy="50" r="8"/>
                    <circle cx="25" cy="75" r="8"/><circle cx="50" cy="75" r="8"/><circle cx="75" cy="75" r="8"/>
                </svg>
            </div>`;

        const rightLinksHTML = `
            <div class="nav-links nav-links-right">
                <a href="/" data-route="/" title="Home page"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></a>
                <a href="/" data-route="/" title="World map"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></a>
                <a href="https://github.com/TheHyrox/RaceTrack" title="Source code" target="_blank"><svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg></a>
                <a href="/infos" data-route="/infos" title="Infos"><svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg></a>
            </div>`;

        this.navContainer.innerHTML = `<div class="pill-menu">${leftControlsHTML}${triggerHTML}${rightLinksHTML}</div>`;
        document.body.appendChild(this.navContainer);
        
        this.setupIdleOpacity();
        if (isTrackPage) {
            this.setupTrackControlListeners();
        }
    }

    setupTrackControlListeners() {
        document.addEventListener('animation:stateChanged', this.handleAnimationStateChange);

        const playPauseBtn = document.getElementById('nav-play-pause');
        playPauseBtn?.addEventListener('click', e => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('track:toggleAnimation'));
        });

        const resetBtn = document.getElementById('nav-reset');
        resetBtn?.addEventListener('click', e => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('track:resetAnimation'));
        });
    }

    handleAnimationStateChange(e) {
        const { isPlaying } = e.detail;
        const playIcon = document.getElementById('nav-play-icon');
        const pauseIcon = document.getElementById('nav-pause-icon');
        if (playIcon && pauseIcon) {
            playIcon.style.display = isPlaying ? 'none' : 'block';
            pauseIcon.style.display = isPlaying ? 'block' : 'none';
        }
    }

    setupIdleOpacity() {
        const startIdleTimer = () => {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => this.navContainer.classList.add('idle'), 5000);
        };
        const pillMenu = this.navContainer.querySelector('.pill-menu');
        pillMenu.addEventListener('mouseenter', () => {
            clearTimeout(this.idleTimer);
            this.navContainer.classList.remove('idle');
        });
        pillMenu.addEventListener('mouseleave', startIdleTimer);
        startIdleTimer();
    }

    destroy() {
        clearTimeout(this.idleTimer);
        this.navContainer?.remove();
        document.removeEventListener('animation:stateChanged', this.handleAnimationStateChange);
    }
}