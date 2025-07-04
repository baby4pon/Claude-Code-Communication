export class ElasticMemoryVirtualization {
  constructor() {
    this.memoryState = {
      usedMemory: 0,
      availableMemory: 0,
      totalMemory: 0,
      optimizationLevel: 'normal'
    };
    
    this.thresholds = {
      aggressive: 0.8,
      moderate: 0.6,
      normal: 0.4
    };
    
    this.performanceObserver = null;
    this.memoryCheckInterval = null;
    this.adaptiveConfig = {
      particleCount: 10000,
      quality: 'high',
      optimizationLevel: 'normal',
      updateInterval: 16.67
    };
    
    this.callbacks = {
      onMemoryPressure: null,
      onConfigChange: null
    };
    
    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.startMemoryMonitoring();
    this.updateMemoryState();
  }

  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not available');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'memory-measurement') {
            this.handleMemoryMeasurement(entry);
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('Failed to setup PerformanceObserver:', error);
    }
  }

  startMemoryMonitoring() {
    this.memoryCheckInterval = setInterval(() => {
      this.updateMemoryState();
      this.adaptConfiguration();
    }, 1000);
  }

  updateMemoryState() {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      this.memoryState = {
        usedMemory: memory.usedJSHeapSize,
        availableMemory: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
        totalMemory: memory.jsHeapSizeLimit,
        optimizationLevel: this.calculateOptimizationLevel(memory)
      };
    } else {
      this.memoryState = {
        usedMemory: this.estimateMemoryUsage(),
        availableMemory: 100 * 1024 * 1024,
        totalMemory: 200 * 1024 * 1024,
        optimizationLevel: 'normal'
      };
    }
  }

  estimateMemoryUsage() {
    return Math.floor(Math.random() * 50 * 1024 * 1024);
  }

  calculateOptimizationLevel(memory) {
    const memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (memoryUsageRatio > this.thresholds.aggressive) {
      return 'aggressive';
    } else if (memoryUsageRatio > this.thresholds.moderate) {
      return 'moderate';
    } else {
      return 'normal';
    }
  }

  adaptConfiguration() {
    const previousConfig = { ...this.adaptiveConfig };
    const memoryUsageRatio = this.memoryState.usedMemory / this.memoryState.totalMemory;
    
    switch (this.memoryState.optimizationLevel) {
      case 'aggressive':
        this.adaptiveConfig = {
          particleCount: 1000,
          quality: 'low',
          optimizationLevel: 'aggressive',
          updateInterval: 33.33
        };
        break;
        
      case 'moderate':
        this.adaptiveConfig = {
          particleCount: 5000,
          quality: 'medium',
          optimizationLevel: 'moderate',
          updateInterval: 20
        };
        break;
        
      case 'normal':
      default:
        this.adaptiveConfig = {
          particleCount: 10000,
          quality: 'high',
          optimizationLevel: 'normal',
          updateInterval: 16.67
        };
        break;
    }
    
    if (this.hasConfigChanged(previousConfig, this.adaptiveConfig)) {
      this.notifyConfigChange(this.adaptiveConfig);
    }
    
    if (memoryUsageRatio > this.thresholds.moderate) {
      this.notifyMemoryPressure({
        level: this.memoryState.optimizationLevel,
        usageRatio: memoryUsageRatio,
        recommendations: this.getOptimizationRecommendations()
      });
    }
  }

  hasConfigChanged(previous, current) {
    return (
      previous.particleCount !== current.particleCount ||
      previous.quality !== current.quality ||
      previous.optimizationLevel !== current.optimizationLevel ||
      previous.updateInterval !== current.updateInterval
    );
  }

  getOptimizationRecommendations() {
    const recommendations = [];
    
    switch (this.memoryState.optimizationLevel) {
      case 'aggressive':
        recommendations.push('Reduce particle count to minimum');
        recommendations.push('Disable complex visual effects');
        recommendations.push('Increase update interval');
        recommendations.push('Enable garbage collection hints');
        break;
        
      case 'moderate':
        recommendations.push('Reduce particle count by 50%');
        recommendations.push('Lower visual quality');
        recommendations.push('Optimize update frequency');
        break;
        
      case 'normal':
        recommendations.push('Monitor memory usage');
        recommendations.push('Maintain current settings');
        break;
    }
    
    return recommendations;
  }

  handleMemoryMeasurement(entry) {
    const memoryData = {
      timestamp: entry.startTime,
      duration: entry.duration,
      detail: entry.detail
    };
    
    this.updateMemoryState();
  }

  measure(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Measurement function is required');
    }
    
    const startTime = performance.now();
    const startMemory = this.memoryState.usedMemory;
    
    performance.mark(`${name}-start`);
    
    try {
      const result = fn();
      
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const endTime = performance.now();
      const endMemory = this.memoryState.usedMemory;
      
      const measurement = {
        name,
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        startMemory,
        endMemory,
        timestamp: startTime
      };
      
      this.logMeasurement(measurement);
      
      return result;
    } catch (error) {
      console.error(`Error during measurement ${name}:`, error);
      throw error;
    } finally {
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
    }
  }

  logMeasurement(measurement) {
    if (measurement.memoryDelta > 1024 * 1024) {
      console.warn(`High memory usage detected in ${measurement.name}: ${Math.round(measurement.memoryDelta / 1024 / 1024)}MB`);
    }
    
    if (measurement.duration > 16.67) {
      console.warn(`Performance issue detected in ${measurement.name}: ${Math.round(measurement.duration)}ms`);
    }
  }

  onMemoryPressure(callback) {
    this.callbacks.onMemoryPressure = callback;
  }

  onConfigChange(callback) {
    this.callbacks.onConfigChange = callback;
  }

  notifyMemoryPressure(data) {
    if (this.callbacks.onMemoryPressure) {
      this.callbacks.onMemoryPressure(data);
    }
  }

  notifyConfigChange(config) {
    if (this.callbacks.onConfigChange) {
      this.callbacks.onConfigChange(config);
    }
  }

  forceGarbageCollection() {
    if (window.gc) {
      window.gc();
    } else {
      const dummy = new Array(1000000).fill(0);
      dummy.length = 0;
    }
  }

  getMemoryState() {
    return { ...this.memoryState };
  }

  getAdaptiveConfig() {
    return { ...this.adaptiveConfig };
  }

  getMemoryStats() {
    return {
      ...this.memoryState,
      usageRatio: this.memoryState.usedMemory / this.memoryState.totalMemory,
      availableRatio: this.memoryState.availableMemory / this.memoryState.totalMemory,
      recommendations: this.getOptimizationRecommendations()
    };
  }

  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    this.callbacks = {
      onMemoryPressure: null,
      onConfigChange: null
    };
  }
}

export default ElasticMemoryVirtualization;