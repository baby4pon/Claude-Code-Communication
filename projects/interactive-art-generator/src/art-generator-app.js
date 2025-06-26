import QuantumParticleSystem from './quantum-particle-system.js';
import MultiLayerComposer from './multi-layer-composer.js';
import FluidPhysicsEngine from './fluid-physics-engine.js';

class InteractiveArtGenerator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.isDrawing = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.mouseVelocity = 0;
        this.lastTime = 0;
        
        this.initializeCanvas();
        this.initializeSystems();
        this.setupEventListeners();
        this.startAnimationLoop();
        
        this.renderMode = 'quantum'; // quantum, fluid, hybrid
        this.intensity = 1.0;
        this.brushSize = 20;
    }

    initializeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.cursor = 'crosshair';
        this.canvas.style.background = 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)';
    }

    initializeSystems() {
        this.quantumSystem = new QuantumParticleSystem(this.canvas);
        this.layerComposer = new MultiLayerComposer(this.canvas);
        this.fluidEngine = new FluidPhysicsEngine(this.canvas.width, this.canvas.height, 8);
        
        console.log('All rendering systems initialized successfully');
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        window.addEventListener('resize', () => this.handleResize());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.mouseVelocity = 0;
        
        this.layerComposer.addRippleEffect(this.lastMousePos.x, this.lastMousePos.y, this.intensity);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const currentPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        if (this.isDrawing) {
            const deltaX = currentPos.x - this.lastMousePos.x;
            const deltaY = currentPos.y - this.lastMousePos.y;
            this.mouseVelocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            this.drawAt(currentPos.x, currentPos.y, deltaX, deltaY);
        }
        
        this.lastMousePos = currentPos;
    }

    handleMouseUp(e) {
        this.isDrawing = false;
        this.mouseVelocity = 0;
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case '1':
                this.renderMode = 'quantum';
                console.log('Switched to Quantum mode');
                break;
            case '2':
                this.renderMode = 'fluid';
                console.log('Switched to Fluid mode');
                break;
            case '3':
                this.renderMode = 'hybrid';
                console.log('Switched to Hybrid mode');
                break;
            case 'c':
                this.clearCanvas();
                break;
            case 'b':
                const newMode = this.layerComposer.cycleBlendModes();
                console.log('Blend mode:', newMode);
                break;
            case ' ':
                e.preventDefault();
                this.saveArtwork();
                break;
        }
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        
        if (e.ctrlKey) {
            this.brushSize = Math.max(5, Math.min(100, this.brushSize + delta * 10));
        } else {
            this.intensity = Math.max(0.1, Math.min(3.0, this.intensity + delta));
        }
        
        console.log(`Brush size: ${this.brushSize.toFixed(1)}, Intensity: ${this.intensity.toFixed(1)}`);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.layerComposer.resize(this.canvas.width, this.canvas.height);
        this.fluidEngine.resize(this.canvas.width, this.canvas.height);
    }

    drawAt(x, y, deltaX, deltaY) {
        const time = Date.now();
        const hue = (time * 0.05) % 360;
        const saturation = 70 + Math.sin(time * 0.001) * 20;
        const lightness = 50 + Math.cos(time * 0.0015) * 25;
        const color = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        
        switch(this.renderMode) {
            case 'quantum':
                this.quantumSystem.addQuantumBurst(x, y, this.mouseVelocity * this.intensity);
                this.layerComposer.addTrailEffect(x, y, this.brushSize, color, this.intensity);
                break;
                
            case 'fluid':
                const forceX = deltaX * this.intensity * 0.5;
                const forceY = deltaY * this.intensity * 0.5;
                this.fluidEngine.addForce(x, y, forceX, forceY, this.intensity * 0.3, hue, saturation, lightness);
                break;
                
            case 'hybrid':
                this.quantumSystem.addQuantumBurst(x, y, this.mouseVelocity * this.intensity * 0.7);
                const hybridForceX = deltaX * this.intensity * 0.3;
                const hybridForceY = deltaY * this.intensity * 0.3;
                this.fluidEngine.addForce(x, y, hybridForceX, hybridForceY, this.intensity * 0.2, hue, saturation, lightness);
                this.layerComposer.addTrailEffect(x, y, this.brushSize * 0.8, color, this.intensity * 0.6);
                break;
        }
    }

    startAnimationLoop() {
        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    update(deltaTime) {
        this.quantumSystem.update(deltaTime);
        this.fluidEngine.update();
        
        const particleCount = this.quantumSystem.getParticleCount();
        if (particleCount > 8000) {
            console.log(`High particle count: ${particleCount}. Consider optimizing.`);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.renderMode === 'fluid' || this.renderMode === 'hybrid') {
            const fluidLayer = this.layerComposer.getLayer('particles');
            if (fluidLayer) {
                fluidLayer.ctx.clearRect(0, 0, fluidLayer.canvas.width, fluidLayer.canvas.height);
                this.fluidEngine.renderToCanvas(fluidLayer.canvas);
            }
        }
        
        if (this.renderMode === 'quantum' || this.renderMode === 'hybrid') {
            const particleLayer = this.layerComposer.getLayer('effects');
            if (particleLayer) {
                particleLayer.ctx.clearRect(0, 0, particleLayer.canvas.width, particleLayer.canvas.height);
                particleLayer.ctx.save();
                this.quantumSystem.ctx = particleLayer.ctx;
                this.quantumSystem.canvas = particleLayer.canvas;
                this.quantumSystem.render();
                particleLayer.ctx.restore();
            }
        }
        
        this.layerComposer.compose();
    }

    clearCanvas() {
        this.quantumSystem.clear();
        this.fluidEngine.clear();
        this.layerComposer.clearAllLayers();
        console.log('Canvas cleared');
    }

    saveArtwork() {
        const dataURL = this.layerComposer.exportComposition();
        const link = document.createElement('a');
        link.download = `artwork-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        console.log('Artwork saved');
    }

    getPerformanceStats() {
        return {
            particleCount: this.quantumSystem.getParticleCount(),
            renderMode: this.renderMode,
            intensity: this.intensity,
            brushSize: this.brushSize,
            layerInfo: this.layerComposer.getLayerInfo()
        };
    }

    setRenderMode(mode) {
        if (['quantum', 'fluid', 'hybrid'].includes(mode)) {
            this.renderMode = mode;
            console.log(`Render mode set to: ${mode}`);
        }
    }

    setIntensity(intensity) {
        this.intensity = Math.max(0.1, Math.min(3.0, intensity));
    }

    setBrushSize(size) {
        this.brushSize = Math.max(5, Math.min(100, size));
    }
}

export default InteractiveArtGenerator;