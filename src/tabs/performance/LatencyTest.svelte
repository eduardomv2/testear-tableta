<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas } from '../../lib/canvas';
  import { getCoalescedPoints } from '../../lib/pointer';
  import { drawStroke } from '../../lib/drawing';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let graphCanvas: HTMLCanvasElement;
  let graphCtx: CanvasRenderingContext2D | null = null;

  let isDrawing = $state(false);
  let latencies = $state<number[]>(new Array(100).fill(0));
  let currentLatency = $state(0);
  
  let animationRef: number;
  let lastPoint = { x: 0, y: 0 };

  let avgLatency = $derived(
    latencies.filter(l => l > 0).length 
      ? (latencies.filter(l => l > 0).reduce((a, b) => a + b, 0) / latencies.filter(l => l > 0).length).toFixed(1)
      : '0.0'
  );
  let maxLatency = $derived(
    latencies.filter(l => l > 0).length
      ? Math.max(...latencies.filter(l => l > 0)).toFixed(1)
      : '0.0'
  );

  onMount(() => {
    ctx = setupCanvas(canvas);
    graphCtx = setupCanvas(graphCanvas);
    animationRef = requestAnimationFrame(drawGraph);
    return () => cancelAnimationFrame(animationRef);
  });

  function drawGraph() {
    if (!graphCtx || !graphCanvas) return;
    const rect = graphCanvas.getBoundingClientRect();
    clearCanvas(graphCtx, graphCanvas);
    
    const maxGraphValue = 50; // max 50ms expected
    
    // Draw guide lines
    graphCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    graphCtx.fillStyle = 'rgba(255,255,255,0.3)';
    graphCtx.font = '10px Inter';
    graphCtx.beginPath();
    [10, 20, 30, 40].forEach(ref => {
      const y = rect.height - (ref / maxGraphValue) * rect.height;
      graphCtx.moveTo(0, y); graphCtx.lineTo(rect.width, y);
      graphCtx.fillText(`${ref}ms`, 5, y - 5);
    });
    graphCtx.stroke();

    // Draw graph line
    graphCtx.strokeStyle = '#ffb84d';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    
    const step = rect.width / (latencies.length - 1);
    for (let i = 0; i < latencies.length; i++) {
      const x = i * step;
      let val = latencies[i];
      if (val > maxGraphValue) val = maxGraphValue;
      
      const y = rect.height - (val / maxGraphValue) * rect.height;
      if (i === 0) graphCtx.moveTo(x, Math.max(0, y));
      else graphCtx.lineTo(x, Math.max(0, y));
    }
    graphCtx.stroke();
    
    animationRef = requestAnimationFrame(drawGraph);
  }

  function processEvent(e: PointerEvent) {
    // Modern browsers use DOMHighResTimeStamp for e.timeStamp, same as performance.now()
    // It measures how long ago the OS/hardware dispatched the event
    const now = performance.now();
    let lat = now - e.timeStamp;
    
    // Fallback if browser uses Date.now() for timeStamp
    if (lat < 0 || lat > 100000) {
      lat = 0; 
    }

    currentLatency = lat;
    latencies = [...latencies.slice(1), lat];
  }

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    if (ctx) clearCanvas(ctx, canvas);
    const rect = canvas.getBoundingClientRect();
    lastPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    processEvent(e);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx) return;
    processEvent(e);
    
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [lastPoint, ...newPoints];
    
    // Color line based on latency
    const hue = Math.max(0, 120 - (currentLatency * 3)); // Green -> Yellow -> Red
    drawStroke(ctx, pointsToDraw, { color: `hsl(${hue}, 80%, 60%)`, baseWidth: 4, tool: 'pencil' });
    
    lastPoint = newPoints[newPoints.length - 1];
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentLatency = 0;
    latencies = [...latencies.slice(1), 0];
  }

  function reset() {
    if (ctx) clearCanvas(ctx, canvas);
    latencies = new Array(100).fill(0);
    currentLatency = 0;
  }

  let statusColor = $derived(
    Number(avgLatency) < 15 ? 'var(--success)' : 
    Number(avgLatency) < 30 ? 'var(--warning)' : 
    'var(--error)'
  );

  let metrics = $derived([
    { label: 'Latencia Actual', value: currentLatency.toFixed(1), unit: 'ms', color: currentLatency > 0 ? 'var(--accent)' : undefined },
    { label: 'Latencia Promedio', value: avgLatency, unit: 'ms', color: latencies.some(l=>l>0) ? statusColor : undefined },
    { label: 'Latencia Máxima', value: maxLatency, unit: 'ms' }
  ]);
</script>

<div class="latency-test flex-col">
  <div class="toolbar">
    <div class="info">
      <strong>Test de Latencia de Eventos</strong>
      <span class="desc">Dibuja rápido. Mide el tiempo que tarda el evento desde el hardware hasta el navegador.</span>
    </div>
    <button class="btn btn-ghost btn-sm" onclick={reset}>{locale.t.common.reset}</button>
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
  .latency-test {
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
  .info { display: flex; flex-direction: column; gap: 2px; }
  .info strong { font-size: 0.875rem; color: var(--text-primary); }
  .desc { font-size: 0.75rem; color: var(--text-secondary); }

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
