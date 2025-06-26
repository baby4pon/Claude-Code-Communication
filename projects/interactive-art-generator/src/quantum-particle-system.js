class QuantumParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 10000;
        this.quantumVariance = 15;
        this.lastTime = 0;
        
        this.initializeObjectPool();
    }

    initializeObjectPool() {
        this.particlePool = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 0,
                hue: 0, saturation: 0, lightness: 0,
                alpha: 0, size: 0,
                quantumOffset: { x: 0, y: 0 },
                probabilityWeight: 0,
                active: false
            });
        }
    }

    getParticleFromPool() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null;
    }

    returnParticleToPool(particle) {
        particle.active = false;
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }

    addQuantumBurst(x, y, mouseVelocity) {
        const intensity = Math.min(mouseVelocity * 0.1, 1);
        const particleCount = Math.floor(5 + intensity * 15);
        
        const baseHue = (Date.now() * 0.05) % 360;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticleFromPool();
            if (!particle) break;

            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 0.5 + Math.random() * 2;
            
            const quantumX = x + (Math.random() - 0.5) * this.quantumVariance;
            const quantumY = y + (Math.random() - 0.5) * this.quantumVariance;
            
            particle.x = quantumX;
            particle.y = quantumY;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 0;
            particle.maxLife = 60 + Math.random() * 120;
            particle.hue = (baseHue + Math.random() * 60 - 30 + 360) % 360;
            particle.saturation = 70 + Math.random() * 30;
            particle.lightness = 50 + Math.random() * 30;
            particle.alpha = 0.8 + Math.random() * 0.2;
            particle.size = 0.5 + Math.random() * 2;
            particle.probabilityWeight = Math.random();
            
            particle.quantumOffset.x = (Math.random() - 0.5) * 10;
            particle.quantumOffset.y = (Math.random() - 0.5) * 10;
            
            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        const dt = Math.min(deltaTime, 16);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.life += dt;
            if (particle.life >= particle.maxLife) {
                this.returnParticleToPool(particle);
                continue;
            }
            
            const lifeRatio = particle.life / particle.maxLife;
            const quantumPhase = Math.sin(lifeRatio * Math.PI * 4 + particle.probabilityWeight * Math.PI * 2);
            
            particle.x += particle.vx * dt * 0.1;
            particle.y += particle.vy * dt * 0.1;
            
            particle.x += particle.quantumOffset.x * quantumPhase * 0.01;
            particle.y += particle.quantumOffset.y * quantumPhase * 0.01;
            
            particle.vx *= 0.995;
            particle.vy *= 0.995;
            
            particle.alpha = (1 - lifeRatio) * (0.3 + quantumPhase * 0.2);
            particle.size = (1 - lifeRatio * 0.7) * (1 + Math.sin(lifeRatio * Math.PI * 8) * 0.3);
        }
    }

    render() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (const particle of this.particles) {
            if (!particle.active) continue;
            
            const x = Math.floor(particle.x);
            const y = Math.floor(particle.y);
            
            if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
                const radius = Math.max(1, Math.floor(particle.size));
                
                for (let dx = -radius; dx <= radius; dx++) {
                    for (let dy = -radius; dy <= radius; dy++) {
                        const px = x + dx;
                        const py = y + dy;
                        
                        if (px >= 0 && px < this.canvas.width && py >= 0 && py < this.canvas.height) {
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance <= radius) {
                                const index = (py * this.canvas.width + px) * 4;
                                const intensity = (1 - distance / radius) * particle.alpha;
                                
                                const rgb = this.hslToRgb(
                                    particle.hue / 360,
                                    particle.saturation / 100,
                                    particle.lightness / 100
                                );
                                
                                data[index] = Math.min(255, data[index] + rgb[0] * intensity);
                                data[index + 1] = Math.min(255, data[index + 1] + rgb[1] * intensity);
                                data[index + 2] = Math.min(255, data[index + 2] + rgb[2] * intensity);
                                data[index + 3] = Math.min(255, data[index + 3] + 255 * intensity);
                            }
                        }
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.ctx.restore();
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    getParticleCount() {
        return this.particles.length;
    }

    clear() {
        for (const particle of this.particles) {
            this.returnParticleToPool(particle);
        }
        this.particles.length = 0;
    }
}

export default QuantumParticleSystem;