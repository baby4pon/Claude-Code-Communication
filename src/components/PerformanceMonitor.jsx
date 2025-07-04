import React, { useState, useEffect } from 'react';

const PerformanceMonitor = ({
  performance,
  memoryState,
  adaptiveConfig,
  engineStats,
  memoryStats,
  renderStats,
  onOptimize,
  style
}) => {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState({
    fps: [],
    memory: [],
    renderTime: []
  });

  useEffect(() => {
    if (performance) {
      setHistory(prev => ({
        fps: [...prev.fps.slice(-19), performance.fps || 0],
        memory: [...prev.memory.slice(-19), performance.memory || 0],
        renderTime: [...prev.renderTime.slice(-19), performance.renderTime || 0]
      }));
    }
  }, [performance]);

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return '#27ae60';
    if (value >= thresholds.warning) return '#f39c12';
    return '#e74c3c';
  };

  const getFpsColor = (fps) => getStatusColor(fps, { good: 50, warning: 30 });
  const getMemoryColor = (memory) => getStatusColor(100 - memory, { good: 50, warning: 20 });
  const getRenderTimeColor = (time) => getStatusColor(50 - time, { good: 30, warning: 10 });

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toFixed(1);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const renderMiniChart = (data, color) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="20" style={{ marginLeft: '10px' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      </svg>
    );
  };

  return (
    <div 
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        minWidth: '200px',
        maxWidth: '350px',
        ...style
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <h4 style={{ margin: 0, fontSize: '14px' }}>Performance Monitor</h4>
        <span style={{ fontSize: '12px' }}>{expanded ? '▼' : '▲'}</span>
      </div>

      <div className="performance-summary">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ minWidth: '60px' }}>FPS:</span>
          <span style={{ color: getFpsColor(performance?.fps), fontWeight: 'bold' }}>
            {formatNumber(performance?.fps)}
          </span>
          {renderMiniChart(history.fps, getFpsColor(performance?.fps))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ minWidth: '60px' }}>Memory:</span>
          <span style={{ color: getMemoryColor(performance?.memory), fontWeight: 'bold' }}>
            {performance?.memory || 0}%
          </span>
          {renderMiniChart(history.memory, getMemoryColor(performance?.memory))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ minWidth: '60px' }}>Render:</span>
          <span style={{ color: getRenderTimeColor(performance?.renderTime), fontWeight: 'bold' }}>
            {formatNumber(performance?.renderTime)}ms
          </span>
          {renderMiniChart(history.renderTime, getRenderTimeColor(performance?.renderTime))}
        </div>

        <div style={{ marginBottom: '5px' }}>
          <span>Particles: </span>
          <span style={{ fontWeight: 'bold' }}>{performance?.particleCount || 0}</span>
        </div>
      </div>

      {expanded && (
        <div className="detailed-stats" style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '10px' }}>
          
          {memoryState && (
            <div style={{ marginBottom: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#3498db' }}>Memory Status</h5>
              <div>Used: {formatBytes(memoryState.usedMemory)}</div>
              <div>Available: {formatBytes(memoryState.availableMemory)}</div>
              <div>Optimization: {memoryState.optimizationLevel}</div>
            </div>
          )}

          {adaptiveConfig && (
            <div style={{ marginBottom: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#e74c3c' }}>Adaptive Config</h5>
              <div>Max Particles: {adaptiveConfig.particleCount}</div>
              <div>Quality: {adaptiveConfig.quality}</div>
              <div>Update: {formatNumber(adaptiveConfig.updateInterval)}ms</div>
            </div>
          )}

          {engineStats && (
            <div style={{ marginBottom: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#27ae60' }}>Engine Stats</h5>
              <div>Total: {engineStats.totalParticles}</div>
              <div>Active: {engineStats.activeParticles}</div>
              <div>Memory: {formatBytes(engineStats.memoryUsage)}</div>
            </div>
          )}

          {renderStats && (
            <div style={{ marginBottom: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#f39c12' }}>Render Stats</h5>
              <div>Frame: {renderStats.frameCounter}</div>
              <div>Time: {formatNumber(renderStats.renderTime)}ms</div>
              <div>FPS: {formatNumber(renderStats.fps)}</div>
            </div>
          )}

          {memoryStats && memoryStats.recommendations && memoryStats.recommendations.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#e67e22' }}>Recommendations</h5>
              {memoryStats.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} style={{ fontSize: '11px', color: '#bdc3c7' }}>
                  • {rec}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
            <button
              onClick={onOptimize}
              style={{
                padding: '4px 8px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Optimize
            </button>
            
            <button
              onClick={() => setHistory({ fps: [], memory: [], renderTime: [] })}
              style={{
                padding: '4px 8px',
                backgroundColor: '#7f8c8d',
                color: '#fff',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {(performance?.fps < 30 || performance?.memory > 80) && (
        <div 
          style={{
            marginTop: '10px',
            padding: '5px',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderRadius: '4px',
            border: '1px solid #e74c3c',
            fontSize: '11px'
          }}
        >
          ⚠ Performance Warning
          {performance?.fps < 30 && <div>• Low FPS detected</div>}
          {performance?.memory > 80 && <div>• High memory usage</div>}
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;