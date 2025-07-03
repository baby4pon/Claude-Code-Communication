/**
 * Magnetism-Based UI Transformation System
 * マウス位置を磁力源として、UI要素が物理的に引き寄せられる効果
 */

import { useSpring, useTransform, useMotionValue } from 'framer-motion';

class MagnetismUITransformer {
  constructor() {
    this.magneticElements = new Map();
    this.mousePosition = { x: 0, y: 0 };
    this.globalMagnetStrength = 1.0;
    this.animationFrame = null;
    this.isActive = true;
    
    // 物理パラメータ
    this.physics = {
      attraction: 0.15,
      damping: 0.8,
      maxDistance: 200,
      minDistance: 10
    };
    
    this.setupMouseTracking();
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
      this.updateMagneticField();
    });
    
    document.addEventListener('mouseleave', () => {
      this.resetAllElements();
    });
  }

  // 磁性要素の登録
  registerElement(element, options = {}) {
    const defaultOptions = {
      strength: 1.0,
      maxDistance: 150,
      elasticity: 0.3,
      damping: 0.8,
      rotationEnabled: false,
      scaleEnabled: false,
      borderMagnetism: false,
      repulsion: false
    };
    
    const config = { ...defaultOptions, ...options };
    const elementId = this.generateElementId();
    
    const magneticData = {
      id: elementId,
      element,
      config,
      originalPosition: this.getElementCenter(element),
      currentPosition: this.getElementCenter(element),
      velocity: { x: 0, y: 0 },
      isAnimating: false
    };
    
    this.magneticElements.set(elementId, magneticData);
    return elementId;
  }

  // 要素の登録解除
  unregisterElement(elementId) {
    const magneticData = this.magneticElements.get(elementId);
    if (magneticData) {
      this.resetElement(magneticData);
      this.magneticElements.delete(elementId);
    }
  }

  // 磁力場の更新
  updateMagneticField() {
    if (!this.isActive) return;
    
    this.magneticElements.forEach(magneticData => {
      this.updateElementMagnetism(magneticData);
    });
  }

  updateElementMagnetism(magneticData) {
    const { element, config, originalPosition, velocity } = magneticData;
    const elementCenter = this.getElementCenter(element);
    
    // マウスとの距離計算
    const distance = this.calculateDistance(this.mousePosition, elementCenter);
    
    if (distance > config.maxDistance) {
      // 範囲外の場合は元の位置に戻る
      this.returnToOriginal(magneticData);
      return;
    }
    
    // 磁力計算
    const magneticForce = this.calculateMagneticForce(
      this.mousePosition, 
      elementCenter, 
      distance, 
      config
    );
    
    // 物理シミュレーション
    velocity.x += magneticForce.x * config.elasticity;
    velocity.y += magneticForce.y * config.elasticity;
    
    // 摩擦力適用
    velocity.x *= config.damping;
    velocity.y *= config.damping;
    
    // 新しい位置計算
    const newPosition = {
      x: elementCenter.x + velocity.x,
      y: elementCenter.y + velocity.y
    };
    
    // 制約適用
    const constrainedPosition = this.applyConstraints(newPosition, magneticData);
    
    // 変形適用
    this.applyTransformation(element, constrainedPosition, originalPosition, config, distance);
    
    magneticData.currentPosition = constrainedPosition;
  }

  // 磁力計算
  calculateMagneticForce(mousePos, elementPos, distance, config) {
    if (distance < this.physics.minDistance) {
      return { x: 0, y: 0 };
    }
    
    // 方向ベクトル
    const direction = {
      x: mousePos.x - elementPos.x,
      y: mousePos.y - elementPos.y
    };
    
    // 正規化
    const normalizedDirection = {
      x: direction.x / distance,
      y: direction.y / distance
    };
    
    // 磁力の強さ（距離の逆二乗則）
    let forceMagnitude = (config.strength * this.globalMagnetStrength) / (distance * distance) * 10000;
    
    // 反発力の場合は符号反転
    if (config.repulsion) {
      forceMagnitude *= -1;
    }
    
    // 距離による減衰
    const decay = Math.max(0, 1 - distance / config.maxDistance);
    forceMagnitude *= decay;
    
    return {
      x: normalizedDirection.x * forceMagnitude,
      y: normalizedDirection.y * forceMagnitude
    };
  }

  // 変形の適用
  applyTransformation(element, newPosition, originalPosition, config, distance) {
    const offset = {
      x: newPosition.x - originalPosition.x,
      y: newPosition.y - originalPosition.y
    };
    
    let transform = `translate(${offset.x}px, ${offset.y}px)`;
    
    // 回転効果
    if (config.rotationEnabled) {
      const angle = Math.atan2(offset.y, offset.x) * (180 / Math.PI);
      const rotationIntensity = Math.min(distance / config.maxDistance, 1) * 15;
      transform += ` rotate(${angle * rotationIntensity * 0.1}deg)`;
    }
    
    // スケール効果
    if (config.scaleEnabled) {
      const scaleIntensity = 1 + (Math.min(distance / config.maxDistance, 1) * 0.1);
      transform += ` scale(${scaleIntensity})`;
    }
    
    // 境界磁性効果
    if (config.borderMagnetism) {
      const borderIntensity = Math.min(distance / config.maxDistance, 1) * 3;
      element.style.borderWidth = `${borderIntensity}px`;
      element.style.borderColor = `hsl(${360 - distance}, 70%, 50%)`;
    }
    
    element.style.transform = transform;
    element.style.willChange = 'transform';
    
    // GPU加速の有効化
    if (!element.style.transform.includes('translate3d')) {
      element.style.transform += ' translate3d(0, 0, 0)';
    }
  }

  // 制約の適用
  applyConstraints(position, magneticData) {
    const { element, config } = magneticData;
    const rect = element.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // 画面境界制約
    const constrainedPosition = {
      x: Math.max(rect.width / 2, Math.min(viewport.width - rect.width / 2, position.x)),
      y: Math.max(rect.height / 2, Math.min(viewport.height - rect.height / 2, position.y))
    };
    
    return constrainedPosition;
  }

  // 元の位置に戻る
  returnToOriginal(magneticData) {
    const { element, originalPosition, config } = magneticData;
    
    if (!magneticData.isAnimating) {
      magneticData.isAnimating = true;
      
      const returnAnimation = element.animate([
        { transform: element.style.transform },
        { transform: 'translate(0px, 0px)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'forwards'
      });
      
      returnAnimation.onfinish = () => {
        magneticData.isAnimating = false;
        magneticData.velocity = { x: 0, y: 0 };
        element.style.transform = '';
        element.style.willChange = 'auto';
      };
    }
  }

  // 全要素をリセット
  resetAllElements() {
    this.magneticElements.forEach(magneticData => {
      this.returnToOriginal(magneticData);
    });
  }

  // 要素の中心座標取得
  getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // 距離計算
  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    );
  }

  // 要素ID生成
  generateElementId() {
    return 'magnetic-' + Math.random().toString(36).substr(2, 9);
  }

  // 個別要素のリセット
  resetElement(magneticData) {
    const { element } = magneticData;
    element.style.transform = '';
    element.style.willChange = 'auto';
    magneticData.velocity = { x: 0, y: 0 };
  }

  // 磁力の強さ調整
  setGlobalMagnetStrength(strength) {
    this.globalMagnetStrength = Math.max(0, Math.min(2, strength));
  }

  // システムの有効/無効切り替え
  setActive(active) {
    this.isActive = active;
    if (!active) {
      this.resetAllElements();
    }
  }

  // 破棄
  destroy() {
    document.removeEventListener('mousemove', this.updateMagneticField);
    document.removeEventListener('mouseleave', this.resetAllElements);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.resetAllElements();
    this.magneticElements.clear();
  }
}

