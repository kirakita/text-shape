import type { TransformFunction } from '../../types';

/**
 * No transformation - returns point as-is
 */
export const none: TransformFunction = (point) => point;

/**
 * Arc up (smile) - curves text upward
 */
export const arcUp: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const curve = Math.sin(Math.PI * normalizedX);
  const offset = (intensity / 100) * bounds.height * 0.5 * curve;
  
  return {
    x: point.x,
    y: point.y - offset,
  };
};

/**
 * Arc down (frown) - curves text downward
 */
export const arcDown: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const curve = Math.sin(Math.PI * normalizedX);
  const offset = (intensity / 100) * bounds.height * 0.5 * curve;
  
  return {
    x: point.x,
    y: point.y + offset,
  };
};

/**
 * Arch - text arches upward (similar to arc-up but more pronounced at center)
 */
export const arch: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  // Use cosine for arch shape
  const curve = 1 - Math.cos(Math.PI * normalizedX);
  const offset = (intensity / 100) * bounds.height * 0.4 * curve;
  
  return {
    x: point.x,
    y: point.y - offset,
  };
};

/**
 * Bridge - text arches up in the middle, down at edges
 */
export const bridge: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  // Center goes up, edges go down
  const curve = Math.sin(Math.PI * normalizedX * 2 - Math.PI / 2);
  const offset = (intensity / 100) * bounds.height * 0.3 * curve;
  
  return {
    x: point.x,
    y: point.y - offset,
  };
};

/**
 * Valley - text dips down in the middle
 */
export const valley: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const curve = Math.sin(Math.PI * normalizedX);
  const offset = (intensity / 100) * bounds.height * 0.5 * curve;
  
  return {
    x: point.x,
    y: point.y + offset,
  };
};

/**
 * Wave - S-curve wave pattern
 */
export const wave: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const curve = Math.sin(2 * Math.PI * normalizedX);
  const offset = (intensity / 100) * bounds.height * 0.3 * curve;
  
  return {
    x: point.x,
    y: point.y + offset,
  };
};

/**
 * Pinch - text squeezed in the middle
 */
export const pinch: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const centerY = bounds.top + bounds.height / 2;
  
  // Distance from center affects squeeze
  const distFromCenter = Math.abs(normalizedX - 0.5) * 2;
  const squeeze = 1 - (1 - distFromCenter) * (intensity / 100) * 0.5;
  
  // Move point toward center line
  const deltaY = point.y - centerY;
  
  return {
    x: point.x,
    y: centerY + deltaY * squeeze,
  };
};

/**
 * Bulge - text expands in the middle
 */
export const bulge: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const centerY = bounds.top + bounds.height / 2;
  
  // Center expands, edges stay normal
  const expansion = Math.sin(Math.PI * normalizedX);
  const scale = 1 + expansion * (intensity / 100) * 0.5;
  
  const deltaY = point.y - centerY;
  
  return {
    x: point.x,
    y: centerY + deltaY * scale,
  };
};

/**
 * Perspective left - vanishing point on left
 */
export const perspectiveLeft: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const centerY = bounds.top + bounds.height / 2;
  
  // Scale decreases toward left
  const scale = 1 - (1 - normalizedX) * (intensity / 100) * 0.6;
  const deltaY = point.y - centerY;
  
  return {
    x: point.x,
    y: centerY + deltaY * scale,
  };
};

/**
 * Perspective right - vanishing point on right
 */
export const perspectiveRight: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const centerY = bounds.top + bounds.height / 2;
  
  // Scale decreases toward right
  const scale = 1 - normalizedX * (intensity / 100) * 0.6;
  const deltaY = point.y - centerY;
  
  return {
    x: point.x,
    y: centerY + deltaY * scale,
  };
};

/**
 * Slant up - text angles upward left to right
 */
export const slantUp: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const offset = (intensity / 100) * bounds.height * 0.5 * normalizedX;
  
  return {
    x: point.x,
    y: point.y - offset,
  };
};

/**
 * Slant down - text angles downward left to right
 */
export const slantDown: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  const offset = (intensity / 100) * bounds.height * 0.5 * normalizedX;
  
  return {
    x: point.x,
    y: point.y + offset,
  };
};

/**
 * Circle - arrange text in a circle (partial arc)
 */
export const circle: TransformFunction = (point, options) => {
  const { intensity, bounds } = options;
  const normalizedX = (point.x - bounds.left) / bounds.width;
  
  // Map x to angle (0 to π for top arc)
  const angle = Math.PI * (1 - normalizedX);
  const radius = bounds.width / 2 + (intensity / 100) * bounds.height;
  
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height + radius;
  
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY - Math.sin(angle) * radius,
  };
};
