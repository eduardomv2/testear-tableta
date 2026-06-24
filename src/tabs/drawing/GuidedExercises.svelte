<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas, drawCircle } from '../../lib/canvas';
  import { getCoalescedPoints, type Point } from '../../lib/pointer';
  import { drawStroke } from '../../lib/drawing';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  let currentExercise = $state('circles');
  let isDrawing = $state(false);
  let currentPoints = [] as Point[];
  let allDrawnPoints = [] as Point[];

  // Spatial grid for fast nearest-point lookups
  let gridCellSize = 10;
  let idealGrid = new Map<string, {x: number, y: number}[]>();
  let idealCount = $state(0);
  let coveredCells = new Set<string>();

  // Real-time metrics
  let accuracySum = 0;
  let accuracyCount = 0;
  let score = $state(0);
  let accuracy = $state(0);
  let coverage = $state(0);

  // Alphabet pagination
  let alphabetPage = $state(0);
  const alphabetPages = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y', 'Z'],
  ];

  onMount(() => {
    ctx = setupCanvas(canvas);
    drawGuides();
  });

  function gridKey(x: number, y: number): string {
    return `${Math.floor(x / gridCellSize)},${Math.floor(y / gridCellSize)}`;
  }

  function buildGrid(points: {x: number, y: number}[]) {
    idealGrid = new Map();
    coveredCells = new Set();
    for (const pt of points) {
      const key = gridKey(pt.x, pt.y);
      if (!idealGrid.has(key)) idealGrid.set(key, []);
      idealGrid.get(key)!.push(pt);
    }
    idealCount = idealGrid.size;
  }

  function nearestDist(x: number, y: number): number {
    const cx = Math.floor(x / gridCellSize);
    const cy = Math.floor(y / gridCellSize);
    let minDistSq = Infinity;
    // Search 3x3 neighborhood
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const pts = idealGrid.get(key);
        if (!pts) continue;
        for (const pt of pts) {
          const ddx = pt.x - x;
          const ddy = pt.y - y;
          const dSq = ddx * ddx + ddy * ddy;
          if (dSq < minDistSq) minDistSq = dSq;
        }
      }
    }
    return Math.sqrt(minDistSq);
  }

  function markCovered(x: number, y: number) {
    const cx = Math.floor(x / gridCellSize);
    const cy = Math.floor(y / gridCellSize);
    const coverRadius = 1;
    for (let dx = -coverRadius; dx <= coverRadius; dx++) {
      for (let dy = -coverRadius; dy <= coverRadius; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        if (idealGrid.has(key)) {
          coveredCells.add(key);
        }
      }
    }
  }

  function updateScore() {
    if (idealCount === 0 || accuracyCount === 0) { score = 0; return; }
    const avgDist = accuracySum / accuracyCount;
    // Accuracy: 0px distance = 100%, 30px+ = 0%
    accuracy = Math.max(0, Math.min(100, 100 - (avgDist * 3.3)));
    // Coverage: what % of the guide cells were drawn near
    coverage = (coveredCells.size / idealCount) * 100;
    // Combined score
    score = Math.floor(accuracy * 0.4 + coverage * 0.6);
  }

  function addIdealPoints(points: {x: number, y: number}[]) {
    buildGrid(points);
  }

  function drawGuides() {
    if (!ctx || !canvas) return;
    clearCanvas(ctx, canvas);
    const tempIdeal: {x: number, y: number}[] = [];

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    ctx.save();
    ctx.setLineDash([5, 5]);

    if (currentExercise === 'circles') {
      const circles = [
        {cx: centerX - 200, cy: centerY, r: 50},
        {cx: centerX, cy: centerY, r: 80},
        {cx: centerX + 200, cy: centerY, r: 40},
      ];
      for (const c of circles) {
        drawCircle(ctx, c.cx, c.cy, c.r, '#555570', false);
        for (let a = 0; a < Math.PI * 2; a += 0.05) {
          tempIdeal.push({x: c.cx + Math.cos(a) * c.r, y: c.cy + Math.sin(a) * c.r});
        }
      }
    } else if (currentExercise === 'spirals') {
      ctx.beginPath();
      ctx.strokeStyle = '#555570';
      ctx.lineWidth = 2;
      for (let i = 0; i < 500; i++) {
        const angle = 0.08 * i;
        const x = centerX + (1 + angle) * Math.cos(angle) * 5;
        const y = centerY + (1 + angle) * Math.sin(angle) * 5;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        tempIdeal.push({x, y});
      }
      ctx.stroke();
    } else if (currentExercise === 'zigzag') {
      ctx.beginPath();
      ctx.strokeStyle = '#555570';
      ctx.lineWidth = 2;
      const zigPoints: {x: number, y: number}[] = [];
      for (let i = 0; i < 12; i++) {
        const x = centerX - 330 + i * 60;
        const y = i % 2 === 0 ? centerY - 100 : centerY + 100;
        zigPoints.push({x, y});
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Interpolate between zigzag vertices for dense ideal points
      for (let i = 0; i < zigPoints.length - 1; i++) {
        const a = zigPoints[i];
        const b = zigPoints[i + 1];
        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          tempIdeal.push({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
        }
      }
    } else if (currentExercise === 'alphabet') {
      const letters = alphabetPages[alphabetPage];
      ctx.setLineDash([]);
      ctx.font = '100px "Inter", sans-serif';
      ctx.fillStyle = '#3a3a50';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const spacing = rect.width / (letters.length + 1);
      for (let i = 0; i < letters.length; i++) {
        ctx.fillText(letters[i], spacing * (i + 1), centerY);
      }

      // Extract letter pixels as ideal points
      try {
        const dpr = canvas.width / rect.width;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let py = 0; py < canvas.height; py += 3) {
          for (let px = 0; px < canvas.width; px += 3) {
            const idx = (py * canvas.width + px) * 4;
            if (imgData[idx + 3] > 30) {
              tempIdeal.push({x: px / dpr, y: py / dpr});
            }
          }
        }
      } catch (e) {
        // Fallback: create simple rectangular regions per letter
        const spacing2 = rect.width / (letters.length + 1);
        for (let i = 0; i < letters.length; i++) {
          const lx = spacing2 * (i + 1);
          for (let dy = -40; dy <= 40; dy += 5) {
            for (let dx = -30; dx <= 30; dx += 5) {
              tempIdeal.push({x: lx + dx, y: centerY + dy});
            }
          }
        }
      }
    }

    ctx.restore();
    addIdealPoints(tempIdeal);
  }

  $effect(() => {
    // Re-trigger on exercise or alphabet page change
    currentExercise;
    alphabetPage;
    resetState();
    drawGuides();
  });

  function resetState() {
    score = 0;
    accuracy = 0;
    coverage = 0;
    accuracySum = 0;
    accuracyCount = 0;
    allDrawnPoints = [];
    coveredCells = new Set();
  }

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    currentPoints = getCoalescedPoints(e, canvas);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx) return;
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [currentPoints[currentPoints.length - 1] || newPoints[0], ...newPoints];

    drawStroke(ctx, pointsToDraw, { color: '#00d4ff', baseWidth: 3, tool: 'pencil' });

    for (const pt of newPoints) {
      const dist = nearestDist(pt.x, pt.y);
      if (dist < Infinity) {
        accuracySum += dist;
        accuracyCount++;
      }
      markCovered(pt.x, pt.y);
    }

    currentPoints = newPoints;
    allDrawnPoints.push(...newPoints);
    updateScore();
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentPoints = [];
    updateScore();
  }

  function handleReset() {
    resetState();
    drawGuides();
  }

  let scoreColor = $derived(
    score >= 80 ? 'var(--success)' :
    score >= 50 ? 'var(--warning)' :
    score > 0 ? 'var(--error)' : undefined
  );

  let metrics = $derived([
    { label: locale.t.activities.guidedExercises.score, value: score, unit: '%', color: scoreColor },
    { label: locale.t.activities.guidedExercises.accuracy, value: accuracy.toFixed(0), unit: '%' },
    { label: 'Cobertura', value: coverage.toFixed(0), unit: '%' }
  ]);
