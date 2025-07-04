import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { QuantumParticlePool } from '../engine/QuantumParticlePool';
import { NeuralCanvasStreaming } from '../engine/NeuralCanvasStreaming';
import { ElasticMemoryVirtualization } from '../engine/ElasticMemoryVirtualization';

export function useQuantumParticleEngine(text, config = {}) {
  const engineRef = useRef(null);
  const rendererRef = useRef(null);
  const memoryManagerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [particles, setParticles] = useState([]);
  const [performance, setPerformance] = useState({ 
    fps: 0, 
    memory: 0, 
    renderTime: 0,
    particleCount: 0
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentState, setCurrentState] = useState('idle');

  const defaultConfig = useMemo(() => ({
    maxParticles: 10000,
    particleCount: 5000,
    animationSpeed: 1.0,
    quality: 'high',
    enableMemoryOptimization: true,
    enableWorkers: true,
    ...config
  }), [config]);

  const initializeEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new QuantumParticlePool(defaultConfig.maxParticles);
      
      if (canvasRef.current) {
        rendererRef.current = new NeuralCanvasStreaming(canvasRef.current);
      }
      
      if (defaultConfig.enableMemoryOptimization) {
        memoryManagerRef.current = new ElasticMemoryVirtualization();
        memoryManagerRef.current.onConfigChange((newConfig) => {
          updateEngineConfig(newConfig);
        });
      }
    }
  }, [defaultConfig.maxParticles, defaultConfig.enableMemoryOptimization]);

  const updateEngineConfig = useCallback((newConfig) => {
    if (engineRef.current) {
      const stats = engineRef.current.getStats();
      setPerformance(prev => ({
        ...prev,
        particleCount: stats.activeParticles,
        memory: stats.memoryUsage
      }));
    }
  }, []);

  const explodeText = useCallback((inputText = text) => {
    if (!engineRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    engineRef.current.clear();
    
    const explosionParticles = engineRef.current.explodeText(
      inputText,
      centerX,
      centerY,
      canvas.width,
      canvas.height
    );
    
    setParticles(explosionParticles);
    setCurrentState('exploding');
    setIsAnimating(true);
    
    setTimeout(() => {
      formText(inputText);
    }, 2000);
  }, [text]);

  const formText = useCallback((inputText = text) => {
    if (!engineRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const formingParticles = engineRef.current.formText(
      inputText,
      centerX,
      centerY,
      canvas.width,
      canvas.height
    );
    
    setParticles(formingParticles);
    setCurrentState('forming');
    
    setTimeout(() => {
      setCurrentState('stable');
    }, 3000);
  }, [text]);

  const animationLoop = useCallback(() => {
    if (!engineRef.current || !rendererRef.current || !canvasRef.current) return;
    
    const startTime = performance.now();
    const deltaTime = 1/60;
    
    if (memoryManagerRef.current) {
      memoryManagerRef.current.measure('particle-update', () => {
        engineRef.current.update(deltaTime);
      });
    } else {
      engineRef.current.update(deltaTime);
    }
    
    const activeParticles = engineRef.current.getActiveParticles();
    setParticles(activeParticles);
    
    const viewport = {
      width: canvasRef.current.width,
      height: canvasRef.current.height
    };
    
    if (memoryManagerRef.current) {
      memoryManagerRef.current.measure('render', () => {
        rendererRef.current.renderFrame(activeParticles, viewport);
      });
    } else {
      rendererRef.current.renderFrame(activeParticles, viewport);
    }
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const fps = 1000 / renderTime;
    
    setPerformance(prev => ({
      ...prev,
      fps: Math.round(fps),
      renderTime: Math.round(renderTime * 100) / 100,
      particleCount: activeParticles.length
    }));
    
    if (memoryManagerRef.current) {
      const memoryStats = memoryManagerRef.current.getMemoryStats();
      setPerformance(prev => ({
        ...prev,
        memory: Math.round(memoryStats.usageRatio * 100)
      }));
    }
    
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [isAnimating]);

  const startAnimation = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  }, [isAnimating]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const restartAnimation = useCallback(() => {
    stopAnimation();
    setTimeout(() => {
      explodeText();
    }, 100);
  }, [explodeText, stopAnimation]);

  const setCanvas = useCallback((canvas) => {
    canvasRef.current = canvas;
    if (canvas && !rendererRef.current) {
      rendererRef.current = new NeuralCanvasStreaming(canvas);
    }
  }, []);

  const resizeCanvas = useCallback((width, height) => {
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      if (rendererRef.current) {
        rendererRef.current.resize(width, height);
      }
    }
  }, []);

  useEffect(() => {
    initializeEngine();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
      
      if (memoryManagerRef.current) {
        memoryManagerRef.current.destroy();
      }
    };
  }, [initializeEngine]);

  useEffect(() => {
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, animationLoop]);

  useEffect(() => {
    if (text && currentState === 'idle') {
      explodeText();
    }
  }, [text, currentState, explodeText]);

  const getEngineStats = useCallback(() => {
    if (!engineRef.current) return null;
    return engineRef.current.getStats();
  }, []);

  const getMemoryStats = useCallback(() => {
    if (!memoryManagerRef.current) return null;
    return memoryManagerRef.current.getMemoryStats();
  }, []);

  const getRenderStats = useCallback(() => {
    if (!rendererRef.current) return null;
    return rendererRef.current.getPerformanceMetrics();
  }, []);

  return {
    particles,
    performance,
    isAnimating,
    currentState,
    explodeText,
    formText,
    startAnimation,
    stopAnimation,
    restartAnimation,
    setCanvas,
    resizeCanvas,
    getEngineStats,
    getMemoryStats,
    getRenderStats,
    engine: engineRef.current,
    renderer: rendererRef.current,
    memoryManager: memoryManagerRef.current
  };
}

export default useQuantumParticleEngine;