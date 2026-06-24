export interface Point {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  timestamp: number;
}

export interface PointerData {
  pressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerType: string;
  buttons: number;
  width: number;
  height: number;
  isPen: boolean;
}

/**
 * Extract pointer data from a PointerEvent.
 */
export function getPointerData(e: PointerEvent): PointerData {
  return {
    pressure: e.pressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
    pointerType: e.pointerType,
    buttons: e.buttons,
    width: e.width,
    height: e.height,
    isPen: e.pointerType === 'pen',
  };
}

/**
 * Get a Point from a PointerEvent relative to a canvas element.
 */
export function getPointFromEvent(
  e: PointerEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    pressure: e.pressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
    timestamp: e.timeStamp,
  };
}

/**
 * Get coalesced points from a PointerEvent for smoother strokes.
 * Falls back to a single point if getCoalescedEvents is not supported.
 */
export function getCoalescedPoints(
  e: PointerEvent,
  canvas: HTMLCanvasElement
): Point[] {
  const rect = canvas.getBoundingClientRect();

  if (typeof e.getCoalescedEvents === 'function') {
    const coalescedEvents = e.getCoalescedEvents();
    if (coalescedEvents.length > 0) {
      return coalescedEvents.map((ce) => ({
        x: ce.clientX - rect.left,
        y: ce.clientY - rect.top,
        pressure: ce.pressure,
        tiltX: ce.tiltX,
        tiltY: ce.tiltY,
        twist: ce.twist,
        timestamp: ce.timeStamp,
      }));
    }
  }

  // Fallback: return a single point from the main event
  return [getPointFromEvent(e, canvas)];
}
