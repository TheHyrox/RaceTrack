import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as topojson from 'topojson-client';
import { trackData } from '../data/tracks-data.js';

export class WorldMap {
    constructor() {
        this.container = document.getElementById('world-container');
        if (!this.container) return;

        this.animate = this.animate.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.destroy = this.destroy.bind(this);

        this.enabledCountries = null;
        this.init();
    }

    async init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 2.5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 4;
        this.controls.rotateSpeed = 0.5;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.4;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(Infinity, Infinity);
        this.hoveredCountry = null;

        try {
            const worldData = await d3.json('/data/countries-110m.json');
            this.countries = topojson.feature(worldData, worldData.objects.countries);
            this.createGlobe();
            
            this.setEnabledCountries(['France', 'Australia', 'Belgium', 'Bahrain', 'Canada', 'Spain', 'United States of America', 'United Kingdom', 'Italy', 'Japan', 'Monaco', 'Saudi Arabia']);

            this.animate();
            this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
            this.renderer.domElement.addEventListener('click', this.onClick);
            window.addEventListener('resize', this.onWindowResize);
        } catch (error) {
            console.error("Failed to load world data:", error);
            this.container.innerHTML = '<p style="color: white; text-align: center;">Failed to load map data.</p>';
        }
    }

    setEnabledCountries(countryNames = []) {
        this.enabledCountries = new Set(countryNames);
        this.drawMap();
    }

    createGlobe() {
        const canvas = d3.create('canvas').attr('width', 4096).attr('height', 2048).node();
        this.context = canvas.getContext('2d');

        this.projection = d3.geoEquirectangular().fitSize([4096, 2048], { type: 'Sphere' });
        this.pathGenerator = d3.geoPath(this.projection, this.context);

        this.drawMap();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        this.globeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        this.globe = new THREE.Mesh(globeGeometry, this.globeMaterial);
        this.scene.add(this.globe);
    }

    drawMap(hovered = null) {
        if (!this.context) return;
        this.context.fillStyle = '#252423';
        this.context.fillRect(0, 0, 4096, 2048);
        this.context.strokeStyle = '#ffffff';
        this.context.lineWidth = 1.5;

        this.countries.features.forEach(d => {
            this.context.beginPath();
            this.pathGenerator(d);

            const isHovered = hovered && d.id === hovered.id;
            const isEnabled = this.enabledCountries && this.enabledCountries.has(d.properties.name);

            if (isHovered) {
                this.context.fillStyle = '#22d4ba';
            } else if (isEnabled) {
                this.context.fillStyle = '#e6c07b';
            } else {
                this.context.fillStyle = '#111111';
            }
            
            this.context.fill();
            this.context.stroke();
        });

        if (this.globeMaterial && this.globeMaterial.map) {
            this.globeMaterial.map.needsUpdate = true;
        }
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    checkForIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.globe);

        let newHoveredCountry = null;

        if (intersects.length > 0) {
            const { uv } = intersects[0];
            const lonLat = this.projection.invert([uv.x * 4096, (1 - uv.y) * 2048]);
            
            if (lonLat) {
                const foundCountry = this.countries.features.find(f => d3.geoContains(f, lonLat));
                
                if (foundCountry && this.enabledCountries?.has(foundCountry.properties.name)) {
                    newHoveredCountry = foundCountry;
                }
            }
        }

        if (this.hoveredCountry?.id !== newHoveredCountry?.id) {
            this.hoveredCountry = newHoveredCountry;
            this.drawMap(this.hoveredCountry);
            this.container.style.cursor = this.hoveredCountry ? 'pointer' : 'grab';
        }
    }

    onClick() {
        if (this.hoveredCountry) {
            this.trackList(this.hoveredCountry.properties.name);
        }
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.controls.update();
        this.checkForIntersection();
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.removeEventListener('click', this.onClick);
        window.removeEventListener('resize', this.onWindowResize);
        this.renderer.dispose();
        this.globeMaterial?.map?.dispose();
        this.globeMaterial?.dispose();
        this.globe?.geometry.dispose();
        if (this.container) this.container.innerHTML = '';
    }

    trackList(countryName) {
        const trackListContainer = document.querySelector('.tracks-list');
        if (!trackListContainer) return;
        const countryNameToCode = {
            'France': 'FR',
            'Australia': 'AU',
            'Belgium': 'BE',
            'Bahrain': 'BH',
            'Canada': 'CA',
            'Spain': 'ES',
            'United States of America': 'US',
            'United Kingdom': 'GB',
            'Italy': 'IT',
            'Japan': 'JP',
            'Monaco': 'MC',
            'Saudi Arabia': 'SA'
        };

        const tracks = [];
        for (const category in trackData) {
            if (Object.prototype.hasOwnProperty.call(trackData, category)) {
                const categoryTracks = trackData[category];
                for (const trackId in categoryTracks) {
                    if (Object.prototype.hasOwnProperty.call(categoryTracks, trackId)) {
                        const track = categoryTracks[trackId];
                        if (track.countryCode === countryNameToCode[countryName]) {
                            tracks.push({ id: trackId, name: track.name });
                        }
                    }
                }
            }
        }
        if (tracks.length > 0) {
            trackListContainer.innerHTML = `<h2>Tracks in ${countryName}</h2>`;
            const trackList = document.createElement('ul');
            tracks.forEach(track => {
                const listItem = document.createElement('li');
                listItem.textContent = track.name;
                // listItem.addEventListener('click', () => {
                //     window.location.href = `?track=${track.id}`;
                // });
                trackList.appendChild(listItem);
            });
            trackListContainer.appendChild(trackList);
        }
    }
}

export default WorldMap;