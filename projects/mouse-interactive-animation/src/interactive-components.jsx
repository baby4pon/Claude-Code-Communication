/**
 * Interactive Components - Reactベースのインタラクティブコンポーネント群
 * Worker3によるUI/UX特化の革新的コンポーネント実装
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './visual-effects-system.js';
import './temporal-echo-effect.js';

// メインのインタラクティブキャンバスコンポーネント
const InteractiveCanvas = () => {
  const canvasRef = useRef(null);
  const effectsManagerRef = useRef(null);
  const temporalEchoRef = useRef(null);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [effectIntensity, setEffectIntensity] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 視覚エフェクトマネージャーの初期化
    if (window.VisualEffectsSystem) {
      effectsManagerRef.current = new window.VisualEffectsSystem.VisualEffectsManager(canvas);
    }

    // テンポラルエコーエフェクトの初期化
    if (window.TemporalEchoEffect) {
      const ctx = canvas.getContext('2d');
      temporalEchoRef.current = new window.TemporalEchoEffect(canvas, ctx);
    }

    // クリーンアップ
    return () => {
      if (effectsManagerRef.current) {
        effectsManagerRef.current = null;
      }
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (temporalEchoRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      temporalEchoRef.current.addMousePosition(x, y, effectIntensity);
    }
  }, [effectIntensity]);

  const handleDoubleClick = useCallback((e) => {
    if (temporalEchoRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      temporalEchoRef.current.createTimeDistortion(x, y, 2.0);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div className="interactive-canvas-container">
      <canvas
        ref={canvasRef}
        className="interactive-canvas"
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        style={{
          cursor: 'none',
          background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a1a 100%)'
        }}
      />
      
      <ControlPanel
        currentEmotion={currentEmotion}
        effectIntensity={effectIntensity}
        onIntensityChange={setEffectIntensity}
        onFullscreenToggle={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
};

// コントロールパネルコンポーネント
const ControlPanel = ({ 
  currentEmotion, 
  effectIntensity, 
  onIntensityChange, 
  onFullscreenToggle,
  isFullscreen 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    const showPanel = () => {
      setIsVisible(true);
      clearTimeout(timer);
      setTimeout(() => setIsVisible(false), 3000);
    };

    window.addEventListener('mousemove', showPanel);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', showPanel);
    };
  }, []);

  return (
    <div 
      className={`control-panel ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        position: 'fixed',
        top: panelPosition.y,
        left: panelPosition.x,
        background: 'rgba(26, 26, 46, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        zIndex: 1000
      }}
    >
      <div className="emotion-indicator">
        <span className="label">Current Emotion:</span>
        <span className={`emotion-badge emotion-${currentEmotion}`}>
          {currentEmotion}
        </span>
      </div>

      <div className="intensity-control">
        <label htmlFor="intensity-slider">Effect Intensity</label>
        <input
          id="intensity-slider"
          type="range"
          min="0.1"
          max="3.0"
          step="0.1"
          value={effectIntensity}
          onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
          className="intensity-slider"
        />
        <span className="intensity-value">{effectIntensity.toFixed(1)}</span>
      </div>

      <div className="control-buttons">
        <button 
          onClick={onFullscreenToggle}
          className="control-button fullscreen-button"
        >
          {isFullscreen ? '🗗' : '🗖'}
        </button>
      </div>

      <div className="instructions">
        <p>• Move mouse to create neural networks</p>
        <p>• Click to generate quantum ripples</p>
        <p>• Double-click for time distortion</p>
      </div>
    </div>
  );
};

// 感情状態表示コンポーネント
const EmotionVisualization = ({ emotion, intensity }) => {
  const emotionColors = {
    calm: '#4FB3D9',
    excited: '#FF6B6B',
    contemplative: '#A8E6CF',
    playful: '#FFD93D',
    focused: '#B8860B',
    neutral: '#CCCCCC'
  };

  const color = emotionColors[emotion] || emotionColors.neutral;

  return (
    <div 
      className="emotion-visualization"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 500
      }}
    >
      <div
        className="emotion-aura"
        style={{
          width: `${100 + intensity * 50}px`,
          height: `${100 + intensity * 50}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          animation: `pulse 2s ease-in-out infinite`,
          opacity: intensity * 0.3
        }}
      />
    </div>
  );
};

// パフォーマンスモニターコンポーネント
const PerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const frameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    const updatePerformance = () => {
      frameCountRef.current++;
      const now = performance.now();
      
      if (now - frameTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        frameTimeRef.current = now;

        // メモリ使用量（対応ブラウザのみ）
        if (performance.memory) {
          const usage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
          setMemoryUsage(usage);
        }
      }
      
      requestAnimationFrame(updatePerformance);
    };

    updatePerformance();
  }, []);

  return (
    <div 
      className="performance-monitor"
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000
      }}
    >
      <div>FPS: {fps}</div>
      {memoryUsage > 0 && <div>Memory: {memoryUsage.toFixed(1)}%</div>}
    </div>
  );
};

// メインアプリケーションコンポーネント
const MouseInteractiveApp = () => {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0);
  const [showPerformance, setShowPerformance] = useState(false);

  useEffect(() => {
    // キーボードショートカット
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'p':
        case 'P':
          setShowPerformance(prev => !prev);
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="mouse-interactive-app">
      <InteractiveCanvas />
      
      <EmotionVisualization 
        emotion={currentEmotion} 
        intensity={emotionIntensity} 
      />
      
      {showPerformance && <PerformanceMonitor />}
      
      <style jsx>{`
        .mouse-interactive-app {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0a0a1a;
          font-family: 'Inter', sans-serif;
        }

        .interactive-canvas-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .interactive-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .control-panel {
          min-width: 250px;
          color: white;
          font-size: 14px;
        }

        .control-panel.hidden {
          opacity: 0;
          transform: translateY(-10px);
        }

        .control-panel.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .emotion-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .emotion-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .emotion-calm { background: linear-gradient(45deg, #4FB3D9, #68C3E0); }
        .emotion-excited { background: linear-gradient(45deg, #FF6B6B, #FF8E8E); }
        .emotion-contemplative { background: linear-gradient(45deg, #A8E6CF, #B8F0D6); }
        .emotion-playful { background: linear-gradient(45deg, #FFD93D, #FFE066); }
        .emotion-focused { background: linear-gradient(45deg, #B8860B, #D4A515); }
        .emotion-neutral { background: linear-gradient(45deg, #CCCCCC, #E0E0E0); }

        .intensity-control {
          margin-bottom: 15px;
        }

        .intensity-control label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
          opacity: 0.8;
        }

        .intensity-slider {
          width: 100%;
          margin-bottom: 5px;
          accent-color: #4FB3D9;
        }

        .intensity-value {
          font-size: 12px;
          opacity: 0.7;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .control-button {
          background: rgba(75, 179, 217, 0.2);
          border: 1px solid rgba(75, 179, 217, 0.4);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-button:hover {
          background: rgba(75, 179, 217, 0.3);
          border-color: rgba(75, 179, 217, 0.6);
        }

        .instructions {
          font-size: 11px;
          opacity: 0.6;
          line-height: 1.4;
        }

        .instructions p {
          margin: 2px 0;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .control-panel {
            min-width: 200px;
            font-size: 12px;
            padding: 12px;
          }
          
          .instructions {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// エクスポート
export default MouseInteractiveApp;
export { InteractiveCanvas, ControlPanel, EmotionVisualization, PerformanceMonitor };