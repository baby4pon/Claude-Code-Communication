// Neural Network Platform JavaScript
class NeuralPlatform {
    constructor() {
        this.currentSection = 'home';
        this.neuralScene = null;
        this.neuralRenderer = null;
        this.neuralCamera = null;
        this.neuralNodes = [];
        this.neuralConnections = [];
        this.mousePos = { x: 0, y: 0 };
        this.isNavigatorActive = false;
        this.stats = {
            neuralActivity: 127.3,
            connections: 45892,
            processes: 10000,
            uptime: 99.9
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCustomCursor();
        this.setupNeuralLoader();
        this.setupNeuralNavigator();
        this.setupThreeJS();
        this.setupStatsAnimation();
        this.setupNeuralMonitor();
        this.setupSectionNavigation();
    }

    setupEventListeners() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            this.updateCustomCursor();
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Neural nodes
        document.querySelectorAll('.neural-node').forEach(node => {
            node.addEventListener('click', (e) => {
                const section = node.dataset.section;
                this.navigateToSection(section);
                this.hideNeuralNavigator();
            });
        });

        // CTA buttons
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.textContent.includes('Neural Network')) {
                    this.showNeuralNavigator();
                } else if (button.textContent.includes('Demo')) {
                    this.playDemo();
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideNeuralNavigator();
            } else if (e.key === 'n' || e.key === 'N') {
                this.toggleNeuralNavigator();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'neural-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(0,255,255,0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        document.body.appendChild(cursor);
        
        this.cursor = cursor;
    }

    updateCustomCursor() {
        if (this.cursor) {
            this.cursor.style.left = this.mousePos.x + 'px';
            this.cursor.style.top = this.mousePos.y + 'px';
        }
    }

    setupNeuralLoader() {
        const loader = document.getElementById('neural-loader');
        
        // Simulate loading process
        setTimeout(() => {
            loader.classList.add('hidden');
            this.startNeuralActivity();
        }, 3000);
    }

    setupNeuralNavigator() {
        const navigator = document.getElementById('neural-navigator');
        const connections = navigator.querySelector('.neural-connections');
        
        // Generate neural connections
        this.generateNeuralConnections();
        
        // Add pulsing animation to connections
        this.animateConnections();
    }

    generateNeuralConnections() {
        const svg = document.querySelector('.neural-connections');
        const nodes = document.querySelectorAll('.neural-node');
        
        // Clear existing connections
        svg.innerHTML = '';
        
        // Create connections between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                
                // Calculate positions
                const node1 = nodes[i].getBoundingClientRect();
                const node2 = nodes[j].getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();
                
                const x1 = node1.left + node1.width / 2 - svgRect.left;
                const y1 = node1.top + node1.height / 2 - svgRect.top;
                const x2 = node2.left + node2.width / 2 - svgRect.left;
                const y2 = node2.top + node2.height / 2 - svgRect.top;
                
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'rgba(0, 255, 255, 0.3)');
                line.setAttribute('stroke-width', '2');
                line.classList.add('neural-connection');
                
