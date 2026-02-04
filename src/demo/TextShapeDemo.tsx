import { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { TextShape, getAllShapes, type ShapeType } from '../lib';

const shapes = getAllShapes();

export function TextShapeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const textShapeRef = useRef<TextShape | null>(null);

  const [text, setText] = useState('Hello World');
  const [shape, setShape] = useState<ShapeType>('none');
  const [intensity, setIntensity] = useState(50);
  const [fontSize, setFontSize] = useState(48);
  const [fill, setFill] = useState('#ffffff');

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 700,
      height: 300,
      backgroundColor: '#1a1a1a',
    });

    fabricRef.current = canvas;

    const textShape = new TextShape({
      text,
      shape,
      intensity,
      fontSize,
      fill,
      left: 350,
      top: 150,
    });

    textShape.set({
      originX: 'center',
      originY: 'center',
    });

    canvas.add(textShape);
    canvas.renderAll();
    textShapeRef.current = textShape;

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update text shape on changes
  useEffect(() => {
    if (!textShapeRef.current || !fabricRef.current) return;
    
    // Remove old and create new with updated properties
    fabricRef.current.remove(textShapeRef.current);
    
    const newTextShape = new TextShape({
      text,
      shape,
      intensity,
      fontSize,
      fill,
      left: 350,
      top: 150,
    });

    newTextShape.set({
      originX: 'center',
      originY: 'center',
    });

    fabricRef.current.add(newTextShape);
    fabricRef.current.renderAll();
    textShapeRef.current = newTextShape;
  }, [text, shape, intensity, fontSize, fill]);

  const handleExportPNG = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
    const link = document.createElement('a');
    link.download = 'text-shape.png';
    link.href = dataUrl;
    link.click();
  };

  const handleExportSVG = () => {
    if (!fabricRef.current) return;
    const svg = fabricRef.current.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'text-shape.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="demo-container">
      <header className="demo-header">
        <h1>Text Shape</h1>
        <p>Warp text into beautiful shapes</p>
      </header>

      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="text-input">Text</label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
          />
        </div>

        <div className="control-group">
          <label htmlFor="shape-select">Shape</label>
          <select
            id="shape-select"
            value={shape}
            onChange={(e) => setShape(e.target.value as ShapeType)}
          >
            {shapes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="intensity-slider">
            Intensity: {intensity}%
          </label>
          <input
            id="intensity-slider"
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="font-size-slider">
            Font Size: {fontSize}px
          </label>
          <input
            id="font-size-slider"
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label htmlFor="color-picker">Color</label>
          <input
            id="color-picker"
            type="color"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
          />
        </div>

        <div className="export-buttons">
          <button onClick={handleExportPNG}>Export PNG</button>
          <button onClick={handleExportSVG}>Export SVG</button>
        </div>
      </div>

      <footer className="demo-footer">
        <p>
          Built with{' '}
          <a href="https://github.com/kirakita/text-shape" target="_blank" rel="noopener noreferrer">
            @kirakita/text-shape
          </a>
        </p>
      </footer>
    </div>
  );
}
