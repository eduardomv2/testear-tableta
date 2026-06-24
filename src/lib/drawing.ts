import type { Point } from './pointer';

export type Tool = 'pencil' | 'brush' | 'eraser';

export interface StrokeOptions {
  color: string;
  baseWidth: number;
  tool: Tool;
}

/**
 * Draw a pressure-sensitive stroke through an array of points.
 *
 * - Ink mode: full opacity, width varies with pressure
 * - Watercolor mode: lower opacity (0.3–0.6), wider strokes, softer edges
 * - Eraser: uses destination-out composite to erase
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  options: StrokeOptions
): void {
  if (points.length < 2) return;

  const { color, baseWidth, tool } = options;

  ctx.save();

  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const pressure = Math.max(curr.pressure, 0.1);

      ctx.lineWidth = baseWidth * pressure * 2;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);

      if (i < points.length - 1) {
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      } else {
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Brush / pencil drawing
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const pressure = Math.max(curr.pressure, 0.05);

    // Calculate tilt magnitude (0 to 1)
    const tiltMag = Math.sqrt(curr.tiltX * curr.tiltX + curr.tiltY * curr.tiltY) / 90;
    
    // Tilt makes the stroke wider and softer (shading effect)
    const width = baseWidth * pressure + (baseWidth * tiltMag * 4);
    const opacity = Math.max(0.1, 1 - (tiltMag * 0.8));

    ctx.lineWidth = width;
    ctx.strokeStyle = hexToRgba(color, opacity);

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);

    if (i < points.length - 1) {
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    } else {
      ctx.lineTo(curr.x, curr.y);
    }

    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Convert a hex color string to an rgba() string with the given alpha.
 * Supports #RGB, #RRGGBB, and #RRGGBBAA formats.
 */
function hexToRgba(hex: string, alpha: number): string {
  let r = 0,
    g = 0,
    b = 0;

  const clean = hex.replace('#', '');

  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