</script>

<div class="guided-exercises flex-col">
  <div class="toolbar">
    <div class="tool-group">
      <button class="btn {currentExercise === 'circles' ? 'btn-primary' : 'btn-ghost'}" onclick={() => currentExercise = 'circles'}>{locale.t.activities.guidedExercises.exercises.circles.name}</button>
      <button class="btn {currentExercise === 'spirals' ? 'btn-primary' : 'btn-ghost'}" onclick={() => currentExercise = 'spirals'}>{locale.t.activities.guidedExercises.exercises.spirals.name}</button>
      <button class="btn {currentExercise === 'zigzag' ? 'btn-primary' : 'btn-ghost'}" onclick={() => currentExercise = 'zigzag'}>{locale.t.activities.guidedExercises.exercises.zigzag.name}</button>
      <button class="btn {currentExercise === 'alphabet' ? 'btn-primary' : 'btn-ghost'}" onclick={() => currentExercise = 'alphabet'}>Abecedario</button>
    </div>
    <button class="btn btn-danger" onclick={handleReset}>{locale.t.common.reset}</button>
  </div>

  {#if currentExercise === 'alphabet'}
    <div class="alphabet-nav">
      {#each alphabetPages as page, i}
        <button
          class="btn btn-sm {alphabetPage === i ? 'btn-primary' : 'btn-ghost'}"
          onclick={() => alphabetPage = i}
        >
          {page[0]}-{page[page.length - 1]}
        </button>
      {/each}
    </div>
  {/if}

  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onpointerout={handlePointerUp}
      style="touch-action: none; width: 100%; height: 100%;"
    ></canvas>

    <div class="live-score" class:good={score >= 80} class:ok={score >= 50 && score < 80} class:low={score > 0 && score < 50}>
      {score}%
    </div>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .guided-exercises {
    gap: var(--space-md);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .toolbar {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .tool-group {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
  }
  .alphabet-nav {
    display: flex;
    gap: var(--space-xs);
    justify-content: center;
  }
  .canvas-container {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .live-score {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    font-size: 2rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
    pointer-events: none;
    transition: color 0.3s ease;
  }
  .live-score.good { color: var(--success); }
  .live-score.ok { color: var(--warning); }
  .live-score.low { color: var(--error); }
</style>