                svg.appendChild(line);
            }
        }
    }

    animateConnections() {
        const connections = document.querySelectorAll('.neural-connection');
        
        connections.forEach((connection, index) => {
            const animationDelay = index * 0.1;
            connection.style.animation = `connectionPulse 2s ease-in-out infinite`;
            connection.style.animationDelay = `${animationDelay}s`;
        });
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes connectionPulse {
                0%, 100% { opacity: 0.3; stroke-width: 2; }
                50% { opacity: 1; stroke-width: 4; }
            }
        `;
        document.head.appendChild(style);
    }

    showNeuralNavigator() {
        const navigator = document.getElementById('neural-navigator');
        navigator.classList.add('active');
        this.isNavigatorActive = true;
        
        // Add escape hint
        this.showHint('Press ESC to close Neural Navigator');
    }

    hideNeuralNavigator() {
        const navigator = document.getElementById('neural-navigator');
        navigator.classList.remove('active');
        this.isNavigatorActive = false;
    }

    toggleNeuralNavigator() {
        if (this.isNavigatorActive) {
            this.hideNeuralNavigator();
        } else {
            this.showNeuralNavigator();
        }
    }

    setupThreeJS() {
        const canvas = document.getElementById('neural-canvas');
        
        // Scene setup
        this.neuralScene = new THREE.Scene();
        this.neuralCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.neuralRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        this.neuralRenderer.setSize(window.innerWidth, window.innerHeight);
        this.neuralRenderer.setClearColor(0x000000, 0);
        
        // Create neural network particles
        this.createNeuralParticles();
        
        // Camera position
        this.neuralCamera.position.z = 5;
        
        // Start animation loop
        this.animate3D();
    }

    createNeuralParticles() {
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            // Color
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 1, 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Material
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        // Create points
        this.neuralParticles = new THREE.Points(particles, material);
        this.neuralScene.add(this.neuralParticles);
        
        // Create connections
        this.createParticleConnections();
    }

    createParticleConnections() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        const particlePositions = this.neuralParticles.geometry.attributes.position.array;
        const particleCount = particlePositions.length / 3;
        
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const i3 = i * 3;
                const j3 = j * 3;
                
                const dx = particlePositions[i3] - particlePositions[j3];
                const dy = particlePositions[i3 + 1] - particlePositions[j3 + 1];
                const dz = particlePositions[i3 + 2] - particlePositions[j3 + 2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance < 3) {
                    positions.push(particlePositions[i3], particlePositions[i3 + 1], particlePositions[i3 + 2]);
                    positions.push(particlePositions[j3], particlePositions[j3 + 1], particlePositions[j3 + 2]);
                    
                    const color = new THREE.Color(0x00ffff);
                    colors.push(color.r, color.g, color.b);
                    colors.push(color.r, color.g, color.b);
                }
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.3
        });
        
        this.neuralConnections = new THREE.LineSegments(geometry, material);
        this.neuralScene.add(this.neuralConnections);
    }

    animate3D() {
        requestAnimationFrame(() => this.animate3D());
        
        // Rotate neural network
        if (this.neuralParticles) {
            this.neuralParticles.rotation.y += 0.001;
            this.neuralParticles.rotation.x += 0.0005;
        }
        
        if (this.neuralConnections) {
            this.neuralConnections.rotation.y += 0.001;
            this.neuralConnections.rotation.x += 0.0005;
        }
        
        // Mouse interaction
        const mouseX = (this.mousePos.x / window.innerWidth) * 2 - 1;
        const mouseY = -(this.mousePos.y / window.innerHeight) * 2 + 1;
        
        this.neuralCamera.position.x = mouseX * 0.5;
        this.neuralCamera.position.y = mouseY * 0.5;
        this.neuralCamera.lookAt(0, 0, 0);
        
        this.neuralRenderer.render(this.neuralScene, this.neuralCamera);
    }

    setupStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.dataset.count);
            this.animateNumber(stat, 0, target, 2000);
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const range = end - start;
        
        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (range * this.easeOutQuart(progress));
            
            if (end > 100) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = current.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        updateNumber();
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    setupNeuralMonitor() {
        const updateMonitor = () => {
            // Update neural activity
            this.stats.neuralActivity = 120 + Math.random() * 15;
            this.stats.connections = 45000 + Math.floor(Math.random() * 2000);
            
            document.querySelectorAll('.monitor-value').forEach((value, index) => {
                switch (index) {
                    case 0:
                        value.textContent = this.stats.neuralActivity.toFixed(1) + ' Hz';
                        break;
                    case 1:
                        value.textContent = this.stats.connections.toLocaleString();
                        break;
                    case 2:
                        value.textContent = 'Real-time';
                        break;
                }
            });
        };
        
        setInterval(updateMonitor, 1000);
    }

    setupSectionNavigation() {
        // Update active navigation
        this.updateActiveNavigation();
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.neural-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            this.updateActiveNavigation();
        }
    }

    updateActiveNavigation() {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === this.currentSection) {
                link.classList.add('active');
            }
        });
    }

    playDemo() {
        this.showHint('Neural Network Demo initiated...');
        
        // Animate through sections
        const sections = ['home', 'about', 'technology', 'careers', 'contact'];
        let currentIndex = 0;
        
        const demoInterval = setInterval(() => {
            this.navigateToSection(sections[currentIndex]);
            currentIndex++;
            
            if (currentIndex >= sections.length) {
                clearInterval(demoInterval);
                this.showHint('Demo completed!');
                this.navigateToSection('home');
            }
        }, 2000);
    }

    showHint(message) {
        const hint = document.createElement('div');
        hint.className = 'neural-hint';
        hint.textContent = message;
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #00ffff;
            padding: 1rem 2rem;
            border-radius: 25px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            z-index: 10000;
            font-size: 1.1rem;
            backdrop-filter: blur(10px);
            animation: hintFade 3s ease-in-out forwards;
        `;
        
        document.body.appendChild(hint);
        
        // Add fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes hintFade {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            hint.remove();
            style.remove();
        }, 3000);
    }

    handleResize() {
        if (this.neuralRenderer && this.neuralCamera) {
            this.neuralCamera.aspect = window.innerWidth / window.innerHeight;
            this.neuralCamera.updateProjectionMatrix();
            this.neuralRenderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Regenerate neural connections
        this.generateNeuralConnections();
    }

    startNeuralActivity() {
        // Add dynamic effects when page loads
        document.body.classList.add('neural-active');
        
        // Start neural pulse effects
        this.addNeuralPulseEffects();
    }

    addNeuralPulseEffects() {
        const pulseElements = document.querySelectorAll('.neural-node .node-core');
        
        pulseElements.forEach((element, index) => {
            const delay = index * 200;
            
            setTimeout(() => {
                element.style.animation = 'nodeCore 2s ease-in-out infinite';
            }, delay);
        });
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeuralPlatform();
});

// Add some additional interactive effects
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('cta-button')) {
        e.target.style.transform = 'translateY(-3px) scale(1.05)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('cta-button')) {
        e.target.style.transform = 'translateY(0) scale(1)';
    }
});

// Add keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        const shortcuts = `
        Neural Platform Shortcuts:
        • N - Toggle Neural Navigator
        • ESC - Close Neural Navigator
        • H - Show this help
        `;
        
        console.log(shortcuts);
    }
});

// Performance monitoring
let lastTime = performance.now();
function monitorPerformance() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Update FPS in neural monitor if needed
    const fps = Math.round(1000 / deltaTime);
    if (fps < 30) {
        console.warn('Performance warning: FPS below 30');
    }
    
    requestAnimationFrame(monitorPerformance);
}

monitorPerformance();