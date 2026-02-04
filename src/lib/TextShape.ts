import { Group, FabricText, classRegistry, type TOptions, type GroupProps } from 'fabric';
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
  private _baseWidth: number = 0;
  private _baseHeight: number = 0;

  static type = 'TextShape';

  constructor(options: TextShapeOptions) {
    const opts = { ...defaultOptions, ...options };
    
    // Create the character objects first
    const { characters, baseWidth, baseHeight } = TextShape._createCharacters(
      opts.text,
      opts.fontSize || 48,
      opts.fontFamily || 'Arial',
      opts.fill || '#000000'
    );

    // Initialize Group with characters
    super(characters, {
      left: opts.left,
      top: opts.top,
    } as TOptions<GroupProps>);

    this._text = opts.text;
    this._shape = opts.shape || 'none';
    this._intensity = opts.intensity || 50;
    this._fontSize = opts.fontSize || 48;
    this._fontFamily = opts.fontFamily || 'Arial';
    this._textFill = opts.fill || '#000000';
    this._baseWidth = baseWidth;
    this._baseHeight = baseHeight;

    // Apply initial transformation
    this._applyTransform();
  }

  /**
   * Create character objects for the text
   */
  private static _createCharacters(
    text: string,
    fontSize: number,
    fontFamily: string,
    fill: string
  ): { characters: FabricText[]; baseWidth: number; baseHeight: number } {
    const characters: FabricText[] = [];
    
    if (!text) {
      return { characters, baseWidth: 0, baseHeight: fontSize };
    }

    // First pass: measure all characters
    let totalWidth = 0;
    const spaceWidth = fontSize * 0.3;
    const charData: { char: string; width: number; x: number }[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === ' ') {
        charData.push({ char, width: spaceWidth, x: totalWidth });
        totalWidth += spaceWidth;
        continue;
      }

      // Create temp text to measure
      const tempText = new FabricText(char, {
        fontSize,
        fontFamily,
      });
      const charWidth = tempText.width || fontSize * 0.6;
      charData.push({ char, width: charWidth, x: totalWidth });
      totalWidth += charWidth;
    }

    // Second pass: create positioned characters
    // Position relative to center of total text
    const offsetX = totalWidth / 2;

    for (const data of charData) {
      if (data.char === ' ') continue;

      const charText = new FabricText(data.char, {
        fontSize,
        fontFamily,
        fill,
        originX: 'center',
        originY: 'center',
        left: data.x + data.width / 2 - offsetX,
        top: 0,
        selectable: false,
        evented: false,
      });

      // Store original position for transforms
      (charText as any)._originalX = data.x + data.width / 2;
      (charText as any)._originalY = fontSize / 2;

      characters.push(charText);
    }

    return { characters, baseWidth: totalWidth, baseHeight: fontSize };
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
    this._rebuildText();
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
   * Get character info for debugging
   */
  getCharacterInfo(): CharacterInfo[] {
    return this.getObjects().map((obj, i) => {
      const charText = obj as FabricText;
      return {
        char: this._text[i] || '',
        originalX: (charText as any)._originalX || 0,
        originalY: (charText as any)._originalY || 0,
        transformedX: charText.left || 0,
        transformedY: charText.top || 0,
        rotation: charText.angle || 0,
        scale: charText.scaleX || 1,
      };
    });
  }

  /**
   * Rebuild text when content changes
   */
  private _rebuildText(): void {
    // Remove all existing objects
    this.removeAll();

    const { characters, baseWidth, baseHeight } = TextShape._createCharacters(
      this._text,
      this._fontSize,
      this._fontFamily,
      this._textFill
    );

    this._baseWidth = baseWidth;
    this._baseHeight = baseHeight;

    // Add new characters
    for (const char of characters) {
      this.add(char);
    }

    // Apply transformation
    this._applyTransform();
  }

  /**
   * Apply the current shape transformation
   */
  private _applyTransform(): void {
    const objects = this.getObjects() as FabricText[];
    if (objects.length === 0) return;

    const shapeDef = getShape(this._shape);
    if (!shapeDef) return;

    // Bounds for transformation calculation
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

    // Calculate all transformed positions
    const positions: { x: number; y: number; angle: number }[] = [];

    objects.forEach((charText) => {
      const originalX = (charText as any)._originalX || 0;
      const originalY = (charText as any)._originalY || 0;

      const transformed = shapeDef.transform(
        { x: originalX, y: originalY },
        transformOptions
      );

      // Calculate rotation for curved paths
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

    // Calculate center offset
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Apply positions relative to center
    objects.forEach((charText, idx) => {
      const pos = positions[idx];
      charText.set({
        left: pos.x - centerX,
        top: pos.y - centerY,
        angle: pos.angle,
      });
      charText.setCoords();
    });

    this.setCoords();
    this.dirty = true;
  }

  /**
   * Get serializable data
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
