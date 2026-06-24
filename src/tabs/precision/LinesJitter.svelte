<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas, drawLine } from '../../lib/canvas';
  import { getCoalescedPoints, type Point } from '../../lib/pointer';
  import { drawStroke } from '../../lib/drawing';
  import { calcJitter } from '../../lib/metrics';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  let mode = $state('horizontal');
  let isDrawing = $state(false);
  let currentPoints = [] as Point[];
  let idealPoints = [] as {x: number, y: number}[];
  
  let jitter = $state(0);

  onMount(() => {
    ctx = setupCanvas(canvas);
    drawGuide();
  });

  function drawGuide() {
    if (!ctx) return;
    clearCanvas(ctx, canvas);
    idealPoints = [];
    const rect = canvas.getBoundingClientRect();
    
    ctx.setLineDash([5, 5]);
    if (mode === 'horizontal') {
      const y = rect.height / 2;
      drawLine(ctx, 50, y, rect.width - 50, y, '#555570', 2);
      for(let x=50; x<=rect.width-50; x+=10) idealPoints.push({x, y});
    } else if (mode === 'vertical') {
      const x = rect.width / 2;
      drawLine(ctx, x, 50, x, rect.height - 50, '#555570', 2);
      for(let y=50; y<=rect.height-50; y+=10) idealPoints.push({x, y});
    } else if (mode === 'diagonal') {
      drawLine(ctx, 50, 50, rect.width - 50, rect.height - 50, '#555570', 2);
      const steps = 100;
      for(let i=0; i<=steps; i++) {
        idealPoints.push({
          x: 50 + (rect.width - 100) * (i/steps),
          y: 50 + (rect.height - 100) * (i/steps)
        });
      }
    }
    ctx.setLineDash([]);
  }

  $effect(() => {
    mode;
    drawGuide();
    jitter = 0;
  });

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    currentPoints = getCoalescedPoints(e, canvas);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx) return;
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [currentPoints[currentPoints.length - 1] || newPoints[0], ...newPoints];
    
    drawStroke(ctx, pointsToDraw, { color: '#00d4ff', baseWidth: 2, tool: 'pencil' });
    currentPoints.push(...newPoints);
    
    if (currentPoints.length > 5) {
      jitter = calcJitter(currentPoints, idealPoints);
    }
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentPoints = [];
  }

  let metrics = $derived([
    { label: locale.t.activities.linesJitter.jitter, value: jitter.toFixed(2), unit: 'px' },
    { label: locale.t.activities.linesJitter.smoothness, value: Math.max(0, 100 - jitter * 5).toFixed(0), unit: '%' }
  ]);
</script>

<div class="lines-jitter flex-col">
  <div class="toolbar">
    <div class="tool-group">
      <button class="btn {mode === 'horizontal' ? 'btn-primary' : 'btn-ghost'}" onclick={() => mode = 'horizontal'}>{locale.t.activities.linesJitter.horizontal}</button>
      <button class="btn {mode === 'vertical' ? 'btn-primary' : 'btn-ghost'}" onclick={() => mode = 'vertical'}>{locale.t.activities.linesJitter.vertical}</button>
      <button class="btn {mode === 'diagonal' ? 'btn-primary' : 'btn-ghost'}" onclick={() => mode = 'diagonal'}>{locale.t.activities.linesJitter.diagonal}</button>
    </div>
    <button class="btn btn-ghost" onclick={() => { drawGuide(); jitter = 0; }}>{locale.t.common.clear}</button>
  </div>

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
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .lines-jitter {
    gap: var(--space-md);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .canvas-container {
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
  }
  .tool-group {
    display: flex;
    gap: var(--space-sm);
  }
</style>
