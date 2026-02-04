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

  static type = 'TextShape';

  constructor(options: TextShapeOptions) {
    const opts = { ...defaultOptions, ...options };
    
    super([], {
      left: opts.left,
      top: opts.top,
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
      originalX: 0, // Would need to store original positions
      originalY: 0,
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
    // Remove existing characters
    this._characters.forEach(char => this.remove(char));
    this._characters = [];

    if (!this._text) return;

    let currentX = 0;

    // Create individual character objects
    for (let i = 0; i < this._text.length; i++) {
      const char = this._text[i];
      
      // Skip spaces but account for width
      if (char === ' ') {
        currentX += this._fontSize * 0.3;
        continue;
      }

      const charText = new FabricText(char, {
        fontSize: this._fontSize,
        fontFamily: this._fontFamily,
        fill: this._textFill,
        left: currentX,
        top: 0,
        originX: 'center',
        originY: 'center',
      });

      // Get character width
      const charWidth = charText.width || this._fontSize * 0.6;
      
      // Store original position
      (charText as any)._originalX = currentX + charWidth / 2;
      (charText as any)._originalY = this._fontSize / 2;
      
      charText.left = currentX + charWidth / 2;
      charText.top = this._fontSize / 2;

      this._characters.push(charText);
      this.add(charText);

      currentX += charWidth;
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

    // Calculate bounds
    const bounds = this._calculateBounds();
    
    const transformOptions: TransformOptions = {
      intensity: this._intensity,
      bounds,
      textWidth: bounds.width,
      textHeight: bounds.height,
    };

    // Apply transformation to each character
    this._characters.forEach(charText => {
      const originalX = (charText as any)._originalX || 0;
      const originalY = (charText as any)._originalY || 0;

      const transformed = shapeDef.transform(
        { x: originalX, y: originalY },
        transformOptions
      );

      charText.set({
        left: transformed.x,
        top: transformed.y,
      });

      // Calculate rotation for curved paths
      if (this._shape !== 'none' && this._intensity > 0) {
        const delta = 0.1;
        const nextPoint = shapeDef.transform(
          { x: originalX + delta, y: originalY },
          transformOptions
        );
        
        const angle = Math.atan2(
          nextPoint.y - transformed.y,
          nextPoint.x - transformed.x
        ) * (180 / Math.PI);
        
        charText.set({ angle });
      } else {
        charText.set({ angle: 0 });
      }
    });

    this.setCoords();
    this.dirty = true;
  }

  /**
   * Calculate the bounding box of the text
   */
  private _calculateBounds(): BoundingBox {
    if (this._characters.length === 0) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this._characters.forEach(charText => {
      const x = (charText as any)._originalX || 0;
      const y = (charText as any)._originalY || 0;
      const width = charText.width || 0;
      const height = charText.height || this._fontSize;

      minX = Math.min(minX, x - width / 2);
      maxX = Math.max(maxX, x + width / 2);
      minY = Math.min(minY, y - height / 2);
      maxY = Math.max(maxY, y + height / 2);
    });

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
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
