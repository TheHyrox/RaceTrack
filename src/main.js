import { RacingTrackVisualizer } from './components/RacingTrackVisualizer.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.css';
import './styles/variables.css';


const currentPage = window.location.pathname;
if (currentPage.includes('tracks')) {
  import('./styles/tracks.css');
  import('./styles/components/controls.css');
} else if (currentPage.includes('index') || currentPage === '/') {
  import('./styles/index.css');
}

document.addEventListener('DOMContentLoaded', () => {
  new RacingTrackVisualizer();
});