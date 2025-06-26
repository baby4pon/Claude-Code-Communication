class MultiLayerComposer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.layers = new Map();
        this.blendModes = [
            'source-over', 'multiply', 'screen', 'overlay', 
            'soft-light', 'hard-light', 'color-dodge', 'color-burn',
            'darken', 'lighten', 'difference', 'exclusion'
        ];
        this.currentBlendIndex = 0;
        
        this.initializeLayers();
        this.setupAnimationLoop();
    }

    initializeLayers() {
        const layerNames = ['background', 'trails', 'particles', 'effects', 'overlay'];
        
        layerNames.forEach((name, index) => {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = this.canvas.width;
            layerCanvas.height = this.canvas.height;
            
            this.layers.set(name, {
                canvas: layerCanvas,
                ctx: layerCanvas.getContext('2d'),
                opacity: 1.0,
                blendMode: this.blendModes[index % this.blendModes.length],
                visible: true,
                zIndex: index,
                effects: {
                    blur: 0,
                    brightness: 1,
                    contrast: 1,
                    saturation: 1,
                    hueRotate: 0
                }
            });
        });
    }

    getLayer(name) {
        return this.layers.get(name);
    }

    setLayerProperty(layerName, property, value) {
        const layer = this.layers.get(layerName);
        if (layer) {
            if (property === 'effects') {
                Object.assign(layer.effects, value);
            } else {
                layer[property] = value;
            }
        }
    }

    clearLayer(layerName) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }

    clearAllLayers() {
        this.layers.forEach((layer, name) => {
            this.clearLayer(name);
        });
    }

    drawToLayer(layerName, drawFunction) {
        const layer = this.layers.get(layerName);
        if (layer && drawFunction) {
            layer.ctx.save();
            drawFunction(layer.ctx, layer.canvas);
            layer.ctx.restore();
        }
    }

    applyLayerEffects(layer) {
        const { blur, brightness, contrast, saturation, hueRotate } = layer.effects;
        
        if (blur > 0 || brightness !== 1 || contrast !== 1 || saturation !== 1 || hueRotate !== 0) {
            const filters = [];
            
            if (blur > 0) filters.push(`blur(${blur}px)`);
            if (brightness !== 1) filters.push(`brightness(${brightness})`);
            if (contrast !== 1) filters.push(`contrast(${contrast})`);
            if (saturation !== 1) filters.push(`saturate(${saturation})`);
            if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
            
            layer.ctx.filter = filters.join(' ');
        } else {
            layer.ctx.filter = 'none';
        }
    }

    createFluidBackground() {
        this.drawToLayer('background', (ctx, canvas) => {
            const time = Date.now() * 0.001;
            const gradient = ctx.createRadialGradient(
                canvas.width * 0.5 + Math.sin(time) * 100,
                canvas.height * 0.5 + Math.cos(time * 0.7) * 80,
                0,
                canvas.width * 0.5,
                canvas.height * 0.5,
                Math.max(canvas.width, canvas.height) * 0.8
            );
            
            const hue1 = (time * 10) % 360;
            const hue2 = (time * 15 + 120) % 360;
            const hue3 = (time * 8 + 240) % 360;
            
            gradient.addColorStop(0, `hsla(${hue1}, 70%, 30%, 0.1)`);
            gradient.addColorStop(0.4, `hsla(${hue2}, 80%, 25%, 0.05)`);
            gradient.addColorStop(1, `hsla(${hue3}, 60%, 20%, 0.02)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }

    addTrailEffect(x, y, size, color, intensity = 1) {
        this.drawToLayer('trails', (ctx, canvas) => {
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.1 * intensity;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color.replace('1)', '0.3)'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
            
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        });
    }

    addRippleEffect(x, y, intensity) {
        const rippleLayer = this.getLayer('effects');
        if (!rippleLayer) return;
        
        const startTime = Date.now();
        const maxRadius = 100 * intensity;
        const duration = 2000;
        
        const animateRipple = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) return;
            
            this.drawToLayer('effects', (ctx, canvas) => {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                
                const currentRadius = progress * maxRadius;
                const alpha = (1 - progress) * 0.3;
                
                ctx.strokeStyle = `hsla(${(Date.now() * 0.1) % 360}, 70%, 60%, ${alpha})`;
                ctx.lineWidth = 2 + intensity;
                ctx.beginPath();
                ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            });
            
            requestAnimationFrame(animateRipple);
        };
        
        animateRipple();
    }

    cycleBlendModes() {
        this.currentBlendIndex = (this.currentBlendIndex + 1) % this.blendModes.length;
        const newBlendMode = this.blendModes[this.currentBlendIndex];
        
        this.layers.forEach((layer, name) => {
            if (name !== 'background') {
                layer.blendMode = newBlendMode;
            }
        });
        
        return newBlendMode;
    }

    compose() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const sortedLayers = Array.from(this.layers.entries())
            .sort(([, a], [, b]) => a.zIndex - b.zIndex);
        
        for (const [name, layer] of sortedLayers) {
            if (!layer.visible || layer.opacity <= 0) continue;
            
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity;
            this.ctx.globalCompositeOperation = layer.blendMode;
            
            this.applyLayerEffects(layer);
            
            this.ctx.drawImage(layer.canvas, 0, 0);
            this.ctx.restore();
        }
    }

    setupAnimationLoop() {
        let lastTime = 0;
        
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            this.createFluidBackground();
            
            const trailLayer = this.getLayer('trails');
            if (trailLayer) {
                trailLayer.ctx.globalAlpha = 0.95;
                trailLayer.ctx.globalCompositeOperation = 'destination-out';
                trailLayer.ctx.fillStyle = 'black';
                trailLayer.ctx.fillRect(0, 0, trailLayer.canvas.width, trailLayer.canvas.height);
                trailLayer.ctx.globalAlpha = 1;
                trailLayer.ctx.globalCompositeOperation = 'source-over';
            }
            
            this.compose();
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    exportLayer(layerName) {
        const layer = this.layers.get(layerName);
        if (layer) {
            return layer.canvas.toDataURL();
        }
        return null;
    }

    exportComposition() {
        return this.canvas.toDataURL();
    }

    getLayerInfo() {
        const info = {};
        this.layers.forEach((layer, name) => {
            info[name] = {
                opacity: layer.opacity,
                blendMode: layer.blendMode,
                visible: layer.visible,
                zIndex: layer.zIndex,
                effects: { ...layer.effects }
            };
        });
        return info;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.layers.forEach((layer) => {
            layer.canvas.width = width;
            layer.canvas.height = height;
        });
    }
}

export default MultiLayerComposer;