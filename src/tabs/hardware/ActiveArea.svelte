<script lang="ts">
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas } from '../../lib/canvas';
  import { getCoalescedPoints, type Point } from '../../lib/pointer';
  import { drawStroke } from '../../lib/drawing';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDrawing = $state(false);
  let currentPoints = [] as Point[];

  // Bounding box of drawn strokes
  let minX = $state(Infinity);
  let maxX = $state(-Infinity);
  let minY = $state(Infinity);
  let maxY = $state(-Infinity);
  let hasDrawing = $state(false);

  let detectedW = $derived(maxX > minX ? Math.round(maxX - minX) : 0);
  let detectedH = $derived(maxY > minY ? Math.round(maxY - minY) : 0);
  let drawnRatio = $derived(detectedH > 0 ? (detectedW / detectedH).toFixed(2) : '–');

  // Screen ratio for reference
  let screenRatio = $state('–');

  onMount(() => {
    ctx = setupCanvas(canvas);
    screenRatio = (window.screen.width / window.screen.height).toFixed(2);
    drawHint();
  });

  function drawHint() {
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Draw a perfect circle guide in the center
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1.5;
    const r = Math.min(cx, cy) * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Cross at center
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.stroke();
    ctx.restore();

    // Instruction text
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '0.85rem Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Traza el círculo guía — si sale ovalado, el área de tu tableta no coincide con tu pantalla', cx, cy + r + 28);
  }

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    hasDrawing = true;
    currentPoints = getCoalescedPoints(e, canvas);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDrawing || !ctx) return;
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [currentPoints[currentPoints.length - 1] || newPoints[0], ...newPoints];

    drawStroke(ctx, pointsToDraw, { color: '#00d4ff', baseWidth: 3, tool: 'pencil' });

    for (const pt of newPoints) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    currentPoints = newPoints;
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentPoints = [];
  }

  function reset() {
    if (ctx) clearCanvas(ctx, canvas);
    minX = Infinity; maxX = -Infinity;
    minY = Infinity; maxY = -Infinity;
    hasDrawing = false;
    drawHint();
  }

  // How close drawn ratio is to screen ratio
  let ratioMatch = $derived(() => {
    if (!hasDrawing || drawnRatio === '–' || screenRatio === '–') return null;
    const diff = Math.abs(parseFloat(drawnRatio) - parseFloat(screenRatio));
    if (diff < 0.1) return { label: 'Correcto', color: 'var(--success)' };
    if (diff < 0.3) return { label: 'Leve diferencia', color: 'var(--warning)' };
    return { label: 'Desproporcionado', color: 'var(--error)' };
  });

  let metrics = $derived([
    { label: 'Relación dibujada', value: drawnRatio },
    { label: 'Relación pantalla', value: screenRatio },
    { label: 'Estado', value: ratioMatch()?.label ?? '–', color: ratioMatch()?.color },
  ]);
</script>

<div class="active-area flex-col">
  <div class="toolbar">
    <div class="info">
      <strong>Prueba de proporción</strong>
      <span class="desc">Traza el círculo guía — si en pantalla sale ovalado, el mapeo de tu tableta está desconfigurado</span>
    </div>
    <button class="btn btn-ghost btn-sm" onclick={reset}>Limpiar</button>
  </div>

  <div class="canvas-container">
    <canvas
      bind:this={canvas}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onpointerout={handlePointerUp}
      style="touch-action: none; width: 100%; height: 420px;"
    ></canvas>
  </div>

  {#if hasDrawing}
    <div class="ratio-row">
      <div class="ratio-box">
        <span class="ratio-label">Relación dibujada</span>
        <span class="ratio-value">{drawnRatio}:1</span>
      </div>
      <div class="ratio-divider">vs</div>
      <div class="ratio-box">
        <span class="ratio-label">Relación pantalla</span>
        <span class="ratio-value">{screenRatio}:1</span>
      </div>
      {#if ratioMatch()}
        <div class="ratio-box">
          <span class="ratio-label">Diagnóstico</span>
          <span class="ratio-value" style="color: {ratioMatch()!.color}; font-size: 1rem">{ratioMatch()!.label}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .active-area { display: flex; flex-direction: column; gap: var(--space-md); }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .info { display: flex; flex-direction: column; gap: 2px; }
  .info strong { font-size: 0.875rem; color: var(--text-primary); }
  .desc { font-size: 0.8rem; color: var(--text-secondary); max-width: 55ch; }

  .ratio-row {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
  }
  .ratio-box { display: flex; flex-direction: column; gap: 2px; }
  .ratio-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .ratio-value { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; }
  .ratio-divider { font-size: 0.8rem; color: var(--text-muted); padding: 0 var(--space-sm); }
</style>
