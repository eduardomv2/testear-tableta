<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';

  // Current pressed state
  let pointerType = $state('–');
  let buttonIndex = $state(-1); // e.button at last pointerdown
  let buttonsBitmask = $state(0); // e.buttons during move
  let isContact = $state(false);

  // Counters — indexed by button number (0=tip, 2=barrel1, 4/5=barrel2)
  // We'll track by label to keep it simple
  type ButtonId = 'tip' | 'barrel1' | 'barrel2' | 'eraser';
  let counts = $state<Record<ButtonId, number>>({ tip: 0, barrel1: 0, barrel2: 0, eraser: 0 });
  let active = $state<ButtonId | null>(null);

  function identifyButton(e: PointerEvent): ButtonId {
    // Most reliable: eraser by pointerType
    if (e.pointerType === 'eraser') return 'eraser';
    // Then by e.button at the moment of press
    if (e.button === 0) {
      // Could be tip OR right-click-tip combo — check if barrel btn held
      if (e.buttons & 2) return 'barrel1';
      return 'tip';
    }
    if (e.button === 1) return 'barrel1';
    if (e.button === 2) return 'barrel1';
    if (e.button === 4 || e.button === 3) return 'barrel2';
    if (e.button === 5) return 'eraser';
    return 'tip';
  }

  function handleDown(e: PointerEvent) {
    e.preventDefault();
    isContact = true;
    pointerType = e.pointerType;
    buttonIndex = e.button;
    buttonsBitmask = e.buttons;

    const id = identifyButton(e);
    active = id;
    counts = { ...counts, [id]: counts[id] + 1 };
  }

  function handleMove(e: PointerEvent) {
    buttonsBitmask = e.buttons;
  }

  function handleUp(e: PointerEvent) {
    e.preventDefault();
    isContact = false;
    active = null;
    buttonsBitmask = 0;
  }

  const BUTTONS: { id: ButtonId; label: string; color: string }[] = [
    { id: 'tip',     label: 'Punta',    color: 'var(--success)' },
    { id: 'barrel1', label: 'Botón 1',  color: 'var(--accent)' },
    { id: 'barrel2', label: 'Botón 2',  color: 'var(--warning)' },
    { id: 'eraser',  label: 'Borrador', color: 'var(--error)' },
  ];

  function reset() {
    counts = { tip: 0, barrel1: 0, barrel2: 0, eraser: 0 };
    active = null;
    isContact = false;
    pointerType = '–';
  }

  let metrics = $derived([
    { label: 'Tipo', value: pointerType },
    { label: 'button', value: buttonIndex === -1 ? '–' : String(buttonIndex) },
    { label: 'buttons', value: `0b${buttonsBitmask.toString(2).padStart(5,'0')}` },
  ]);
</script>

<div class="stylus-buttons flex-col">
  <div class="toolbar">
    <span class="status-text">Presiona la punta, botones laterales o el borrador de tu lápiz abajo</span>
    <button class="btn btn-ghost btn-sm" onclick={reset}>{locale.t.common.reset}</button>
  </div>

  <!-- Big active indicator -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="test-area canvas-container"
    onpointerdown={handleDown}
    onpointermove={handleMove}
    onpointerup={handleUp}
    onpointercancel={handleUp}
    oncontextmenu={(e) => e.preventDefault()}
    style="touch-action: none; height: 160px;"
  >
    {#if active}
      {@const btn = BUTTONS.find(b => b.id === active)!}
      <span class="active-label" style="color: {btn.color}">{btn.label}</span>
    {:else}
      <span class="idle-label">Área de prueba</span>
    {/if}
  </div>

  <!-- 4 button cards -->
  <div class="btn-grid">
    {#each BUTTONS as btn}
      <div class="btn-card" class:lit={active === btn.id} style="--c: {btn.color}">
        <div class="dot" class:lit={active === btn.id}></div>
        <div class="label">{btn.label}</div>
        <div class="count">{counts[btn.id]}</div>
      </div>
    {/each}
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .stylus-buttons { display: flex; flex-direction: column; gap: var(--space-md); }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .status-text { font-size: 0.875rem; color: var(--text-secondary); }

  .test-area {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: crosshair;
    min-height: 160px;
  }
  .active-label {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.1s;
  }
  .idle-label { font-size: 0.9rem; color: var(--text-muted); }

  .btn-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
  }
  @media (max-width: 600px) {
    .btn-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .btn-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .btn-card.lit {
    border-color: var(--c);
    box-shadow: 0 0 12px color-mix(in srgb, var(--c) 20%, transparent);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 2px solid var(--border);
    transition: background 0.1s, border-color 0.1s, box-shadow 0.1s;
  }
  .dot.lit {
    background: var(--c);
    border-color: var(--c);
    box-shadow: 0 0 6px var(--c);
  }

  .label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .count {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }
</style>
