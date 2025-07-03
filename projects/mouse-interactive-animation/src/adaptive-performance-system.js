/**
 * Adaptive Performance Scaling System
 * デバイス性能をリアルタイム監視し、最適なアニメーション品質を動的調整
 */

class AdaptivePerformanceSystem {
  constructor() {
    this.performanceMetrics = {
      fps: 60,
      frameTime: 16.67,
      cpuUsage: 0,
      memoryUsage: 0,
      gpuMemory: 0
    };
    
    this.qualityLevels = [
      { name: 'Ultra', particles: 300, effects: 5, quality: 1.0 },
      { name: 'High', particles: 200, effects: 4, quality: 0.8 },
      { name: 'Medium', particles: 120, effects: 3, quality: 0.6 },
      { name: 'Low', particles: 60, effects: 2, quality: 0.4 },
      { name: 'Potato', particles: 30, effects: 1, quality: 0.2 }
    ];
    
    this.currentQualityIndex = 1; // デフォルトはHigh
    this.observer = null;
    this.performanceHistory = [];
    this.adaptationThreshold = 45; // 45FPS以下で品質調整
    this.targetFPS = 60;
    
    this.callbacks = {
      onQualityChange: null,
      onPerformanceUpdate: null
    };
    
    this.initialize();
  }

  initialize() {
    // Performance Observer でフレーム性能監視
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }
    
    // Memory API対応確認
    if ('memory' in performance) {
      this.supportsMemoryAPI = true;
    }
    
    // GPU情報取得（WebGL）
    this.getGPUInfo();
    
    // 初期デバイス能力検出
    this.detectDeviceCapabilities();
    
