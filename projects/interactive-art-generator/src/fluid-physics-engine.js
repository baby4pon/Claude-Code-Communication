class FluidPhysicsEngine {
    constructor(width, height, resolution = 64) {
        this.width = width;
        this.height = height;
        this.resolution = resolution;
        
        this.gridWidth = Math.floor(width / resolution);
        this.gridHeight = Math.floor(height / resolution);
        
        this.velocityX = new Float32Array(this.gridWidth * this.gridHeight);
        this.velocityY = new Float32Array(this.gridWidth * this.gridHeight);
        this.prevVelocityX = new Float32Array(this.gridWidth * this.gridHeight);
        this.prevVelocityY = new Float32Array(this.gridWidth * this.gridHeight);
        
        this.density = new Float32Array(this.gridWidth * this.gridHeight);
        this.prevDensity = new Float32Array(this.gridWidth * this.gridHeight);
        
        this.viscosity = 0.0001;
        this.diffusion = 0.0001;
        this.dt = 0.016;
        
        this.colorField = new Float32Array(this.gridWidth * this.gridHeight * 3);
        this.temperature = new Float32Array(this.gridWidth * this.gridHeight);
        
        this.initializeFields();
    }

    initializeFields() {
        for (let i = 0; i < this.gridWidth * this.gridHeight; i++) {
            this.velocityX[i] = 0;
            this.velocityY[i] = 0;
            this.density[i] = 0;
            this.temperature[i] = 0.5;
            
            this.colorField[i * 3] = 0;     // R
            this.colorField[i * 3 + 1] = 0; // G
            this.colorField[i * 3 + 2] = 0; // B
        }
    }

    getIndex(x, y) {
        x = Math.max(0, Math.min(this.gridWidth - 1, x));
        y = Math.max(0, Math.min(this.gridHeight - 1, y));
        return y * this.gridWidth + x;
    }

    addForce(x, y, forceX, forceY, densityAmount, hue, saturation, lightness) {
        const gridX = Math.floor(x / this.resolution);
        const gridY = Math.floor(y / this.resolution);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            const index = this.getIndex(gridX, gridY);
            
            this.velocityX[index] += forceX * this.dt;
            this.velocityY[index] += forceY * this.dt;
            this.density[index] += densityAmount;
            
            this.temperature[index] = Math.min(1, this.temperature[index] + densityAmount * 0.1);
            
            const rgb = this.hslToRgb(hue / 360, saturation / 100, lightness / 100);
            this.colorField[index * 3] = Math.min(1, this.colorField[index * 3] + rgb[0] / 255 * densityAmount);
            this.colorField[index * 3 + 1] = Math.min(1, this.colorField[index * 3 + 1] + rgb[1] / 255 * densityAmount);
            this.colorField[index * 3 + 2] = Math.min(1, this.colorField[index * 3 + 2] + rgb[2] / 255 * densityAmount);
        }
    }

    diffuse(b, x, x0, diff, iterations = 4) {
        const a = this.dt * diff * (this.gridWidth - 2) * (this.gridHeight - 2);
        
        for (let iter = 0; iter < iterations; iter++) {
            for (let j = 1; j < this.gridHeight - 1; j++) {
                for (let i = 1; i < this.gridWidth - 1; i++) {
                    const index = this.getIndex(i, j);
                    x[index] = (x0[index] + a * (
                        x[this.getIndex(i + 1, j)] +
                        x[this.getIndex(i - 1, j)] +
                        x[this.getIndex(i, j + 1)] +
                        x[this.getIndex(i, j - 1)]
                    )) / (1 + 4 * a);
                }
            }
            this.setBoundary(b, x);
        }
    }

    advect(b, d, d0, velX, velY) {
        const dtx = this.dt * (this.gridWidth - 2);
        const dty = this.dt * (this.gridHeight - 2);
        
        for (let j = 1; j < this.gridHeight - 1; j++) {
            for (let i = 1; i < this.gridWidth - 1; i++) {
                const index = this.getIndex(i, j);
                
                let x = i - dtx * velX[index];
                let y = j - dty * velY[index];
                
                x = Math.max(0.5, Math.min(this.gridWidth - 1.5, x));
                y = Math.max(0.5, Math.min(this.gridHeight - 1.5, y));
                
                const i0 = Math.floor(x);
                const i1 = i0 + 1;
                const j0 = Math.floor(y);
                const j1 = j0 + 1;
                
                const s1 = x - i0;
                const s0 = 1 - s1;
                const t1 = y - j0;
                const t0 = 1 - t1;
                
                d[index] = s0 * (t0 * d0[this.getIndex(i0, j0)] + t1 * d0[this.getIndex(i0, j1)]) +
                          s1 * (t0 * d0[this.getIndex(i1, j0)] + t1 * d0[this.getIndex(i1, j1)]);
            }
        }
        
        this.setBoundary(b, d);
    }

    project(velX, velY, p, div, iterations = 4) {
        for (let j = 1; j < this.gridHeight - 1; j++) {
            for (let i = 1; i < this.gridWidth - 1; i++) {
                const index = this.getIndex(i, j);
                div[index] = -0.5 * (
                    velX[this.getIndex(i + 1, j)] - velX[this.getIndex(i - 1, j)] +
                    velY[this.getIndex(i, j + 1)] - velY[this.getIndex(i, j - 1)]
                ) / this.gridWidth;
                p[index] = 0;
            }
        }
        
        this.setBoundary(0, div);
        this.setBoundary(0, p);
        
        for (let iter = 0; iter < iterations; iter++) {
            for (let j = 1; j < this.gridHeight - 1; j++) {
                for (let i = 1; i < this.gridWidth - 1; i++) {
                    const index = this.getIndex(i, j);
                    p[index] = (div[index] + 
                        p[this.getIndex(i + 1, j)] + p[this.getIndex(i - 1, j)] +
                        p[this.getIndex(i, j + 1)] + p[this.getIndex(i, j - 1)]
                    ) / 4;
                }
            }
            this.setBoundary(0, p);
        }
        
        for (let j = 1; j < this.gridHeight - 1; j++) {
            for (let i = 1; i < this.gridWidth - 1; i++) {
                const index = this.getIndex(i, j);
                velX[index] -= 0.5 * this.gridWidth * (p[this.getIndex(i + 1, j)] - p[this.getIndex(i - 1, j)]);
                velY[index] -= 0.5 * this.gridHeight * (p[this.getIndex(i, j + 1)] - p[this.getIndex(i, j - 1)]);
            }
        }
        
        this.setBoundary(1, velX);
        this.setBoundary(2, velY);
    }

    setBoundary(b, x) {
        for (let i = 1; i < this.gridWidth - 1; i++) {
            x[this.getIndex(i, 0)] = b === 2 ? -x[this.getIndex(i, 1)] : x[this.getIndex(i, 1)];
            x[this.getIndex(i, this.gridHeight - 1)] = b === 2 ? -x[this.getIndex(i, this.gridHeight - 2)] : x[this.getIndex(i, this.gridHeight - 2)];
        }
        
        for (let j = 1; j < this.gridHeight - 1; j++) {
            x[this.getIndex(0, j)] = b === 1 ? -x[this.getIndex(1, j)] : x[this.getIndex(1, j)];
            x[this.getIndex(this.gridWidth - 1, j)] = b === 1 ? -x[this.getIndex(this.gridWidth - 2, j)] : x[this.getIndex(this.gridWidth - 2, j)];
        }
        
        x[this.getIndex(0, 0)] = 0.5 * (x[this.getIndex(1, 0)] + x[this.getIndex(0, 1)]);
        x[this.getIndex(0, this.gridHeight - 1)] = 0.5 * (x[this.getIndex(1, this.gridHeight - 1)] + x[this.getIndex(0, this.gridHeight - 2)]);
        x[this.getIndex(this.gridWidth - 1, 0)] = 0.5 * (x[this.getIndex(this.gridWidth - 2, 0)] + x[this.getIndex(this.gridWidth - 1, 1)]);
        x[this.getIndex(this.gridWidth - 1, this.gridHeight - 1)] = 0.5 * (x[this.getIndex(this.gridWidth - 2, this.gridHeight - 1)] + x[this.getIndex(this.gridWidth - 1, this.gridHeight - 2)]);
    }

    update() {
        this.diffuse(1, this.prevVelocityX, this.velocityX, this.viscosity);
        this.diffuse(2, this.prevVelocityY, this.velocityY, this.viscosity);
        
        this.project(this.prevVelocityX, this.prevVelocityY, this.velocityX, this.velocityY);
        
        this.advect(1, this.velocityX, this.prevVelocityX, this.prevVelocityX, this.prevVelocityY);
        this.advect(2, this.velocityY, this.prevVelocityY, this.prevVelocityX, this.prevVelocityY);
        
        this.project(this.velocityX, this.velocityY, this.prevVelocityX, this.prevVelocityY);
        
        this.diffuse(0, this.prevDensity, this.density, this.diffusion);
        this.advect(0, this.density, this.prevDensity, this.velocityX, this.velocityY);
        
        for (let i = 0; i < this.gridWidth * this.gridHeight; i++) {
            this.density[i] *= 0.999;
            this.temperature[i] *= 0.995;
            
            this.colorField[i * 3] *= 0.998;
            this.colorField[i * 3 + 1] *= 0.998;
            this.colorField[i * 3 + 2] *= 0.998;
        }
    }

    renderToCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const gridX = Math.floor(x / this.resolution);
                const gridY = Math.floor(y / this.resolution);
                const gridIndex = this.getIndex(gridX, gridY);
                
                const density = Math.min(1, this.density[gridIndex]);
                const temp = this.temperature[gridIndex];
                
                const r = this.colorField[gridIndex * 3] * 255 * density;
                const g = this.colorField[gridIndex * 3 + 1] * 255 * density;
                const b = this.colorField[gridIndex * 3 + 2] * 255 * density;
                
                const pixelIndex = (y * canvas.width + x) * 4;
                data[pixelIndex] = Math.min(255, r + temp * 50);
                data[pixelIndex + 1] = Math.min(255, g + temp * 30);
                data[pixelIndex + 2] = Math.min(255, b + temp * 80);
                data[pixelIndex + 3] = Math.min(255, density * 255);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    getVelocityAt(x, y) {
        const gridX = Math.floor(x / this.resolution);
        const gridY = Math.floor(y / this.resolution);
        const index = this.getIndex(gridX, gridY);
        
        return {
            x: this.velocityX[index],
            y: this.velocityY[index]
        };
    }

    getDensityAt(x, y) {
        const gridX = Math.floor(x / this.resolution);
        const gridY = Math.floor(y / this.resolution);
        const index = this.getIndex(gridX, gridY);
        
        return this.density[index];
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
        
        return [r, g, b];
    }

    clear() {
        this.initializeFields();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.gridWidth = Math.floor(width / this.resolution);
        this.gridHeight = Math.floor(height / this.resolution);
        
        const newSize = this.gridWidth * this.gridHeight;
        
        this.velocityX = new Float32Array(newSize);
        this.velocityY = new Float32Array(newSize);
        this.prevVelocityX = new Float32Array(newSize);
        this.prevVelocityY = new Float32Array(newSize);
        this.density = new Float32Array(newSize);
        this.prevDensity = new Float32Array(newSize);
        this.colorField = new Float32Array(newSize * 3);
        this.temperature = new Float32Array(newSize);
        
        this.initializeFields();
    }
}

export default FluidPhysicsEngine;