import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuantumParticleEngine } from '../hooks/useQuantumParticleEngine';
import { useElasticMemoryVirtualization } from '../hooks/useElasticMemoryVirtualization';
import PerformanceMonitor from './PerformanceMonitor';
import CanvasRenderer from './CanvasRenderer';

const ParticleTextApp = () => {
  const [text, setText] = useState('MAGIC');
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
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
    getRenderStats
  } = useQuantumParticleEngine(text, {
    maxParticles: 10000,
    enableMemoryOptimization: true,
    enableWorkers: true
  });

  const {
    memoryState,
    adaptiveConfig,
    isInitialized,
    measurePerformance,
    forceGarbageCollection,
    getOptimizationRecommendations,
    getMemoryUsagePercentage,
    getFormattedMemoryUsage,
    shouldReduceQuality,
    getOptimalParticleCount,
    getOptimalQuality
  } = useElasticMemoryVirtualization({
    enableAutoOptimization: true
  });

  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 800,
    height: 600
  });

  const [showControls, setShowControls] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);

  const handleCanvasReady = useCallback((canvas) => {
    setCanvas(canvas);
  }, [setCanvas]);

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const newDimensions = {
        width: Math.max(400, clientWidth - 40),
        height: Math.max(300, clientHeight - 100)
      };
      setCanvasDimensions(newDimensions);
      resizeCanvas(newDimensions.width, newDimensions.height);
    }
  }, [resizeCanvas]);

  const handlePlayPause = useCallback(() => {
    if (isAnimating) {
      stopAnimation();
      setIsPlaying(false);
    } else {
      startAnimation();
      setIsPlaying(true);
    }
  }, [isAnimating, startAnimation, stopAnimation]);

  const handleRestart = useCallback(() => {
    measurePerformance('restart-animation', () => {
      restartAnimation();
    });
    setIsPlaying(true);
  }, [restartAnimation, measurePerformance]);

  const handleTextChange = useCallback((newText) => {
    setText(newText);
    if (newText.trim()) {
      measurePerformance('text-change', () => {
        explodeText(newText);
      });
      setIsPlaying(true);
    }
  }, [explodeText, measurePerformance]);

  const handleOptimize = useCallback(() => {
    forceGarbageCollection();
  }, [forceGarbageCollection]);

  const getQualitySettings = useCallback(() => {
    const baseQuality = getOptimalQuality();
    const particleCount = getOptimalParticleCount(5000);
    
    return {
      quality: baseQuality,
      particleCount: particleCount,
      reducedEffects: shouldReduceQuality()
    };
  }, [getOptimalQuality, getOptimalParticleCount, shouldReduceQuality]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (text && !isAnimating && currentState === 'idle') {
      handleTextChange(text);
    }
  }, [text, isAnimating, currentState, handleTextChange]);

  const qualitySettings = getQualitySettings();

  return (
    <div 
      ref={containerRef}
      className="particle-text-app"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        className="canvas-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CanvasRenderer
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          onCanvasReady={handleCanvasReady}
          quality={qualitySettings.quality}
          style={{
            border: '1px solid #333',
            borderRadius: '8px'
          }}
        />
      </div>

      {showControls && (
        <div 
          className="controls"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '250px'
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>
            Quantum Particle Engine
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Text:
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px'
              }}
              maxLength={20}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={handlePlayPause}
              style={{
                padding: '8px 16px',
                backgroundColor: isPlaying ? '#e74c3c' : '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={handleRestart}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Restart
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#ccc' }}>
            <div>State: {currentState}</div>
            <div>Particles: {particles.length}</div>
            <div>Quality: {qualitySettings.quality}</div>
            {qualitySettings.reducedEffects && (
              <div style={{ color: '#f39c12' }}>⚠ Reduced effects</div>
            )}
          </div>
        </div>
      )}

      {showPerformance && (
        <PerformanceMonitor
          performance={performance}
          memoryState={memoryState}
          adaptiveConfig={adaptiveConfig}
          engineStats={getEngineStats()}
          memoryStats={getMemoryStats()}
          renderStats={getRenderStats()}
          onOptimize={handleOptimize}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10
          }}
        />
      )}

      <div 
        className="toggle-buttons"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            padding: '8px 12px',
            backgroundColor: showControls ? '#27ae60' : '#7f8c8d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Controls
        </button>
        
        <button
          onClick={() => setShowPerformance(!showPerformance)}
          style={{
            padding: '8px 12px',
            backgroundColor: showPerformance ? '#27ae60' : '#7f8c8d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Performance
        </button>
      </div>

      {memoryState.optimizationLevel !== 'normal' && (
        <div 
          className="memory-warning"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(243, 156, 18, 0.9)',
            color: '#000',
            padding: '10px 15px',
            borderRadius: '6px',
            fontSize: '14px',
            maxWidth: '300px'
          }}
        >
          <strong>Memory Optimization Active</strong>
          <br />
          Level: {memoryState.optimizationLevel}
          <br />
          Usage: {getMemoryUsagePercentage()}%
        </div>
      )}
    </div>
  );
};

export default ParticleTextApp;