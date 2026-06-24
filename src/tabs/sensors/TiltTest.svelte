<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { getPointerData, type PointerData } from '../../lib/pointer';
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let histCanvas: HTMLCanvasElement;
  let histCtx: CanvasRenderingContext2D | null = null;

  let pointerInfo = $state<PointerData>({
    pressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 'mouse', buttons: 0, width: 0, height: 0, isPen: false
  });
  
  let supported = $state(false);
  
  let tiltXHistory = $state<number[]>(new Array(100).fill(0));
  let tiltYHistory = $state<number[]>(new Array(100).fill(0));

  onMount(() => {
    ctx = canvas.getContext('2d');
    histCtx = histCanvas.getContext('2d');
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    histCanvas.width = histCanvas.clientWidth * window.devicePixelRatio;
    histCanvas.height = histCanvas.clientHeight * window.devicePixelRatio;
    
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    if (histCtx) histCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    requestAnimationFrame(draw);
  });

  function draw() {
    draw3DPen();
    drawHistory();
    requestAnimationFrame(draw);
  }

  function draw3DPen() {
    if (!ctx || !canvas) return;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.stroke();

    const r = 100;
    const tx = pointerInfo.tiltX * (Math.PI / 180);
    const ty = pointerInfo.tiltY * (Math.PI / 180);
    
    const x = cx + Math.sin(tx) * r;
    const y = cy + Math.sin(ty) * r;

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - Math.sin(tx) * r, cy - Math.sin(ty) * r);
    ctx.stroke();

    ctx.fillStyle = '#ff5c6c';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHistory() {
    if (!histCtx || !histCanvas) return;
    const width = histCanvas.width / window.devicePixelRatio;
    const height = histCanvas.height / window.devicePixelRatio;
    
    histCtx.clearRect(0, 0, width, height);
    
    const cy = height / 2;
    histCtx.strokeStyle = '#2a2a3e';
    histCtx.beginPath();
    histCtx.moveTo(0, cy); histCtx.lineTo(width, cy);
    histCtx.stroke();

    const step = width / (tiltXHistory.length - 1);
    
    histCtx.strokeStyle = '#00d4ff';
    histCtx.lineWidth = 2;
    histCtx.beginPath();
    for(let i=0; i<tiltXHistory.length; i++) {
      const x = i * step;
      const y = cy - (tiltXHistory[i] / 90) * (height/2);
      if (i===0) histCtx.moveTo(x,y); else histCtx.lineTo(x,y);
    }
    histCtx.stroke();

    histCtx.strokeStyle = '#ff5c6c';
    histCtx.beginPath();
    for(let i=0; i<tiltYHistory.length; i++) {
      const x = i * step;
      const y = cy - (tiltYHistory[i] / 90) * (height/2);
      if (i===0) histCtx.moveTo(x,y); else histCtx.lineTo(x,y);
    }
    histCtx.stroke();
  }

  function handlePointerMove(e: PointerEvent) {
    pointerInfo = getPointerData(e);
    if (!supported && (pointerInfo.tiltX !== 0 || pointerInfo.tiltY !== 0)) {
      supported = true;
    }
    tiltXHistory = [...tiltXHistory.slice(1), pointerInfo.tiltX];
    tiltYHistory = [...tiltYHistory.slice(1), pointerInfo.tiltY];
  }

  let metrics = $derived([
    { label: locale.t.activities.tilt.tiltX, value: pointerInfo.tiltX, unit: '°', color: '#00d4ff' },
    { label: locale.t.activities.tilt.tiltY, value: pointerInfo.tiltY, unit: '°', color: '#ff5c6c' },
    { label: locale.t.activities.tilt.twist, value: pointerInfo.twist, unit: '°' },
    { label: locale.t.activities.hover.status, value: supported ? locale.t.activities.tilt.supported : locale.t.activities.tilt.notSupported, color: supported ? 'var(--success)' : 'var(--text-secondary)' }
  ]);
</script>

<div class="tilt-test flex-col">
  <div class="toolbar">
    <span class="status-text">{locale.t.activities.tilt.drawToTest}</span>
  </div>

  <div class="canvas-container" style="flex: 1; min-height: 0;">
    <canvas
      bind:this={canvas}
      onpointermove={handlePointerMove}
      onpointerdown={handlePointerMove}
      style="touch-action: none; width: 100%; height: 100%;"
    ></canvas>
  </div>

  <div class="canvas-container" style="height: 100px;">
    <canvas bind:this={histCanvas} style="width: 100%; height: 100%;"></canvas>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .tilt-test {
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
</style>
