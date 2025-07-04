import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 🎯 Error boundary for graceful error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Particle Text Animation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(45deg, #0a0a0a, #1a1a2e, #16213e)',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ color: '#FF6B6B', marginBottom: '20px' }}>
            🎆 Animation Error
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Something went wrong with the particle animation.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              border: '2px solid #4ECDC4',
              borderRadius: '25px',
              background: 'rgba(78, 205, 196, 0.2)',
              color: '#4ECDC4',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4ECDC4';
              e.target.style.color = '#000';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(78, 205, 196, 0.2)';
              e.target.style.color = '#4ECDC4';
            }}
          >
            🔄 Reload Magic
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🚀 Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// 🎯 Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('🎪 App Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  });
}