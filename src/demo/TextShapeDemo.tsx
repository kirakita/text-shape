import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { TextShape, getAllShapes, type ShapeType } from '../lib';

const shapes = getAllShapes();

const FONTS = [
  'Impact',
  'Arial Black',
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Comic Sans MS',
];

export function TextShapeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const textShapeRef = useRef<TextShape | null>(null);

  const [text, setText] = useState('Your Text Here');
  const [shape, setShape] = useState<ShapeType>('none');
  const [intensity, setIntensity] = useState(50);
  const [fontSize, setFontSize] = useState(60);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [fill, setFill] = useState('#ffffff');

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 400,
      backgroundColor: '#1e1e1e',
      selection: false,
    });

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update text shape when any property changes
  const updateTextShape = useCallback(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;

    // Remove existing text shape
    if (textShapeRef.current) {
      canvas.remove(textShapeRef.current);
      textShapeRef.current = null;
    }

    if (!text) {
      canvas.renderAll();
      return;
    }

    // Create new text shape centered on canvas
    const textShape = new TextShape({
      text,
      shape,
      intensity,
      fontSize,
      fontFamily,
      fill,
      left: canvas.width! / 2,
      top: canvas.height! / 2,
    });

    // Configure selection handles
    textShape.set({
      selectable: true,
      hasControls: true,
      hasBorders: true,
      borderColor: '#667eea',
      cornerColor: '#667eea',
      cornerStyle: 'circle',
      transparentCorners: false,
      cornerSize: 10,
      padding: 10,
    });

    canvas.add(textShape);
    textShape.setCoords();
    canvas.setActiveObject(textShape);
    canvas.renderAll();
    textShapeRef.current = textShape;
  }, [text, shape, intensity, fontSize, fontFamily, fill]);

  // Run update when dependencies change
  useEffect(() => {
    updateTextShape();
  }, [updateTextShape]);

  const handleExportPNG = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ 
      format: 'png', 
      quality: 1, 
      multiplier: 2,
    });
    const link = document.createElement('a');
    link.download = 'text-shape.png';
    link.href = dataUrl;
    link.click();
  };

  const handleReset = () => {
    setText('Your Text Here');
    setShape('none');
    setIntensity(50);
    setFontSize(60);
    setFontFamily('Impact');
    setFill('#ffffff');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">✨</span>
          <span className="logo-text">Text Shape</span>
        </div>
        <a 
          href="https://github.com/kirakita/text-shape" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
        >
          GitHub →
        </a>
      </header>

      <div className="main-layout">
        {/* Left Panel - Controls */}
        <aside className="controls-panel">
          {/* Text Input */}
          <div className="control-section">
            <label className="control-label">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="text-input"
            />
          </div>

          {/* Shape Selection */}
          <div className="control-section">
            <label className="control-label">Shape</label>
            <div className="shape-grid">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  className={`shape-btn ${shape === s.id ? 'active' : ''}`}
                  onClick={() => setShape(s.id)}
                  title={s.description}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="control-section">
            <div className="control-header">
              <label className="control-label">Intensity</label>
              <span className="control-value">{intensity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="slider"
            />
          </div>

          {/* Font Selection */}
          <div className="control-section">
            <label className="control-label">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="select-input"
            >
              {FONTS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>

            <div className="control-header" style={{ marginTop: '12px' }}>
              <label className="control-label">Size</label>
              <span className="control-value">{fontSize}</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="slider"
            />
          </div>

          {/* Color Picker */}
          <div className="control-section">
            <label className="control-label">Color</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                className="color-picker"
              />
              <span className="color-value">{fill}</span>
              <span className="color-label">Text Color</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="control-section actions">
            <button onClick={handleExportPNG} className="btn btn-primary">
              Download PNG
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="canvas-area">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
          <p className="canvas-hint">Click and drag to move • Use handles to resize</p>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>Built with </span>
        <a href="http://fabricjs.com/" target="_blank" rel="noopener noreferrer">fabric.js</a>
        <span> • Inspired by CustomInk • </span>
        <a href="https://dimmah.com" target="_blank" rel="noopener noreferrer">Dimmah</a>
      </footer>
    </div>
  );
}
