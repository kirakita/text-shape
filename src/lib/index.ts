// Core
export { TextShape } from './TextShape';

// React Hook
export { useTextShape } from './useTextShape';

// Shapes
export { getAllShapes, getShape, getShapeIds, shapeRegistry } from './shapes/registry';
export * from './shapes/transforms';

// Types
export type {
  ShapeType,
  ShapeDefinition,
  TextShapeOptions,
  TransformFunction,
  TransformOptions,
  Point,
  BoundingBox,
  CharacterInfo,
} from '../types';
