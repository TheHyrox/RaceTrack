import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.css';
import './styles/variables.css';
import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  new Router();
});