# Text Shape

A fabric.js library for warping text into custom shapes - inspired by CustomInk's text shape feature.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 Warp text into various shapes (arc, wave, bridge, valley, etc.)
- 🔧 Built on fabric.js for easy canvas integration
- 📱 Responsive and touch-friendly
- ⚡ Performant with large text blocks
- 🎯 TypeScript support

## Demo

[Live Demo](https://text-shape.vercel.app) *(coming soon)*

## Installation

```bash
npm install text-shape
# or
yarn add text-shape
# or
pnpm add text-shape
```

## Quick Start

```typescript
import { TextShape } from 'text-shape';
import { Canvas } from 'fabric';

const canvas = new Canvas('my-canvas');

const textShape = new TextShape({
  text: 'Hello World',
  shape: 'arc',
  fontSize: 48,
  fill: '#000000',
});

canvas.add(textShape);
```

## Available Shapes

| Shape | Description |
|-------|-------------|
| `none` | No transformation (default) |
| `arc-up` | Curves upward like a smile |
| `arc-down` | Curves downward like a frown |
| `bridge` | Arches in the middle |
| `valley` | Dips in the middle |
| `wave` | S-curve wave pattern |
| `circle` | Text arranged in a circle |
| `perspective-left` | Vanishing point on left |
| `perspective-right` | Vanishing point on right |

*More shapes documented in [SHAPES.md](./docs/SHAPES.md)*

## API Reference

### TextShape Options

```typescript
interface TextShapeOptions {
  text: string;
  shape: ShapeType;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  intensity?: number; // 0-100, how pronounced the shape effect is
}
```

### Methods

- `setShape(shape: ShapeType)` - Change the shape transformation
- `setIntensity(value: number)` - Adjust the shape intensity
- `getText()` - Get the current text
- `setText(text: string)` - Update the text content

## Development

```bash
# Clone the repo
git clone https://github.com/kirakita/text-shape.git
cd text-shape

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## Tech Stack

- **Framework**: React + TypeScript
- **Canvas**: fabric.js v6
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## License

MIT © [Kirakita](https://github.com/kirakita)

## Acknowledgments

Inspired by [CustomInk](https://www.customink.com)'s text shape feature.