// React Hook
export const useMagnetismTransformer = () => {
  const [transformer] = useState(() => new MagnetismUITransformer());
  
  useEffect(() => {
    return () => transformer.destroy();
  }, [transformer]);
  
  const registerElement = useCallback((element, options) => {
    if (element) {
      return transformer.registerElement(element, options);
    }
  }, [transformer]);
  
  const unregisterElement = useCallback((elementId) => {
    transformer.unregisterElement(elementId);
  }, [transformer]);
  
  return {
    registerElement,
    unregisterElement,
    setGlobalStrength: (strength) => transformer.setGlobalMagnetStrength(strength),
    setActive: (active) => transformer.setActive(active)
  };
};

// React コンポーネント
export const MagneticElement = ({ 
  children, 
  strength = 1.0, 
  maxDistance = 150,
  elasticity = 0.3,
  rotationEnabled = false,
  scaleEnabled = false,
  ...props 
}) => {
  const elementRef = useRef(null);
  const { registerElement, unregisterElement } = useMagnetismTransformer();
  const [elementId, setElementId] = useState(null);
  
  useEffect(() => {
    if (elementRef.current) {
      const id = registerElement(elementRef.current, {
        strength,
        maxDistance,
        elasticity,
        rotationEnabled,
        scaleEnabled
      });
      setElementId(id);
      
      return () => {
        if (id) unregisterElement(id);
      };
    }
  }, [registerElement, unregisterElement, strength, maxDistance, elasticity]);
  
  return (
    <div ref={elementRef} {...props}>
      {children}
    </div>
  );
};

export default MagnetismUITransformer;