import { useRef, useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { TextShape } from './TextShape';
import type { ShapeType } from '../types';

interface UseTextShapeOptions {
  text: string;
  shape?: ShapeType;
  intensity?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
}

interface UseTextShapeReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textShape: TextShape | null;
  setShape: (shape: ShapeType) => void;
  setIntensity: (intensity: number) => void;
  setText: (text: string) => void;
  exportPNG: () => string | undefined;
  exportSVG: () => string | undefined;
}

/**
 * React hook for using TextShape with a canvas
 */
export function useTextShape(options: UseTextShapeOptions): UseTextShapeReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const textShapeRef = useRef<TextShape | null>(null);

  const {
    text,
    shape = 'none',
    intensity = 50,
    fontSize = 48,
    fontFamily = 'Arial',
    fill = '#000000',
    canvasWidth = 600,
    canvasHeight = 200,
    backgroundColor = '#ffffff',
  } = options;

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor,
    });

    fabricCanvasRef.current = canvas;

    // Create TextShape
    const textShape = new TextShape({
      text,
      shape,
      intensity,
      fontSize,
      fontFamily,
      fill,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
    });

    // Center the text
    textShape.set({
      originX: 'center',
      originY: 'center',
    });

    canvas.add(textShape);
    canvas.centerObject(textShape);
    canvas.renderAll();

    textShapeRef.current = textShape;

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      textShapeRef.current = null;
    };
  }, [canvasWidth, canvasHeight, backgroundColor]);

  // Update text
  useEffect(() => {
    if (textShapeRef.current) {
      textShapeRef.current.text = text;
      fabricCanvasRef.current?.renderAll();
    }
  }, [text]);

  // Update shape
  useEffect(() => {
    if (textShapeRef.current) {
      textShapeRef.current.shape = shape;
      fabricCanvasRef.current?.renderAll();
    }
  }, [shape]);

  // Update intensity
  useEffect(() => {
    if (textShapeRef.current) {
      textShapeRef.current.intensity = intensity;
      fabricCanvasRef.current?.renderAll();
    }
  }, [intensity]);

  // Update font size
  useEffect(() => {
    if (textShapeRef.current) {
      // Re-render text with new font size
      textShapeRef.current.setText(text);
      fabricCanvasRef.current?.renderAll();
    }
  }, [fontSize, fontFamily, fill]);

  const setShape = useCallback((newShape: ShapeType) => {
    if (textShapeRef.current) {
      textShapeRef.current.shape = newShape;
      fabricCanvasRef.current?.renderAll();
    }
  }, []);

  const setIntensity = useCallback((newIntensity: number) => {
    if (textShapeRef.current) {
      textShapeRef.current.intensity = newIntensity;
      fabricCanvasRef.current?.renderAll();
    }
  }, []);

  const setText = useCallback((newText: string) => {
    if (textShapeRef.current) {
      textShapeRef.current.text = newText;
      fabricCanvasRef.current?.renderAll();
    }
  }, []);

  const exportPNG = useCallback(() => {
    return fabricCanvasRef.current?.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
  }, []);

  const exportSVG = useCallback(() => {
    return fabricCanvasRef.current?.toSVG();
  }, []);

  return {
    canvasRef,
    textShape: textShapeRef.current,
    setShape,
    setIntensity,
    setText,
    exportPNG,
    exportSVG,
  };
}
