import type { Point } from './pointer';

/**
 * Set up a canvas for HiDPI (Retina) displays.
 * Returns the 2D rendering context.
 */
export function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.scale(dpr, dpr);

  // Reset canvas CSS size to match the layout
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  return ctx;
}

/**
 * Clear the entire canvas.
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): void {
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}

/**
 * Draw a circle on the canvas.
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  fill: boolean = true
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw a straight line on the canvas.
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number = 1
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/**
 * Draw a smooth line through an array of points using quadratic Bézier curves.
 * Line width varies based on each point's pressure.
 */
export function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  baseWidth: number
): void {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    // Interpolate width based on pressure
    const pressure = Math.max(curr.pressure, 0.05);
    ctx.lineWidth = baseWidth * pressure;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);

    if (i < points.length - 1) {
      // Use midpoint for smooth quadratic curve
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    } else {
      // Last segment: draw directly to the point
      ctx.lineTo(curr.x, curr.y);
    }

    ctx.stroke();
  }
}
