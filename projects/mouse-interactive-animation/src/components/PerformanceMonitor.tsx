import React from 'react';

interface PerformanceMonitorProps {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  resonanceLevel: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  fps,
  memoryUsage,
  renderTime,
  resonanceLevel
}) => {
  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return '#4ade80'; // green
    if (value >= thresholds.warning) return '#facc15'; // yellow
    return '#ef4444'; // red
  };

  const getFpsColor = () => getPerformanceColor(fps, { good: 55, warning: 30 });
  const getMemoryColor = () => getPerformanceColor(100 - memoryUsage, { good: 70, warning: 50 });
  const getRenderColor = () => getPerformanceColor(60 - renderTime, { good: 45, warning: 30 });

  return (
    <div className="performance-monitor">
      <h4>Performance Monitor</h4>
      
      <div className="metric">
        <span className="metric-label">FPS:</span>
        <span className="metric-value" style={{ color: getFpsColor() }}>
          {fps.toFixed(1)}
        </span>
        <div className="metric-bar">
          <div 
            className="metric-fill" 
            style={{ 
              width: `${Math.min(fps / 60 * 100, 100)}%`,
              backgroundColor: getFpsColor()
            }}
          />
        </div>
      </div>

      <div className="metric">
        <span className="metric-label">Memory:</span>
        <span className="metric-value" style={{ color: getMemoryColor() }}>
          {memoryUsage.toFixed(1)}%
        </span>
        <div className="metric-bar">
          <div 
            className="metric-fill" 
            style={{ 
              width: `${memoryUsage}%`,
              backgroundColor: getMemoryColor()
            }}
          />
        </div>
      </div>

      <div className="metric">
        <span className="metric-label">Render:</span>
        <span className="metric-value" style={{ color: getRenderColor() }}>
          {renderTime.toFixed(2)}ms
        </span>
        <div className="metric-bar">
          <div 
            className="metric-fill" 
            style={{ 
              width: `${Math.min(renderTime / 16.67 * 100, 100)}%`,
              backgroundColor: getRenderColor()
            }}
          />
        </div>
      </div>

      <div className="metric">
        <span className="metric-label">Resonance:</span>
        <span className="metric-value" style={{ color: '#8b5cf6' }}>
          {resonanceLevel.toFixed(3)}
        </span>
        <div className="metric-bar">
          <div 
            className="metric-fill" 
            style={{ 
              width: `${resonanceLevel * 100}%`,
              backgroundColor: '#8b5cf6'
            }}
          />
        </div>
      </div>

      <div className="performance-status">
        <span className={`status-indicator ${fps > 55 ? 'good' : fps > 30 ? 'warning' : 'critical'}`}>
          {fps > 55 ? '● Optimal' : fps > 30 ? '⚠ Warning' : '🔥 Critical'}
        </span>
      </div>
    </div>
  );
};