<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas } from '../../lib/canvas';
  import { getCoalescedPoints, type Point, getPointerData } from '../../lib/pointer';
  import { drawStroke } from '../../lib/drawing';
  import { estimatePressureLevels } from '../../lib/metrics';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let oscCanvas: HTMLCanvasElement;
  let oscCtx: CanvasRenderingContext2D | null = null;

  let isDrawing = $state(false);
  let currentPoints = [] as Point[];
  let pressure = $state(0);
  let minPressure = $state(1);
  let maxPressure = $state(0);
  
  let pressureHistory = $state<number[]>(new Array(100).fill(0));
  let pressureValues = $state<number[]>([]); // reactive array for unique level estimation
  let estimatedLevels = $derived(estimatePressureLevels(pressureValues));

  onMount(() => {
    ctx = setupCanvas(canvas);
    oscCtx = setupCanvas(oscCanvas);
    requestAnimationFrame(drawOscilloscope);
  });

  function drawOscilloscope() {
    if (!oscCtx || !oscCanvas) return;
    const rect = oscCanvas.getBoundingClientRect();
    clearCanvas(oscCtx, oscCanvas);
    
    oscCtx.strokeStyle = '#2a2a3e';
    oscCtx.lineWidth = 1;
    oscCtx.beginPath();
    for(let y=0; y<rect.height; y+=rect.height/4) { oscCtx.moveTo(0, y); oscCtx.lineTo(rect.width, y); }
    oscCtx.stroke();

    oscCtx.strokeStyle = '#4ceb9a';
    oscCtx.lineWidth = 2;
    oscCtx.beginPath();
    
    const step = rect.width / (pressureHistory.length - 1);
    for (let i = 0; i < pressureHistory.length; i++) {
      const x = i * step;
      const y = rect.height - (pressureHistory[i] * rect.height);
      if (i === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    
    requestAnimationFrame(drawOscilloscope);
  }

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    currentPoints = getCoalescedPoints(e, canvas);
    updatePressure(e);
  }

  function handlePointerMove(e: PointerEvent) {
    updatePressure(e);
    if (!isDrawing || !ctx) return;
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [currentPoints[currentPoints.length - 1] || newPoints[0], ...newPoints];
    
    drawStroke(ctx, pointsToDraw, { color: '#ffffff', baseWidth: 20, tool: 'pencil' });
    currentPoints.push(...newPoints);
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentPoints = [];
    pressure = 0;
    pressureHistory = [...pressureHistory.slice(1), 0];
  }

  function updatePressure(e: PointerEvent) {
    const data = getPointerData(e);
    pressure = data.pressure;
    if (pressure > 0) {
      if (pressure < minPressure) minPressure = pressure;
      if (pressure > maxPressure) maxPressure = pressure;
      // Reassign array to trigger Svelte reactivity
      pressureValues = [...pressureValues, pressure];
    }
    pressureHistory = [...pressureHistory.slice(1), pressure];
  }

  function clear() {
    if (ctx) clearCanvas(ctx, canvas);
    minPressure = 1;
    maxPressure = 0;
    pressureValues = [];
  }

  let metrics = $derived([
    { label: locale.t.activities.pressure.current, value: (pressure * 100).toFixed(1), unit: '%' },
    { label: locale.t.activities.pressure.min, value: minPressure === 1 ? '0.0' : (minPressure * 100).toFixed(1), unit: '%' },
    { label: locale.t.activities.pressure.max, value: (maxPressure * 100).toFixed(1), unit: '%' },
    { label: locale.t.activities.pressure.levels, value: estimatedLevels }
  ]);
</script>

<div class="pressure-test flex-col">
  <div class="toolbar">
    <span class="status-text">{locale.t.activities.pressure.drawHere}</span>
    <button class="btn btn-ghost" onclick={clear}>{locale.t.common.clear}</button>
  </div>

  <div class="test-layout">
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
    
    <div class="vu-meter-container">
      <div class="vu-meter-label">{locale.t.activities.pressure.vuMeter}</div>
      <div class="vu-meter">
        <!-- Scale marks -->
        <div class="vu-tick" style="bottom: 25%"></div>
        <div class="vu-tick" style="bottom: 50%"></div>
        <div class="vu-tick" style="bottom: 75%"></div>
        
        <div class="vu-meter-fill" style="height: {pressure * 100}%; background: {pressure > 0.85 ? 'var(--error)' : pressure > 0.5 ? 'var(--warning)' : 'var(--success)'}"></div>
      </div>
      <div class="vu-meter-value">{(pressure * 100).toFixed(0)}%</div>
    </div>
  </div>

  <div class="osc-container">
    <canvas bind:this={oscCanvas} style="width: 100%; height: 100px;"></canvas>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .pressure-test {
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
  .test-layout {
    display: flex;
    gap: var(--space-md);
    flex: 1;
    min-height: 0;
  }
  .canvas-container {
    flex: 1;
    min-height: 0;
  }
  .vu-meter-container {
    width: 80px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    padding: var(--space-sm);
    align-items: center;
    gap: var(--space-sm);
  }
  .vu-meter-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
  .vu-meter-value {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }
  .vu-meter {
    flex: 1;
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm);
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  .vu-meter-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    transition: height 50ms linear, background 150ms ease;
    box-shadow: 0 -2px 10px rgba(255,255,255,0.2) inset;
  }
  .vu-tick {
    position: absolute;
    left: 0;
    width: 10px;
    height: 1px;
    background: rgba(255,255,255,0.2);
    z-index: 10;
  }
  .osc-container {
    height: 100px;
    background: var(--bg-canvas);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
  }
</style>