    // 定期的な性能チェック開始
    this.startPerformanceMonitoring();
  }

  setupPerformanceObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.updateFrameMetrics(entry);
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  updateFrameMetrics(entry) {
    const frameTime = entry.duration;
    const fps = 1000 / frameTime;
    
    this.performanceMetrics.frameTime = frameTime;
    this.performanceMetrics.fps = fps;
    
    // 履歴に追加（最新20フレーム）
    this.performanceHistory.push(fps);
    if (this.performanceHistory.length > 20) {
      this.performanceHistory.shift();
    }
    
    // 品質調整の判定
    this.evaluatePerformance();
  }

  evaluatePerformance() {
    if (this.performanceHistory.length < 10) return;
    
    const avgFPS = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    const minFPS = Math.min(...this.performanceHistory);
    
    // FPSが低下している場合は品質を下げる
    if (avgFPS < this.adaptationThreshold || minFPS < 30) {
      this.adjustQuality(false);
    }
    // FPSが十分高い場合は品質を上げる
    else if (avgFPS > this.targetFPS - 5 && minFPS > 50) {
      this.adjustQuality(true);
    }
  }

  adjustQuality(increase) {
    const oldIndex = this.currentQualityIndex;
    
    if (increase && this.currentQualityIndex > 0) {
      this.currentQualityIndex--;
    } else if (!increase && this.currentQualityIndex < this.qualityLevels.length - 1) {
      this.currentQualityIndex++;
    }
    
    if (oldIndex !== this.currentQualityIndex) {
      const quality = this.getCurrentQuality();
      console.log(`Quality adjusted to: ${quality.name}`);
      
      if (this.callbacks.onQualityChange) {
        this.callbacks.onQualityChange(quality, this.performanceMetrics);
      }
      
      // 品質変更後は履歴をリセット
      this.performanceHistory = [];
    }
  }

  getCurrentQuality() {
    return this.qualityLevels[this.currentQualityIndex];
  }

  // GPU情報取得
  getGPUInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        this.gpuInfo = {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
      }
      
      // GPU メモリ使用量（概算）
      this.estimateGPUMemory();
    }
  }

  estimateGPUMemory() {
    // WebGLの制限値から推定
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (gl) {
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
      
      // 大まかな性能指標
      this.gpuScore = (maxTextureSize / 1024) * (maxViewport[0] * maxViewport[1] / 1000000);
    }
  }

  // デバイス能力の初期検出
  detectDeviceCapabilities() {
    const deviceScore = this.calculateDeviceScore();
    
    // デバイススコアに基づいて初期品質設定
    if (deviceScore > 80) {
      this.currentQualityIndex = 0; // Ultra
    } else if (deviceScore > 60) {
      this.currentQualityIndex = 1; // High
    } else if (deviceScore > 40) {
      this.currentQualityIndex = 2; // Medium
    } else if (deviceScore > 20) {
      this.currentQualityIndex = 3; // Low
    } else {
      this.currentQualityIndex = 4; // Potato
    }
  }

  calculateDeviceScore() {
    let score = 50; // ベーススコア
    
    // CPU コア数
    if (navigator.hardwareConcurrency) {
      score += navigator.hardwareConcurrency * 5;
    }
    
    // メモリ情報
    if (navigator.deviceMemory) {
      score += navigator.deviceMemory * 10;
    }
    
    // GPU性能（推定）
    if (this.gpuScore) {
      score += Math.min(this.gpuScore / 100, 30);
    }
    
    // ネットワーク速度（間接的な性能指標）
    if (navigator.connection && navigator.connection.downlink) {
      score += Math.min(navigator.connection.downlink / 10, 10);
    }
    
    return Math.min(100, Math.max(0, score));
  }

  // 継続的な性能監視
  startPerformanceMonitoring() {
    setInterval(() => {
      this.updateSystemMetrics();
      
      if (this.callbacks.onPerformanceUpdate) {
        this.callbacks.onPerformanceUpdate(this.performanceMetrics);
      }
    }, 1000); // 1秒ごと
  }

  updateSystemMetrics() {
    // メモリ使用量
    if (this.supportsMemoryAPI) {
      const memory = performance.memory;
      this.performanceMetrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    
    // バッテリー情報（対応している場合）
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.performanceMetrics.battery = {
          level: battery.level,
          charging: battery.charging
        };
        
        // バッテリー残量が少ない場合は品質を下げる
        if (battery.level < 0.2 && !battery.charging) {
          this.adjustQuality(false);
        }
      });
    }
  }

  // フレーム測定開始
  startFrameMeasure(label = 'frame') {
    performance.mark(`${label}-start`);
  }

  // フレーム測定終了
  endFrameMeasure(label = 'frame') {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
  }

  // 品質変更コールバック設定
  onQualityChange(callback) {
    this.callbacks.onQualityChange = callback;
  }

  // 性能更新コールバック設定
  onPerformanceUpdate(callback) {
    this.callbacks.onPerformanceUpdate = callback;
  }

  // 手動で品質設定
  setQuality(qualityName) {
    const index = this.qualityLevels.findIndex(q => q.name === qualityName);
    if (index !== -1) {
      this.currentQualityIndex = index;
      if (this.callbacks.onQualityChange) {
        this.callbacks.onQualityChange(this.getCurrentQuality(), this.performanceMetrics);
      }
    }
  }

  // 現在の性能情報取得
  getPerformanceInfo() {
    return {
      metrics: { ...this.performanceMetrics },
      quality: this.getCurrentQuality(),
      deviceScore: this.calculateDeviceScore(),
      gpuInfo: this.gpuInfo
    };
  }

  // リソース使用量の最適化提案
  getOptimizationSuggestions() {
    const suggestions = [];
    const quality = this.getCurrentQuality();
    
    if (this.performanceMetrics.fps < 45) {
      suggestions.push('Frame rate is low. Consider reducing particle count or effects.');
    }
    
    if (this.performanceMetrics.memoryUsage && 
        this.performanceMetrics.memoryUsage.percentage > 80) {
      suggestions.push('Memory usage is high. Consider garbage collection optimization.');
    }
    
    if (quality.name === 'Potato') {
      suggestions.push('Running on lowest quality. Device may not be suitable for complex animations.');
    }
    
    return suggestions;
  }

  // 破棄
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// React Hook として使用するためのアダプター
export const useAdaptivePerformance = () => {
  const [performanceSystem] = useState(() => new AdaptivePerformanceSystem());
  const [quality, setQuality] = useState(performanceSystem.getCurrentQuality());
  const [metrics, setMetrics] = useState(performanceSystem.performanceMetrics);

  useEffect(() => {
    performanceSystem.onQualityChange((newQuality, newMetrics) => {
      setQuality(newQuality);
      setMetrics(newMetrics);
    });

    performanceSystem.onPerformanceUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => performanceSystem.destroy();
  }, [performanceSystem]);

  return {
    quality,
    metrics,
    setQuality: (qualityName) => performanceSystem.setQuality(qualityName),
    getPerformanceInfo: () => performanceSystem.getPerformanceInfo(),
    startFrameMeasure: (label) => performanceSystem.startFrameMeasure(label),
    endFrameMeasure: (label) => performanceSystem.endFrameMeasure(label)
  };
};

export default AdaptivePerformanceSystem;