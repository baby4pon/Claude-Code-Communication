import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const CanvasRenderer = forwardRef(({
  width = 800,
  height = 600,
  onCanvasReady,
  quality = 'high',
  style = {}
}, ref) => {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getContext: () => canvasRef.current?.getContext('2d'),
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    resize: (newWidth, newHeight) => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = newWidth;
        canvas.height = newHeight;
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && onCanvasReady) {
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        if (quality === 'high') {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        } else {
          ctx.imageSmoothingEnabled = false;
        }
      }
      
      onCanvasReady(canvas);
    }
  }, [width, height, onCanvasReady, quality]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
      }
    }
  }, [width, height]);

  const canvasStyle = {
    display: 'block',
    backgroundColor: '#000',
    imageRendering: quality === 'low' ? 'pixelated' : 'auto',
    ...style
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={canvasStyle}
    />
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';

export default CanvasRenderer;