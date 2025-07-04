export class PerformanceProfiler {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      fps: 60,
      memory: 100 * 1024 * 1024,
      renderTime: 16.67
    };
    this.history = {
      fps: [],
      memory: [],
      renderTime: [],
      particleCount: []
    };
    this.maxHistoryLength = 100;
  }

  startMeasure(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    });
  }

  endMeasure(name) {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const result = {
      name,
      duration: endTime - metric.startTime,
      memoryDelta: endMemory - metric.startMemory,
      fps: 1000 / (endTime - metric.startTime),
      startTime: metric.startTime,
      endTime: endTime
    };

    this.addToHistory(result);
    this.validatePerformance(result);
    this.metrics.delete(name);
    
    return result;
  }

  measure(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Measurement function is required');
    }

    this.startMeasure(name);
    
    try {
      const result = fn();
      const measurement = this.endMeasure(name);
      return { result, measurement };
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  async measureAsync(name, asyncFn) {
    if (typeof asyncFn !== 'function') {
      throw new Error('Async measurement function is required');
    }

    this.startMeasure(name);
    
    try {
      const result = await asyncFn();
      const measurement = this.endMeasure(name);
      return { result, measurement };
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  addToHistory(metric) {
    Object.keys(this.history).forEach(key => {
      if (metric[key] !== undefined) {
        this.history[key].push(metric[key]);
        if (this.history[key].length > this.maxHistoryLength) {
          this.history[key].shift();
        }
      }
    });
  }

  getMemoryUsage() {
    if (window.performance && window.performance.memory) {
      return window.performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  getTotalMemory() {
    if (window.performance && window.performance.memory) {
      return window.performance.memory.jsHeapSizeLimit;
    }
    return 100 * 1024 * 1024;
  }

  getMemoryUsagePercentage() {
    const used = this.getMemoryUsage();
    const total = this.getTotalMemory();
    return total > 0 ? (used / total) * 100 : 0;
  }

  validatePerformance(metric) {
    const warnings = [];
    
    if (metric.fps < this.thresholds.fps) {
      warnings.push(`FPS below threshold: ${metric.fps.toFixed(2)} < ${this.thresholds.fps}`);
    }
    
    if (metric.memoryDelta > this.thresholds.memory) {
      warnings.push(`Memory usage above threshold: ${this.formatBytes(metric.memoryDelta)}`);
    }
    
    if (metric.duration > this.thresholds.renderTime) {
      warnings.push(`Render time above threshold: ${metric.duration.toFixed(2)}ms > ${this.thresholds.renderTime}ms`);
    }

    if (warnings.length > 0) {
      console.warn(`Performance warnings for ${metric.name}:`, warnings);
      return { warnings, metric };
    }
    
    return null;
  }

  getPerformanceStats() {
    return {
      current: {
        memoryUsage: this.getMemoryUsage(),
        memoryPercentage: this.getMemoryUsagePercentage(),
        totalMemory: this.getTotalMemory()
      },
      history: { ...this.history },
      thresholds: { ...this.thresholds }
    };
  }

  getAverageMetric(metricName, sampleSize = 10) {
    const history = this.history[metricName];
    if (!history || history.length === 0) return 0;
    
    const samples = history.slice(-sampleSize);
    return samples.reduce((sum, value) => sum + value, 0) / samples.length;
  }

  getMetricTrend(metricName, sampleSize = 20) {
    const history = this.history[metricName];
    if (!history || history.length < 2) return 'stable';
    
    const samples = history.slice(-sampleSize);
    if (samples.length < 2) return 'stable';
    
    const firstHalf = samples.slice(0, Math.floor(samples.length / 2));
    const secondHalf = samples.slice(Math.floor(samples.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      performance: this.getPerformanceStats(),
      metrics: Array.from(this.metrics.entries()),
      browser: {
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory
      }
    };
  }

  reset() {
    this.metrics.clear();
    Object.keys(this.history).forEach(key => {
      this.history[key] = [];
    });
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

export const createPerformanceProfiler = () => new PerformanceProfiler();

export const measureFunction = (profiler, name, fn) => {
  return profiler.measure(name, fn);
};

export const measureAsyncFunction = (profiler, name, asyncFn) => {
  return profiler.measureAsync(name, asyncFn);
};

export default PerformanceProfiler;