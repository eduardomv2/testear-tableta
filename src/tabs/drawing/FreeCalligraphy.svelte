<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas } from '../../lib/canvas';
  import { getCoalescedPoints, type Point, type PointerData, getPointerData } from '../../lib/pointer';
  import { drawStroke, type Tool } from '../../lib/drawing';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  let isDrawing = $state(false);
  let currentTool = $state<Tool>('pencil');
  let currentColor = $state('#A855F7'); // Default to purple
  let currentSize = $state(5);

  let currentPoints = [] as Point[];
  let pointerInfo = $state<PointerData>({
    pressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 'mouse', buttons: 0, width: 0, height: 0, isPen: false
  });
  
  let coordX = $state(0);
  let coordY = $state(0);

  const colors = ['#FFFFFF', '#A855F7', '#4ADE80', '#FBBF24', '#F87171'];
  const sizes = [2, 5, 12];

  onMount(() => {
    ctx = setupCanvas(canvas);
  });

  function handlePointerDown(e: PointerEvent) {
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;
    currentPoints = getCoalescedPoints(e, canvas);
    pointerInfo = getPointerData(e);
    updateCoords(e);
  }

  function handlePointerMove(e: PointerEvent) {
    pointerInfo = getPointerData(e);
    updateCoords(e);
    if (!isDrawing || !ctx) return;
    
    const newPoints = getCoalescedPoints(e, canvas);
    const pointsToDraw = [currentPoints[currentPoints.length - 1] || newPoints[0], ...newPoints];
    
    drawStroke(ctx, pointsToDraw, {
      color: currentColor,
      baseWidth: currentSize,
      tool: currentTool
    });
    
    currentPoints.push(...newPoints);
  }

  function handlePointerUp(e: PointerEvent) {
    canvas.releasePointerCapture(e.pointerId);
    isDrawing = false;
    currentPoints = [];
    pointerInfo = getPointerData(e);
    updateCoords(e);
  }

  function updateCoords(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    coordX = Math.round(e.clientX - rect.left);
    coordY = Math.round(e.clientY - rect.top);
  }

  function handleClear() {
    if (ctx) clearCanvas(ctx, canvas);
  }

  let metrics = $derived([
    { 
      label: 'PRESSURE', 
      value: (pointerInfo.pressure * 100).toFixed(2) + '%',
      progress: pointerInfo.pressure * 100,
      color: '#A855F7'
    },
    { 
      label: 'TILT_X / TILT_Y', 
      value: `${pointerInfo.tiltX.toFixed(1)}° / ${pointerInfo.tiltY.toFixed(1)}°`,
      progress: (Math.abs(pointerInfo.tiltX) / 90) * 100, // Roughly normalized for visualization
      color: '#A855F7'
    },
    { 
      label: 'POLLING RATE', 
      value: '120 HZ', // Hardcoded for now until we add Hz tracking
      progress: 50,
      color: '#A855F7'
    }
  ]);
</script>

<div class="free-calligraphy flex-col">
  
  <div class="canvas-container fade-in">
    <div class="coord-overlay technical-panel">
      COORD: {coordX}, {coordY}
    </div>
    
    <div class="toolbar-overlay technical-panel">
      <div class="toolbar-group">
        {#each sizes as size}
          <button 
            class="tool-btn {currentSize === size ? 'active' : ''}"
            onclick={() => currentSize = size}
            aria-label="Size {size}"
          >
            <div class="size-dot" style="width: {size}px; height: {size}px;"></div>
          </button>
        {/each}
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-group">
        {#each colors as color}
          <button 
            class="color-btn {currentColor === color ? 'active' : ''}"
            style="background-color: {color};"
            onclick={() => currentColor = color}
            aria-label="Color {color}"
          ></button>
        {/each}
      </div>

      <div class="toolbar-separator"></div>

      <button class="btn-clear" onclick={handleClear}>[ CLEAR ]</button>
    </div>
    
    {#if !isDrawing}
      <div class="canvas-status">CANVAS_ACTIVE</div>
    {/if}

    <canvas
      bind:this={canvas}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      onpointerout={handlePointerUp}
      style="touch-action: none; width: 100%; height: 100%; position: relative; z-index: 10;"
    ></canvas>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .free-calligraphy {
    gap: var(--space-md);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  
  .coord-overlay {
    position: absolute;
    top: var(--space-md);
    left: var(--space-md);
    padding: var(--space-xs) var(--space-sm);
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.1em;
    z-index: 20;
    pointer-events: none;
  }

  .toolbar-overlay {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    padding: var(--space-xs) var(--space-sm);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    z-index: 20;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(4px);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .toolbar-separator {
    width: 1px;
    height: 16px;
    background: var(--border);
  }

  .tool-btn {
    width: 24px;
    height: 24px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tool-btn:hover {
    background: var(--bg-surface);
  }

  .tool-btn.active {
    border-color: var(--border-hover);
    background: var(--bg-surface);
  }

  .size-dot {
    background-color: var(--text-primary);
    border-radius: 50%;
  }

  .color-btn {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: transform var(--transition-fast);
  }

  .color-btn:hover {
    transform: scale(1.1);
  }

  .color-btn.active {
    transform: scale(1.2);
    border-color: var(--text-primary);
  }

  .btn-clear {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.1em;
    transition: color var(--transition-fast);
  }

  .btn-clear:hover {
    color: var(--error);
  }

  .canvas-status {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: var(--border-hover);
    letter-spacing: 0.2em;
    pointer-events: none;
    z-index: 5;
  }
</style>
