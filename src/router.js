export class Router {
    constructor() {
        this.routes = {
            '/': {
                title: 'Home - Racing Track Visualizer',
                htmlFile: '/pages/home.html',
                component: () => import('./components/Home.js'),
                css: ['/styles/home.css']
            },
            '/tracks': {
                title: 'Tracks - Racing Track Visualizer',
                htmlFile: '/pages/tracks.html',
                component: () => import('./components/RacingTrackVisualizer.js'),
                css: ['/styles/tracks.css', '/styles/components/controls.css', 'styles/components/tracks.css']
            },
            '/selection': {
                title: 'Selection - Racing Track Visualizer',
                htmlFile: '/pages/selection.html',
                component: () => import('./components/Selection.js'),
                css: ['/styles/selection.css']
            }
        };
        
        this.currentComponent = null;
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-route]')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-route');
                this.navigate(path);
            }
        });

        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path];
        
        if (!route) {
            this.navigate('/');
            return;
        }

        try {
            document.title = route.title;
            this.loadRouteCss(route.css);
            
            if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
                this.currentComponent.destroy();
            }
            
            await this.loadHTML(route.htmlFile);
            
            if (route.component) {
                const module = await route.component();
                
                let ComponentClass = null;
                
                if (module.default) {
                    ComponentClass = module.default;
                } else if (module.Index) {
                    ComponentClass = module.Index;
                } else if (module.RacingTrackVisualizer) {
                    ComponentClass = module.RacingTrackVisualizer;
                } else {
                    const exports = Object.keys(module);
                    if (exports.length > 0) {
                        ComponentClass = module[exports[0]];
                    }
                }
                
                if (ComponentClass && typeof ComponentClass === 'function') {
                    this.currentComponent = new ComponentClass();
                } else {
                    console.error('No valid component constructor found in module:', module);
                }
            }
            
        } catch (error) {
            console.error('Route loading failed:', error);
            this.showError('Failed to load page');
        }
    }

    loadRouteCss(cssFiles) {
        document.querySelectorAll('link[data-route-style]').forEach(link => link.remove());

        if (cssFiles && cssFiles.length > 0) {
            cssFiles.forEach(cssFile => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile;
                link.setAttribute('data-route-style', 'true');
                document.head.appendChild(link);
            });
        }
    }

    async loadHTML(htmlFile) {
        try {
            const response = await fetch(htmlFile);
            if (!response.ok) {
                throw new Error(`Failed to load ${htmlFile}`);
            }
            
            const htmlContent = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const bodyContent = doc.body.innerHTML;
            
            document.body.innerHTML = bodyContent;
            
        } catch (error) {
            console.error('Error loading HTML:', error);
            throw error;
        }
    }

    navigate(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }
        this.handleRoute();
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="error-page">
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}