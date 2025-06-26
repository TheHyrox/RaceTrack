import { trackData } from '../data/tracks-data.js';

export class Selection {
    constructor() {
        this.init();
    }

    init() {
        setTimeout(() => {
            this.setupCardAnimations();
        }, 100);
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
                        <svg class="track" viewBox="${track.viewBox}" xmlns="http://www.w3.org/2000/svg" onclick="window.location.href='/tracks?category=${category}&track=${trackId}'">
                            <path d="${track.path}" fill="none" stroke="var(--text-color)" stroke-width="5"/>
                        </svg>
                        <h3 onclick="window.location.href='/tracks?category=${category}&track=${trackId}'" >${track.name}</h3>
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

    setupCardAnimations() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            });
        });
    }
}