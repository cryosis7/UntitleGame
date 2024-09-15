import type React from 'react';
import { useRef, useEffect } from 'react';
import { setupPixi } from '../utils/pixiUtils';

export const PixiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current !== null) {
      setupPixi(canvasRef.current);
    }
  }, []);

  return <canvas ref={canvasRef} />;
};