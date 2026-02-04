import { Group, FabricText, classRegistry } from 'fabric';
import type { ShapeType, TextShapeOptions, TransformOptions, BoundingBox, CharacterInfo } from '../types';
import { getShape } from './shapes/registry';

/**
 * Default options for TextShape
 */
const defaultOptions: Partial<TextShapeOptions> = {
  shape: 'none',
  intensity: 50,
  fontSize: 48,
  fontFamily: 'Arial',
  fill: '#000000',
  left: 0,
  top: 0,
};

/**
 * TextShape - A fabric.js object that renders text with shape transformations
 */
export class TextShape extends Group {
  private _text: string;
  private _shape: ShapeType;
  private _intensity: number;
  private _fontSize: number;
  private _fontFamily: string;
  private _textFill: string;
  private _characters: FabricText[] = [];
  private _baseWidth: number = 0;
  private _baseHeight: number = 0;

  static type = 'TextShape';

  constructor(options: TextShapeOptions) {
    const opts = { ...defaultOptions, ...options };
    
    // Create empty group first
    super([], {
      left: opts.left,
      top: opts.top,
      originX: 'center',
      originY: 'center',
    });

    this._text = opts.text;
    this._shape = opts.shape || 'none';
    this._intensity = opts.intensity || 50;
    this._fontSize = opts.fontSize || 48;
    this._fontFamily = opts.fontFamily || 'Arial';
    this._textFill = opts.fill || '#000000';

    this._renderText();
  }

  /**
   * Get the text content
   */
  get text(): string {
    return this._text;
  }

  /**
   * Set the text content
   */
  set text(value: string) {
    this._text = value;
    this._renderText();
  }

  /**
   * Get the current shape
   */
  get shape(): ShapeType {
    return this._shape;
  }

  /**
   * Set the shape
   */
  set shape(value: ShapeType) {
    this._shape = value;
    this._applyTransform();
  }

  /**
   * Get the intensity
   */
  get intensity(): number {
    return this._intensity;
  }

  /**
   * Set the intensity (0-100)
   */
  set intensity(value: number) {
    this._intensity = Math.max(0, Math.min(100, value));
    this._applyTransform();
  }

  /**
   * Set the shape with method chaining
   */
  setShape(shape: ShapeType): this {
    this.shape = shape;
    return this;
  }

  /**
   * Set the intensity with method chaining
   */
  setIntensity(value: number): this {
    this.intensity = value;
    return this;
  }

  /**
   * Set the text with method chaining
   */
  setText(text: string): this {
    this.text = text;
    return this;
  }

  /**
   * Get character info for debugging/visualization
   */
  getCharacterInfo(): CharacterInfo[] {
    return this._characters.map((char, i) => ({
      char: this._text[i],
      originalX: (char as any)._originalX || 0,
      originalY: (char as any)._originalY || 0,
      transformedX: char.left || 0,
      transformedY: char.top || 0,
      rotation: char.angle || 0,
      scale: char.scaleX || 1,
    }));
  }

