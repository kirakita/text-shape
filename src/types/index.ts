/**
 * Shape types available for text transformation
 */
export type ShapeType =
  | 'none'
  | 'arc-up'
  | 'arc-down'
  | 'arch'
  | 'bridge'
  | 'valley'
  | 'wave'
  | 'pinch'
  | 'bulge'
  | 'perspective-left'
  | 'perspective-right'
  | 'slant-up'
  | 'slant-down'
  | 'circle';

/**
 * Point coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounding box
 */
export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Options for shape transformation
 */
export interface TransformOptions {
  /** Intensity of the shape effect (0-100) */
  intensity: number;
  /** Bounding box of the text */
  bounds: BoundingBox;
  /** Total width of text */
  textWidth: number;
  /** Total height of text */
  textHeight: number;
}

/**
 * Shape transformation function signature
 */
export type TransformFunction = (point: Point, options: TransformOptions) => Point;

/**
 * Shape definition
 */
export interface ShapeDefinition {
  /** Unique shape identifier */
  id: ShapeType;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Transformation function */
  transform: TransformFunction;
  /** SVG path for preview icon */
  previewPath?: string;
}

/**
 * TextShape configuration options
 */
export interface TextShapeOptions {
  /** Text content */
  text: string;
  /** Shape transformation to apply */
  shape?: ShapeType;
  /** Intensity of shape effect (0-100) */
  intensity?: number;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Fill color */
  fill?: string;
  /** Left position */
  left?: number;
  /** Top position */
  top?: number;
}

/**
 * Character info for rendering
 */
export interface CharacterInfo {
  char: string;
  originalX: number;
  originalY: number;
  transformedX: number;
  transformedY: number;
  rotation: number;
  scale: number;
}
