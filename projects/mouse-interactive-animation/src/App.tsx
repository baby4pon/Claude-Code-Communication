import React, { useEffect, useRef, useState } from 'react';
import { QuantumCanvas } from './components/QuantumCanvas';
import { MouseTracker } from './components/MouseTracker';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { useQuantumMouse } from './hooks/useQuantumMouse';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import './App.css';

interface Vector2D {
  x: number;
  y: number;
}

interface QuantumState {
  probability: number;
  phase: number;
  resonance: number;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isQuantumMode, setIsQuantumMode] = useState(true);
  const [showPerformance, setShowPerformance] = useState(false);
  
  // Custom Hooks
  const { 
    mousePosition, 
    quantumStates, 
    resonanceLevel,
    updateQuantumState 
  } = useQuantumMouse();
  
  const { 
    fps, 
    memoryUsage, 
    renderTime 
  } = usePerformanceMonitor();

  // App State
  const [appState, setAppState] = useState({
    mode: 'quantum' as 'quantum' | 'temporal' | 'emotion' | 'distortion',
    intensity: 0.8,
    showTrail: true,
    particleCount: 1000
  });

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mode switching handler
  const handleModeChange = (mode: typeof appState.mode) => {
    setAppState(prev => ({ ...prev, mode }));
  };

  return (
    <div className="app">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="mode-selector">
          <button 
            className={appState.mode === 'quantum' ? 'active' : ''}
            onClick={() => handleModeChange('quantum')}
          >
            🌌 Quantum
          </button>
          <button 
            className={appState.mode === 'temporal' ? 'active' : ''}
            onClick={() => handleModeChange('temporal')}
          >
            ⏰ Temporal
          </button>
          <button 
            className={appState.mode === 'emotion' ? 'active' : ''}
            onClick={() => handleModeChange('emotion')}
          >
            💭 Emotion
          </button>
          <button 
            className={appState.mode === 'distortion' ? 'active' : ''}
            onClick={() => handleModeChange('distortion')}
          >
            🌀 Distortion
          </button>
        </div>

        <div className="intensity-control">
          <label>Intensity: {appState.intensity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={appState.intensity}
            onChange={(e) => setAppState(prev => ({ 
              ...prev, 
              intensity: parseFloat(e.target.value) 
            }))}
          />
        </div>

        <div className="toggles">
          <label>
            <input
              type="checkbox"
              checked={appState.showTrail}
              onChange={(e) => setAppState(prev => ({ 
                ...prev, 
                showTrail: e.target.checked 
              }))}
            />
            Show Trail
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={showPerformance}
              onChange={(e) => setShowPerformance(e.target.checked)}
            />
            Performance Monitor
          </label>
        </div>
      </div>

      {/* Main Canvas */}
      <QuantumCanvas
        ref={canvasRef}
        mode={appState.mode}
        intensity={appState.intensity}
        showTrail={appState.showTrail}
        particleCount={appState.particleCount}
        mousePosition={mousePosition}
        quantumStates={quantumStates}
        resonanceLevel={resonanceLevel}
      />

      {/* Mouse Tracker */}
      <MouseTracker onMouseUpdate={updateQuantumState} />

      {/* Performance Monitor */}
      {showPerformance && (
        <PerformanceMonitor
          fps={fps}
          memoryUsage={memoryUsage}
          renderTime={renderTime}
          resonanceLevel={resonanceLevel}
        />
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <h3>Mouse Interactive Animation</h3>
        <p>Mode: <strong>{appState.mode.toUpperCase()}</strong></p>
        <p>Position: ({mousePosition.x.toFixed(0)}, {mousePosition.y.toFixed(0)})</p>
        <p>Resonance: {resonanceLevel.toFixed(3)}</p>
        <p>Quantum States: {quantumStates.length}</p>
      </div>
    </div>
  );
};

export default App;