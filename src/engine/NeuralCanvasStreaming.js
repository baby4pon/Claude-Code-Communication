export class NeuralCanvasStreaming {
  constructor(canvas) {
    this.mainCanvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.worker = null;
    this.isReady = false;
    this.renderQueue = [];
    this.frameCounter = 0;
    this.performanceMetrics = {
      renderTime: 0,
      fps: 0,
      lastFrameTime: 0
    };
    
    this.setupOffscreenCanvas();
    this.setupWorker();
  }

  setupOffscreenCanvas() {
    try {
      if (typeof OffscreenCanvas !== 'undefined') {
        this.offscreenCanvas = new OffscreenCanvas(
          this.mainCanvas.width,
          this.mainCanvas.height
        );
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      } else {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.mainCanvas.width;
        this.offscreenCanvas.height = this.mainCanvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      }
      
      this.isReady = true;
    } catch (error) {
      console.warn('OffscreenCanvas not available, falling back to main canvas:', error);
      this.offscreenCanvas = this.mainCanvas;
      this.offscreenCtx = this.ctx;
      this.isReady = true;
    }
  }

  setupWorker() {
    try {
      if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
        this.worker = new Worker('/workers/neuralRenderWorker.js');
        this.setupWorkerCommunication();
      } else {
        console.warn('Web Workers or OffscreenCanvas not available, using main thread rendering');
      }
    } catch (error) {
      console.warn('Worker setup failed, falling back to main thread:', error);
    }
  }

  setupWorkerCommunication() {
    if (!this.worker) return;

    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'renderComplete':
          this.handleRenderComplete(data);
          break;
        case 'error':
          console.error('Worker error:', data);
          this.fallbackToMainThread();
          break;
        case 'performance':
          this.updatePerformanceMetrics(data);
          break;
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.fallbackToMainThread();
    };

    try {
      if (this.offscreenCanvas.transferControlToOffscreen) {
        const transferredCanvas = this.offscreenCanvas.transferControlToOffscreen();
        this.worker.postMessage({
          type: 'init',
          canvas: transferredCanvas,
          width: this.mainCanvas.width,
          height: this.mainCanvas.height
        }, [transferredCanvas]);
      }
    } catch (error) {
      console.warn('Canvas transfer failed:', error);
      this.fallbackToMainThread();
    }
  }

  fallbackToMainThread() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = true;
  }

  handleRenderComplete(data) {
    if (data.imageData) {
      this.ctx.putImageData(data.imageData, 0, 0);
    }
    
    this.frameCounter++;
    this.updatePerformanceMetrics(data);
  }

  updatePerformanceMetrics(data) {
    const now = performance.now();
    this.performanceMetrics.renderTime = data.renderTime || 0;
    
    if (this.performanceMetrics.lastFrameTime) {
      const deltaTime = now - this.performanceMetrics.lastFrameTime;
      this.performanceMetrics.fps = 1000 / deltaTime;
    }
    
    this.performanceMetrics.lastFrameTime = now;
  }

  calculateQualityLevel(viewport) {
    const { fps } = this.performanceMetrics;
    const memoryPressure = this.estimateMemoryPressure();
    
    if (fps < 30 || memoryPressure > 0.8) {
      return 'low';
    } else if (fps < 50 || memoryPressure > 0.6) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  estimateMemoryPressure() {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0.5;
  }

  cullParticles(particles, viewport) {
    const margin = 50;
    const visibleParticles = [];
    
    for (const particle of particles) {
      if (particle.x >= -margin && 
          particle.x <= viewport.width + margin &&
          particle.y >= -margin && 
          particle.y <= viewport.height + margin &&
          particle.alpha > 0.01) {
        visibleParticles.push(particle);
      }
    }
    
    return visibleParticles;
  }

  renderFrame(particles, viewport) {
    if (!this.isReady) return;

    const startTime = performance.now();
    const quality = this.calculateQualityLevel(viewport);
    const culledParticles = this.cullParticles(particles, viewport);
    
    if (this.worker) {
      this.worker.postMessage({
        type: 'render',
        particles: culledParticles.map(p => ({
          x: p.x,
          y: p.y,
          size: p.size,
          color: p.color,
          alpha: p.alpha
        })),
        viewport: viewport,
        quality: quality,
        timestamp: startTime
      });
    } else {
      this.renderMainThread(culledParticles, viewport, quality);
    }
  }

  renderMainThread(particles, viewport, quality) {
    const ctx = this.offscreenCtx || this.ctx;
    const startTime = performance.now();
    
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    
    ctx.save();
    
    const particleStep = quality === 'low' ? 3 : quality === 'medium' ? 2 : 1;
    
    for (let i = 0; i < particles.length; i += particleStep) {
      const particle = particles[i];
      
      if (particle.alpha <= 0.01) continue;
      
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      if (quality === 'high') {
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
      }
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    
    if (this.offscreenCanvas && this.offscreenCanvas !== this.mainCanvas) {
      this.ctx.clearRect(0, 0, viewport.width, viewport.height);
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
    
    const renderTime = performance.now() - startTime;
    this.updatePerformanceMetrics({ renderTime });
  }

  resize(width, height) {
    this.mainCanvas.width = width;
    this.mainCanvas.height = height;
    
    if (this.offscreenCanvas && this.offscreenCanvas !== this.mainCanvas) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    
    if (this.worker) {
      this.worker.postMessage({
        type: 'resize',
        width: width,
        height: height
      });
    }
  }

  getPerformanceMetrics() {
    return { ...this.performanceMetrics, frameCounter: this.frameCounter };
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isReady = false;
    this.renderQueue = [];
  }
}

export default NeuralCanvasStreaming;