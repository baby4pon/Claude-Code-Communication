export class ParticleSystemRecovery {
  constructor(engine) {
    this.engine = engine;
    this.errorCount = 0;
    this.maxErrors = 5;
    this.backupStates = [];
    this.maxBackups = 5;
    this.recoveryStrategies = new Map();
    this.isRecovering = false;
    
    this.initializeStrategies();
  }

  initializeStrategies() {
    this.recoveryStrategies.set('memory', this.memoryRecoveryStrategy.bind(this));
    this.recoveryStrategies.set('performance', this.performanceRecoveryStrategy.bind(this));
    this.recoveryStrategies.set('rendering', this.renderingRecoveryStrategy.bind(this));
    this.recoveryStrategies.set('critical', this.criticalRecoveryStrategy.bind(this));
  }

  createBackupState() {
    if (!this.engine) return;

    try {
      const backupState = {
        timestamp: Date.now(),
        particleCount: this.engine.getStats ? this.engine.getStats().activeParticles : 0,
        memoryUsage: this.engine.getStats ? this.engine.getStats().memoryUsage : 0,
        configuration: this.engine.getConfig ? { ...this.engine.getConfig() } : {},
        engineState: this.captureEngineState()
      };

      this.backupStates.push(backupState);

      if (this.backupStates.length > this.maxBackups) {
        this.backupStates.shift();
      }

      console.log('Backup state created:', backupState.timestamp);
    } catch (error) {
      console.error('Failed to create backup state:', error);
    }
  }

  captureEngineState() {
    if (!this.engine) return {};

    try {
      return {
        isAnimating: this.engine.isAnimating || false,
        currentState: this.engine.currentState || 'idle',
        particlePools: this.engine.getStats ? this.engine.getStats().poolStats : {}
      };
    } catch (error) {
      console.warn('Failed to capture engine state:', error);
      return {};
    }
  }

  handleError(error, context = {}) {
    this.errorCount++;
    const errorInfo = {
      error: error,
      context: context,
      timestamp: Date.now(),
      errorCount: this.errorCount
    };

    console.error('Particle system error:', errorInfo);

    if (this.isRecovering) {
      console.warn('Already in recovery mode, skipping additional recovery');
      return;
    }

    this.isRecovering = true;

    try {
      const recoveryType = this.determineRecoveryType(error, context);
      this.executeRecovery(recoveryType, errorInfo);
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      this.performCriticalRecovery();
    } finally {
      this.isRecovering = false;
    }
  }

  determineRecoveryType(error, context) {
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
      return 'memory';
    }
    
    if (errorMessage.includes('performance') || errorMessage.includes('fps')) {
      return 'performance';
    }
    
    if (errorMessage.includes('canvas') || errorMessage.includes('render')) {
      return 'rendering';
    }
    
    if (this.errorCount >= this.maxErrors) {
      return 'critical';
    }
    
    return 'performance';
  }

  executeRecovery(recoveryType, errorInfo) {
    const strategy = this.recoveryStrategies.get(recoveryType);
    
    if (strategy) {
      console.log(`Executing ${recoveryType} recovery strategy`);
      strategy(errorInfo);
    } else {
      console.warn(`Unknown recovery type: ${recoveryType}, using critical recovery`);
      this.criticalRecoveryStrategy(errorInfo);
    }
  }

  memoryRecoveryStrategy(errorInfo) {
    console.log('Applying memory recovery strategy');
    
    try {
      if (this.engine && this.engine.updateConfig) {
        const currentConfig = this.engine.getConfig ? this.engine.getConfig() : {};
        const reducedConfig = {
          ...currentConfig,
          particleCount: Math.floor((currentConfig.particleCount || 1000) * 0.6),
          quality: 'low',
          maxParticles: Math.floor((currentConfig.maxParticles || 5000) * 0.8)
        };
        
        this.engine.updateConfig(reducedConfig);
      }

      if (window.gc) {
        window.gc();
      }

      this.forceGarbageCollection();
      
    } catch (error) {
      console.error('Memory recovery failed:', error);
      this.performanceRecoveryStrategy(errorInfo);
    }
  }

  performanceRecoveryStrategy(errorInfo) {
    console.log('Applying performance recovery strategy');
    
    try {
      if (this.engine && this.engine.updateConfig) {
        const currentConfig = this.engine.getConfig ? this.engine.getConfig() : {};
        const optimizedConfig = {
          ...currentConfig,
          particleCount: Math.floor((currentConfig.particleCount || 1000) * 0.8),
          quality: currentConfig.quality === 'high' ? 'medium' : 'low',
          updateInterval: (currentConfig.updateInterval || 16.67) * 1.5
        };
        
        this.engine.updateConfig(optimizedConfig);
      }

      if (this.engine && this.engine.optimizePerformance) {
        this.engine.optimizePerformance();
      }
      
    } catch (error) {
      console.error('Performance recovery failed:', error);
      this.renderingRecoveryStrategy(errorInfo);
    }
  }

  renderingRecoveryStrategy(errorInfo) {
    console.log('Applying rendering recovery strategy');
    
    try {
      if (this.engine && this.engine.clearParticles) {
        this.engine.clearParticles();
      }

      if (this.engine && this.engine.resetRenderer) {
        this.engine.resetRenderer();
      }

      if (this.engine && this.engine.updateConfig) {
        const safeConfig = {
          particleCount: 500,
          quality: 'low',
          enableWorkers: false,
          enableMemoryOptimization: true
        };
        
        this.engine.updateConfig(safeConfig);
      }
      
    } catch (error) {
      console.error('Rendering recovery failed:', error);
      this.criticalRecoveryStrategy(errorInfo);
    }
  }

  criticalRecoveryStrategy(errorInfo) {
    console.log('Applying critical recovery strategy');
    
    try {
      const latestBackup = this.getLatestValidBackup();
      
      if (latestBackup && this.engine) {
        this.restoreFromBackup(latestBackup);
      } else {
        this.performFullReset();
      }
      
      this.errorCount = 0;
      
    } catch (error) {
      console.error('Critical recovery failed:', error);
      this.performEmergencyShutdown();
    }
  }

  getLatestValidBackup() {
    for (let i = this.backupStates.length - 1; i >= 0; i--) {
      const backup = this.backupStates[i];
      if (this.isBackupValid(backup)) {
        return backup;
      }
    }
    return null;
  }

  isBackupValid(backup) {
    return backup && 
           backup.timestamp && 
           (Date.now() - backup.timestamp) < 30000 &&
           backup.configuration;
  }

  restoreFromBackup(backup) {
    console.log('Restoring from backup:', backup.timestamp);
    
    try {
      if (this.engine && this.engine.updateConfig && backup.configuration) {
        this.engine.updateConfig(backup.configuration);
      }

      if (this.engine && this.engine.clearParticles) {
        this.engine.clearParticles();
      }

      if (backup.engineState && this.engine.setState) {
        this.engine.setState(backup.engineState);
      }
      
    } catch (error) {
      console.error('Backup restoration failed:', error);
      this.performFullReset();
    }
  }

  performFullReset() {
    console.log('Performing full system reset');
    
    try {
      if (this.engine) {
        if (this.engine.stop) {
          this.engine.stop();
        }
        
        if (this.engine.clearParticles) {
          this.engine.clearParticles();
        }
        
        if (this.engine.reset) {
          this.engine.reset();
        }
        
        const defaultConfig = {
          particleCount: 100,
          quality: 'low',
          enableWorkers: false,
          enableMemoryOptimization: true
        };
        
        if (this.engine.updateConfig) {
          this.engine.updateConfig(defaultConfig);
        }
      }
      
      this.forceGarbageCollection();
      
    } catch (error) {
      console.error('Full reset failed:', error);
      this.performEmergencyShutdown();
    }
  }

  performEmergencyShutdown() {
    console.error('Performing emergency shutdown');
    
    try {
      if (this.engine && this.engine.destroy) {
        this.engine.destroy();
      }
      
      this.engine = null;
      this.backupStates = [];
      this.errorCount = 0;
      
    } catch (error) {
      console.error('Emergency shutdown failed:', error);
    }
  }

  forceGarbageCollection() {
    try {
      if (window.gc) {
        window.gc();
      } else {
        const dummy = new Array(1000000).fill(0);
        dummy.length = 0;
      }
    } catch (error) {
      console.warn('Garbage collection failed:', error);
    }
  }

  getRecoveryStats() {
    return {
      errorCount: this.errorCount,
      maxErrors: this.maxErrors,
      backupCount: this.backupStates.length,
      isRecovering: this.isRecovering,
      strategies: Array.from(this.recoveryStrategies.keys())
    };
  }

  reset() {
    this.errorCount = 0;
    this.backupStates = [];
    this.isRecovering = false;
  }

  destroy() {
    this.engine = null;
    this.backupStates = [];
    this.recoveryStrategies.clear();
    this.isRecovering = false;
  }
}

export default ParticleSystemRecovery;