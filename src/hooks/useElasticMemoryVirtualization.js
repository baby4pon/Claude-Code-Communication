import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ElasticMemoryVirtualization } from '../engine/ElasticMemoryVirtualization';

export function useElasticMemoryVirtualization(initialConfig = {}) {
  const memoryManagerRef = useRef(null);
  const [memoryState, setMemoryState] = useState({
    usedMemory: 0,
    availableMemory: 0,
    totalMemory: 0,
    optimizationLevel: 'normal',
    usageRatio: 0,
    availableRatio: 1
  });
  const [adaptiveConfig, setAdaptiveConfig] = useState({
    particleCount: 10000,
    quality: 'high',
    optimizationLevel: 'normal',
    updateInterval: 16.67
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultConfig = useMemo(() => ({
    enableAutoOptimization: true,
    aggressiveThreshold: 0.8,
    moderateThreshold: 0.6,
    normalThreshold: 0.4,
    ...initialConfig
  }), [initialConfig]);

  const initializeMemoryManager = useCallback(() => {
    if (!memoryManagerRef.current) {
      memoryManagerRef.current = new ElasticMemoryVirtualization();
      
      memoryManagerRef.current.onMemoryPressure((data) => {
        setMemoryState(prev => ({
          ...prev,
          optimizationLevel: data.level,
          usageRatio: data.usageRatio
        }));
        
        if (defaultConfig.enableAutoOptimization) {
          console.warn('Memory pressure detected:', data);
        }
      });
      
      memoryManagerRef.current.onConfigChange((newConfig) => {
        setAdaptiveConfig(newConfig);
      });
      
      setIsInitialized(true);
    }
  }, [defaultConfig.enableAutoOptimization]);

  const updateMemoryState = useCallback(() => {
    if (!memoryManagerRef.current) return;
    
    const stats = memoryManagerRef.current.getMemoryStats();
    setMemoryState(stats);
    
    const config = memoryManagerRef.current.getAdaptiveConfig();
    setAdaptiveConfig(config);
  }, []);

  const measurePerformance = useCallback((name, fn) => {
    if (!memoryManagerRef.current) {
      return fn();
    }
    
    return memoryManagerRef.current.measure(name, fn);
  }, []);

  const forceGarbageCollection = useCallback(() => {
    if (!memoryManagerRef.current) return;
    
    memoryManagerRef.current.forceGarbageCollection();
    setTimeout(() => {
      updateMemoryState();
    }, 100);
  }, [updateMemoryState]);

  const getOptimizationRecommendations = useCallback(() => {
    if (!memoryManagerRef.current) return [];
    
    const stats = memoryManagerRef.current.getMemoryStats();
    return stats.recommendations || [];
  }, []);

  const adjustConfigForMemoryPressure = useCallback((currentConfig) => {
    if (!memoryManagerRef.current) return currentConfig;
    
    const memoryStats = memoryManagerRef.current.getMemoryStats();
    const adaptiveSettings = memoryManagerRef.current.getAdaptiveConfig();
    
    return {
      ...currentConfig,
      ...adaptiveSettings,
      memoryOptimized: memoryStats.optimizationLevel !== 'normal'
    };
  }, []);

  const getMemoryPressureLevel = useCallback(() => {
    if (!memoryManagerRef.current) return 'normal';
    
    const stats = memoryManagerRef.current.getMemoryStats();
    return stats.optimizationLevel;
  }, []);

  const isMemoryPressureHigh = useCallback(() => {
    return getMemoryPressureLevel() === 'aggressive';
  }, [getMemoryPressureLevel]);

  const isMemoryPressureModerate = useCallback(() => {
    return getMemoryPressureLevel() === 'moderate';
  }, [getMemoryPressureLevel]);

  const getMemoryUsagePercentage = useCallback(() => {
    return Math.round(memoryState.usageRatio * 100);
  }, [memoryState.usageRatio]);

  const getFormattedMemoryUsage = useCallback(() => {
    const usedMB = Math.round(memoryState.usedMemory / (1024 * 1024));
    const totalMB = Math.round(memoryState.totalMemory / (1024 * 1024));
    return `${usedMB}MB / ${totalMB}MB`;
  }, [memoryState.usedMemory, memoryState.totalMemory]);

  const getCurrentOptimizationLevel = useCallback(() => {
    return memoryState.optimizationLevel;
  }, [memoryState.optimizationLevel]);

  const shouldReduceQuality = useCallback(() => {
    return memoryState.optimizationLevel !== 'normal';
  }, [memoryState.optimizationLevel]);

  const getOptimalParticleCount = useCallback((baseCount = 10000) => {
    switch (memoryState.optimizationLevel) {
      case 'aggressive':
        return Math.floor(baseCount * 0.1);
      case 'moderate':
        return Math.floor(baseCount * 0.5);
      case 'normal':
      default:
        return baseCount;
    }
  }, [memoryState.optimizationLevel]);

  const getOptimalUpdateInterval = useCallback(() => {
    switch (memoryState.optimizationLevel) {
      case 'aggressive':
        return 33.33;
      case 'moderate':
        return 20;
      case 'normal':
      default:
        return 16.67;
    }
  }, [memoryState.optimizationLevel]);

  const getOptimalQuality = useCallback(() => {
    switch (memoryState.optimizationLevel) {
      case 'aggressive':
        return 'low';
      case 'moderate':
        return 'medium';
      case 'normal':
      default:
        return 'high';
    }
  }, [memoryState.optimizationLevel]);

  useEffect(() => {
    initializeMemoryManager();
    
    return () => {
      if (memoryManagerRef.current) {
        memoryManagerRef.current.destroy();
        memoryManagerRef.current = null;
      }
    };
  }, [initializeMemoryManager]);

  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        updateMemoryState();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, updateMemoryState]);

  const memoryManager = memoryManagerRef.current;

  return {
    memoryState,
    adaptiveConfig,
    isInitialized,
    measurePerformance,
    forceGarbageCollection,
    getOptimizationRecommendations,
    adjustConfigForMemoryPressure,
    getMemoryPressureLevel,
    isMemoryPressureHigh,
    isMemoryPressureModerate,
    getMemoryUsagePercentage,
    getFormattedMemoryUsage,
    getCurrentOptimizationLevel,
    shouldReduceQuality,
    getOptimalParticleCount,
    getOptimalUpdateInterval,
    getOptimalQuality,
    memoryManager
  };
}

export default useElasticMemoryVirtualization;