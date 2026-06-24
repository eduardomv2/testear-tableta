<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas, drawLine } from '../../lib/canvas';
  import { estimateReportRate } from '../../lib/metrics';
  import { onMount, onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let graphCanvas: HTMLCanvasElement;
  let graphCtx: CanvasRenderingContext2D | null = null;

  let isDrawing = $state(false);
  let timestamps = $state<number[]>([]);
  let currentRate = $state(0);
  
  let rateHistory = $state<number[]>(new Array(100).fill(0));
  
  let animationRef: number;

  let avgRate = $derived(rateHistory.filter(r => r > 0).length ? Math.round(rateHistory.filter(r => r > 0).reduce((a,b)=>a+b,0) / rateHistory.filter(r => r > 0).length) : 0);
  let maxRate = $derived(Math.round(Math.max(...rateHistory)));
  let minRate = $derived(Math.round(Math.min(...rateHistory.filter(r => r > 0)) || 0));

  onMount(() => {
    ctx = setupCanvas(canvas);
    graphCtx = setupCanvas(graphCanvas);
    animationRef = requestAnimationFrame(drawGraph);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(animationRef);
    }
  });

  function drawGraph() {
    if (!graphCtx || !graphCanvas) return;
    const rect = graphCanvas.getBoundingClientRect();
    clearCanvas(graphCtx, graphCanvas);
    
    const maxGraphValue = 350;
    const refs = [133, 200, 266];
    
    graphCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    graphCtx.fillStyle = 'rgba(255,255,255,0.3)';
    graphCtx.font = '10px Inter';
    graphCtx.beginPath();
    
    for (const ref of refs) {
      const y = rect.height - (ref / maxGraphValue) * rect.height;
      graphCtx.moveTo(0, y); graphCtx.lineTo(rect.width, y);
      graphCtx.fillText(`${ref}Hz`, 5, y - 5);
    }
    graphCtx.stroke();

    graphCtx.strokeStyle = '#00d4ff';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    
    const step = rect.width / (rateHistory.length - 1);
    for (let i = 0; i < rateHistory.length; i++) {
      const x = i * step;
      const y = rect.height - (rateHistory[i] / maxGraphValue) * rect.height;
      if (i === 0) graphCtx.moveTo(x, Math.max(0, y));
      else graphCtx.lineTo(x, Math.max(0, y));
    }
    graphCtx.stroke();
    
    animationRef = requestAnimationFrame(drawGraph);
  }

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    timestamps = [e.timeStamp];
    if (ctx) clearCanvas(ctx, canvas);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx) return;
    
    timestamps.push(e.timeStamp);
    
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, 2, 0, Math.PI*2);
    ctx.fill();
    
    if (timestamps.length > 10) {
      currentRate = estimateReportRate(timestamps);
      rateHistory = [...rateHistory.slice(1), currentRate];
      timestamps = timestamps.slice(-10);
    }
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentRate = 0;
    rateHistory = [...rateHistory.slice(1), 0];
  }

  function reset() {
    if (ctx) clearCanvas(ctx, canvas);
    rateHistory = new Array(100).fill(0);
    currentRate = 0;
  }

  let metrics = $derived([
    { label: locale.t.activities.reportRate.current, value: currentRate.toFixed(0), unit: 'Hz', color: currentRate > 0 ? 'var(--accent)' : undefined },
    { label: locale.t.activities.reportRate.avg, value: avgRate, unit: 'Hz' },
    { label: locale.t.activities.reportRate.max, value: maxRate, unit: 'Hz' }
  ]);
</script>

<div class="report-rate flex-col">
  <div class="toolbar">
    <span class="status-text">{locale.t.activities.reportRate.instruction}</span>
    <button class="btn btn-ghost" onclick={reset}>{locale.t.common.reset}</button>
  </div>

  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onpointerout={handlePointerUp}
      style="touch-action: none; width: 100%; height: 100%; cursor: crosshair;"
    ></canvas>
  </div>

  <div class="graph-container">
    <canvas bind:this={graphCanvas} style="width: 100%; height: 100px;"></canvas>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .report-rate {
    gap: var(--space-md);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .canvas-container {
    flex: 1;
    min-height: 0;
  }
  .graph-container {
    height: 100px;
    background: var(--bg-canvas);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
  }
</style>
