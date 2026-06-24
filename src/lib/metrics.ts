/**
 * Calculate Euclidean distance between two points.
 */
export function calcDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the arithmetic mean of an array of numbers.
 * Returns 0 for empty arrays.
 */
export function calcAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate jitter as Root Mean Square (RMS) deviation between
 * actual points and ideal (expected) points.
 */
export function calcJitter(
  actual: { x: number; y: number }[],
  ideal: { x: number; y: number }[]
): number {
  if (actual.length === 0 || ideal.length === 0) return 0;

  let sumSquared = 0;
  for (let i = 0; i < actual.length; i++) {
    const act = actual[i];
    let minSq = Infinity;
    for (let j = 0; j < ideal.length; j++) {
      const idl = ideal[j];
      const dx = act.x - idl.x;
      const dy = act.y - idl.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minSq) minSq = distSq;
    }
    sumSquared += minSq;
  }

  return Math.sqrt(sumSquared / actual.length);
}

/**
 * Estimate the report rate (events per second) from an array of timestamps.
 * Timestamps should be in milliseconds (e.g., from performance.now() or event.timeStamp).
 */
export function estimateReportRate(timestamps: number[]): number {
  if (timestamps.length < 2) return 0;

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const interval = timestamps[i] - timestamps[i - 1];
    if (interval > 0) {
      intervals.push(interval);
    }
  }

  if (intervals.length === 0) return 0;

  const avgInterval = calcAverage(intervals);
  // Convert average interval (ms) to frequency (Hz)
  return avgInterval > 0 ? 1000 / avgInterval : 0;
}

/**
 * Estimate the number of distinct pressure levels from an array of pressure values.
 * Counts unique values after quantization to avoid floating-point noise.
 */
export function estimatePressureLevels(values: number[]): number {
  if (values.length === 0) return 0;

  // Quantize to reduce floating-point noise (4096 levels = common high-end tablet)
  const quantizationFactor = 8192;
  const uniqueLevels = new Set(
    values.map((v) => Math.round(v * quantizationFactor))
  );

  // Remove zero (no-pressure) from the count if present
  uniqueLevels.delete(0);

  return uniqueLevels.size;
}

/**
 * Format a millisecond value as a readable string with one decimal place.
 */
export function formatMs(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

/**
 * Clamp a value between a minimum and maximum.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Evaluate the precision of a drawing exercise.
 * Returns a score from 0 to 100 based on accuracy and coverage.
 */
export function evaluateExercise(
  actual: { x: number; y: number }[],
  ideal: { x: number; y: number }[]
): number {
  if (actual.length === 0 || ideal.length === 0) return 0;

  // 1. Accuracy: How close are the drawn points to the ideal guides?
  let sumSq = 0;
  for (let i = 0; i < actual.length; i++) {
    const act = actual[i];
    let minSq = Infinity;
    for (let j = 0; j < ideal.length; j++) {
      const idl = ideal[j];
      const dx = act.x - idl.x;
      const dy = act.y - idl.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minSq) minSq = distSq;
    }
    sumSq += minSq;
  }
  const avgDist = Math.sqrt(sumSq / actual.length);

  // 2. Coverage: What percentage of the ideal guide was drawn over?
  let covered = 0;
  const coverageRadiusSq = 100; // within 10 pixels is considered covered
  for (let j = 0; j < ideal.length; j++) {
    const idl = ideal[j];
    let isCovered = false;
    for (let i = 0; i < actual.length; i++) {
      const act = actual[i];
      const dx = act.x - idl.x;
      const dy = act.y - idl.y;
      if (dx * dx + dy * dy < coverageRadiusSq) {
        isCovered = true;
        break;
      }
    }
    if (isCovered) covered++;
  }
  const coveragePct = covered / ideal.length;

  // Calculate score components
  // An avg distance of 0 is 100%, avg distance of 20px or more is 0%
  const accuracyScore = Math.max(0, 100 - (avgDist * 5));
  const coverageScore = coveragePct * 100;

  // Final score requires both accuracy and coverage
  return Math.floor((accuracyScore * 0.4) + (coverageScore * 0.6));
}