  /**
   * Render the text as individual characters
   */
  private _renderText(): void {
    // Clear existing
    this._objects.length = 0;
    this._characters = [];

    if (!this._text) {
      this._baseWidth = 0;
      this._baseHeight = this._fontSize;
      return;
    }

    // First pass: create characters and measure total width
    let totalWidth = 0;
    const spaceWidth = this._fontSize * 0.3;
    const charData: { char: string; charText: FabricText | null; width: number; x: number }[] = [];

    for (let i = 0; i < this._text.length; i++) {
      const char = this._text[i];
      
      if (char === ' ') {
        charData.push({ char, charText: null, width: spaceWidth, x: totalWidth });
        totalWidth += spaceWidth;
        continue;
      }

      const charText = new FabricText(char, {
        fontSize: this._fontSize,
        fontFamily: this._fontFamily,
        fill: this._textFill,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      const charWidth = charText.width || this._fontSize * 0.6;
      charData.push({ char, charText, width: charWidth, x: totalWidth });
      totalWidth += charWidth;
    }

    this._baseWidth = totalWidth;
    this._baseHeight = this._fontSize;

    // Second pass: position characters relative to center (0,0)
    // Group origin is center, so we offset by -totalWidth/2
    const offsetX = totalWidth / 2;
    const offsetY = this._fontSize / 2;

    for (const data of charData) {
      if (!data.charText) continue;

      const centerX = data.x + data.width / 2 - offsetX;
      const centerY = 0; // Centered vertically

      // Store original position for transforms
      (data.charText as any)._originalX = data.x + data.width / 2;
      (data.charText as any)._originalY = offsetY;
      (data.charText as any)._relativeX = centerX;
      (data.charText as any)._relativeY = centerY;

      data.charText.set({
        left: centerX,
        top: centerY,
      });

      this._characters.push(data.charText);
      this._objects.push(data.charText);
    }

    // Apply transformation
    this._applyTransform();
  }

  /**
   * Apply the current shape transformation to all characters
   */
  private _applyTransform(): void {
    if (this._characters.length === 0) return;

    const shapeDef = getShape(this._shape);
    if (!shapeDef) return;

    // Calculate bounds based on original (untransformed) positions
    const bounds: BoundingBox = {
      left: 0,
      top: 0,
      width: this._baseWidth,
      height: this._baseHeight,
    };
    
    const transformOptions: TransformOptions = {
      intensity: this._intensity,
      bounds,
      textWidth: bounds.width,
      textHeight: bounds.height,
    };

    // Track actual bounds after transformation
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    // First pass: calculate all transformed positions
    const positions: { x: number; y: number; angle: number }[] = [];

    this._characters.forEach((charText) => {
      const originalX = (charText as any)._originalX || 0;
      const originalY = (charText as any)._originalY || 0;

      const transformed = shapeDef.transform(
        { x: originalX, y: originalY },
        transformOptions
      );

      // Calculate rotation
      let angle = 0;
      if (this._shape !== 'none' && this._intensity > 0) {
        const delta = 1;
        const nextPoint = shapeDef.transform(
          { x: originalX + delta, y: originalY },
          transformOptions
        );
        angle = Math.atan2(
          nextPoint.y - transformed.y,
          nextPoint.x - transformed.x
        ) * (180 / Math.PI);
      }

      positions.push({ x: transformed.x, y: transformed.y, angle });

      // Track bounds
      const hw = (charText.width || this._fontSize * 0.6) / 2;
      const hh = (charText.height || this._fontSize) / 2;
      minX = Math.min(minX, transformed.x - hw);
      maxX = Math.max(maxX, transformed.x + hw);
      minY = Math.min(minY, transformed.y - hh);
      maxY = Math.max(maxY, transformed.y + hh);
    });

    // Calculate center offset to keep group centered
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Second pass: apply positions relative to calculated center
    this._characters.forEach((charText, idx) => {
      const pos = positions[idx];
      charText.set({
        left: pos.x - centerX,
        top: pos.y - centerY,
        angle: pos.angle,
      });
    });

    // Update group dimensions
    const newWidth = maxX - minX;
    const newHeight = maxY - minY;

    this.set({
      width: newWidth,
      height: newHeight,
    });

    this.setCoords();
    this.dirty = true;
  }

  /**
   * Get custom serializable properties
   */
  getTextShapeData() {
    return {
      text: this._text,
      shape: this._shape,
      intensity: this._intensity,
      fontSize: this._fontSize,
      fontFamily: this._fontFamily,
      textFill: this._textFill,
    };
  }

  /**
   * Create from object
   */
  static fromObject(object: any): Promise<TextShape> {
    return Promise.resolve(
      new TextShape({
        text: object.text,
        shape: object.shape,
        intensity: object.intensity,
        fontSize: object.fontSize,
        fontFamily: object.fontFamily,
        fill: object.textFill,
        left: object.left,
        top: object.top,
      })
    );
  }
}

// Register with fabric
classRegistry.setClass(TextShape);
classRegistry.setSVGClass(TextShape);
