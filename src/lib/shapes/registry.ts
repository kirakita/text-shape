import type { ShapeType, ShapeDefinition } from '../../types';
import * as transforms from './transforms';

/**
 * Registry of all available shape transformations
 */
export const shapeRegistry: Record<ShapeType, ShapeDefinition> = {
  none: {
    id: 'none',
    name: 'Normal',
    description: 'No transformation applied',
    transform: transforms.none,
  },
  'arc-up': {
    id: 'arc-up',
    name: 'Curve Up',
    description: 'Text curves upward like a smile',
    transform: transforms.arcUp,
  },
  'arc-down': {
    id: 'arc-down',
    name: 'Curve Down',
    description: 'Text curves downward like a frown',
    transform: transforms.arcDown,
  },
  arch: {
    id: 'arch',
    name: 'Arch',
    description: 'Text arches upward',
    transform: transforms.arch,
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    description: 'Text forms a bridge shape',
    transform: transforms.bridge,
  },
  valley: {
    id: 'valley',
    name: 'Valley',
    description: 'Text dips down in the middle',
    transform: transforms.valley,
  },
  wave: {
    id: 'wave',
    name: 'Wave',
    description: 'S-curve wave pattern',
    transform: transforms.wave,
  },
  pinch: {
    id: 'pinch',
    name: 'Pinch',
    description: 'Text squeezed in the middle',
    transform: transforms.pinch,
  },
  bulge: {
    id: 'bulge',
    name: 'Bulge',
    description: 'Text expands in the middle',
    transform: transforms.bulge,
  },
  'perspective-left': {
    id: 'perspective-left',
    name: 'Perspective Left',
    description: 'Vanishing point on left',
    transform: transforms.perspectiveLeft,
  },
  'perspective-right': {
    id: 'perspective-right',
    name: 'Perspective Right',
    description: 'Vanishing point on right',
    transform: transforms.perspectiveRight,
  },
  'slant-up': {
    id: 'slant-up',
    name: 'Slant Up',
    description: 'Text angles upward',
    transform: transforms.slantUp,
  },
  'slant-down': {
    id: 'slant-down',
    name: 'Slant Down',
    description: 'Text angles downward',
    transform: transforms.slantDown,
  },
  circle: {
    id: 'circle',
    name: 'Circle',
    description: 'Text arranged in a circular arc',
    transform: transforms.circle,
  },
};

/**
 * Get all available shapes
 */
export function getAllShapes(): ShapeDefinition[] {
  return Object.values(shapeRegistry);
}

/**
 * Get a shape by ID
 */
export function getShape(id: ShapeType): ShapeDefinition | undefined {
  return shapeRegistry[id];
}

/**
 * Get all shape IDs
 */
export function getShapeIds(): ShapeType[] {
  return Object.keys(shapeRegistry) as ShapeType[];
}
