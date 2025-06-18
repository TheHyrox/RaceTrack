import { trackData } from '../data/tracks-data.js';

export class Selection {
    constructor() {
        this.init();
    }

    init() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        const cardsGrid = document.querySelector('.cards-grid');

        if (!cardsGrid) {
            return;
        }

        const tracks = category ? trackData[category] : null;

        if (tracks && Object.keys(tracks).length > 0) {
            cardsGrid.innerHTML = '';
            Object.keys(tracks).forEach(trackId => {
                const track = tracks[trackId];
                const cardHTML = `
                    <div class="card">
                        <img src="/Flags/${track.countryCode}.svg" alt="Flag" class="flag">
                        <svg class="track" viewBox="${track.viewBox}" xmlns="http://www.w3.org/2000/svg">
                            <path d="${track.path}" fill="none" stroke="var(--text-color)" stroke-width="5"/>
                        </svg>
                        <h3>${track.name}</h3>
                        <p>${track.location}</p>
                        <p>Length: ${track.length}</p>
                        <p>Turns: ${track.turns}</p>
                        <a href="/tracks?category=${category}&track=${trackId}" data-route="/tracks?category=${category}&track=${trackId}" class="link">-> See track</a>
                    </div>
                `;
                cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
            });
        } else {
            cardsGrid.innerHTML = '<p>Please select a valid category or no tracks available.</p>';
        }
    }
}