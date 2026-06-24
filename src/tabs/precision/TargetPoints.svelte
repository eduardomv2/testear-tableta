<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';
  import { setupCanvas, clearCanvas, drawCircle, drawLine } from '../../lib/canvas';
  import { getPointFromEvent } from '../../lib/pointer';
  import { calcDistance } from '../../lib/metrics';
  import { onMount, onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  const ROUNDS = [
    { label: 'Grande', radius: 28, count: 7 },
    { label: 'Mediano', radius: 16, count: 7 },
    { label: 'Pequeño', radius: 8, count: 7 },
  ];
  let totalTargets = ROUNDS.reduce((s, r) => s + r.count, 0);

  let isRunning = $state(false);
  let isDone = $state(false);
  let currentTargetIndex = $state(0);

  let targetX = $state(0);
  let targetY = $state(0);
  let targetRadius = $state(28);
  let roundLabel = $state('');

  let deviations = $state<number[]>([]);
  let hits = $state(0); // within radius
  let pulseAnim = $state(false);

  // Timer
  let startTime = 0;
  let elapsed = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  let avgDeviation = $derived(
    deviations.length ? (deviations.reduce((a, b) => a + b, 0) / deviations.length).toFixed(1) : '–'
  );
  let maxDeviation = $derived(deviations.length ? Math.max(...deviations).toFixed(1) : '–');
  let accuracy = $derived(
    currentTargetIndex > 0 ? Math.round((hits / currentTargetIndex) * 100) : 0
  );
  let elapsedStr = $derived(
    `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`
  );

  onMount(() => {
    ctx = setupCanvas(canvas);
    drawIdle();
  });

  onDestroy(() => stopTimer());

  function startTimer() {
    startTime = Date.now();
    elapsed = 0;
    timerInterval = setInterval(() => {
      elapsed = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function getRound(index: number) {
    let count = 0;
    for (const round of ROUNDS) {
      count += round.count;
      if (index < count) return round;
    }
    return ROUNDS[ROUNDS.length - 1];
  }

  function drawIdle() {
    if (!ctx || !canvas) return;
    clearCanvas(ctx, canvas);
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.font = '1rem Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(locale.t.activities.targetPoints.pressToStart, cx, cy);
  }

  function startTest() {
    isRunning = true;
    isDone = false;
    currentTargetIndex = 0;
    deviations = [];
    hits = 0;
    startTimer();
    placeTarget(0);
  }

  function placeTarget(index: number) {
    if (!ctx || !canvas) return;
    clearCanvas(ctx, canvas);

    const round = getRound(index);
    targetRadius = round.radius;
    roundLabel = round.label;

    const rect = canvas.getBoundingClientRect();
    const margin = targetRadius + 30;
    targetX = margin + Math.random() * (rect.width - margin * 2);
    targetY = margin + Math.random() * (rect.height - margin * 2);

    // Progress track
    const prog = index / totalTargets;
    ctx.fillStyle = 'rgba(0,212,255,0.15)';
    ctx.fillRect(0, 0, rect.width * prog, 4);

    // Outer ring (pulse will animate in CSS)
    drawCircle(ctx, targetX, targetY, targetRadius + 10, 'rgba(0,212,255,0.2)', true);
    // Main target
    drawCircle(ctx, targetX, targetY, targetRadius, '#00d4ff', true);
    // Crosshair
    const ch = targetRadius * 0.6;
    drawLine(ctx, targetX - ch, targetY, targetX + ch, targetY, '#fff', 1.5);
    drawLine(ctx, targetX, targetY - ch, targetX, targetY + ch, '#fff', 1.5);

    // Round indicator
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '0.75rem Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${index + 1} / ${totalTargets}  •  ${round.label}`, 12, 12);

    pulseAnim = true;
    setTimeout(() => pulseAnim = false, 50);
  }

  function showFeedback(hitX: number, hitY: number, dist: number, wasHit: boolean) {
    if (!ctx) return;
    // Show dot where user tapped
    drawCircle(ctx, hitX, hitY, 5, wasHit ? '#4ceb9a' : '#ff5c6c', true);
    if (!wasHit) {
      drawLine(ctx, targetX, targetY, hitX, hitY, '#ff5c6c80', 1.5);
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (!isRunning || !ctx) return;
    const pt = getPointFromEvent(e, canvas);
    const dist = calcDistance(targetX, targetY, pt.x, pt.y);
    const wasHit = dist <= targetRadius;

    deviations = [...deviations, dist];
    if (wasHit) hits++;

    showFeedback(pt.x, pt.y, dist, wasHit);
    currentTargetIndex++;

    if (currentTargetIndex >= totalTargets) {
      stopTimer();
      isRunning = false;
      isDone = true;
      // Show done message
      setTimeout(() => {
        if (!ctx || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 1.5rem Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(locale.t.activities.targetPoints.testCompleted, rect.width / 2, rect.height / 2 - 20);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '1rem Inter, sans-serif';
        const accTime = locale.t.activities.targetPoints.accuracyTime
          .replace('{accuracy}', accuracy.toString())
          .replace('{time}', elapsedStr);
        ctx.fillText(accTime, rect.width / 2, rect.height / 2 + 20);
      }, 300);
    } else {
      setTimeout(() => placeTarget(currentTargetIndex), 350);
    }
  }

  function reset() {
    isRunning = false;
    isDone = false;
    currentTargetIndex = 0;
    deviations = [];
    hits = 0;
    elapsed = 0;
    stopTimer();
    drawIdle();
  }

  let metrics = $derived([
    { label: locale.t.activities.guidedExercises.accuracy, value: accuracy, unit: '%', color: accuracy >= 80 ? 'var(--success)' : accuracy >= 60 ? 'var(--warning)' : accuracy > 0 ? 'var(--error)' : undefined },
    { label: locale.t.activities.targetPoints.avgDeviation, value: avgDeviation, unit: 'px' },
    { label: locale.t.activities.targetPoints.maxDeviation, value: maxDeviation, unit: 'px' },
    { label: locale.t.metrics.ms.replace('ms', 'Time'), value: elapsedStr },
    { label: locale.t.activities.targetPoints.pointsHit.split(' ')[0], value: `${currentTargetIndex}/${totalTargets}` },
  ]);
</script>

<div class="target-points flex-col">
  <div class="toolbar">
    <div class="info-row">
      {#if isRunning}
        <span class="round-badge">{roundLabel}</span>
        <span class="progress-text">{currentTargetIndex} / {totalTargets}</span>
      {:else if isDone}
        <span class="done-text">{locale.t.activities.targetPoints.completedAccuracy.replace('{accuracy}', accuracy.toString())}</span>
      {:else}
        <span class="status-text">{locale.t.activities.targetPoints.statusInfo.replace('{total}', totalTargets.toString()).replace('{rounds}', ROUNDS.length.toString())}</span>
      {/if}
    </div>
    <div style="display:flex; gap: var(--space-sm); align-items: center;">
      {#if isRunning || isDone}
        <span class="timer-display" class:running={isRunning}>{elapsedStr}</span>
      {/if}
      <button class="btn btn-primary" onclick={isRunning || isDone ? reset : startTest}>
        {isRunning || isDone ? locale.t.common.reset : locale.t.common.start}
      </button>
    </div>
  </div>

  <div class="canvas-container" class:is-running={isRunning}>
    <canvas
      bind:this={canvas}
      onpointerdown={handlePointerDown}
      style="touch-action: none; width: 100%; height: 100%; cursor: crosshair;"
    ></canvas>
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .target-points {
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
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }
  .status-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .done-text {
    font-size: 0.875rem;
    color: var(--success);
    font-weight: 600;
  }
  .round-badge {
    padding: 2px 10px;
    background: var(--accent-dim);
    color: var(--accent);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .progress-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .timer-display {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-secondary);
    min-width: 50px;
    transition: color 0.3s;
  }
  .timer-display.running {
    color: var(--accent);
  }
  .canvas-container {
    flex: 1;
    min-height: 0;
    position: relative;
  }
  .is-running {
    border-color: var(--accent-dim);
    box-shadow: 0 0 0 2px var(--accent-dim);
  }
</style>
