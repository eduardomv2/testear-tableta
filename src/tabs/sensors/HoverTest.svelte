<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import MetricsPanel from '../../components/MetricsPanel.svelte';

  let state = $state<'out' | 'hover' | 'contact'>('out');
  let lastX = $state(0);
  let lastY = $state(0);
  let pointerType = $state('');

  function handleEnter(e: PointerEvent) {
    if (e.buttons > 0 || e.pressure > 0) state = 'contact';
    else state = 'hover';
  }

  function handleLeave() {
    state = 'out';
  }

  function handleMove(e: PointerEvent) {
    pointerType = e.pointerType;
    // Get mouse pos relative to the container
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    if (e.buttons > 0 || e.pressure > 0) state = 'contact';
    else state = 'hover';
  }

  function handleDown(e: PointerEvent) {
    state = 'contact';
  }

  function handleUp(e: PointerEvent) {
    state = 'hover';
  }

  let metrics = $derived([
    { label: locale.t.activities.hover.status, value: state === 'out' ? locale.t.activities.hover.outOfRange : state === 'hover' ? locale.t.activities.hover.hovering : locale.t.activities.hover.contact, color: state === 'out' ? 'var(--text-secondary)' : state === 'hover' ? 'var(--warning)' : 'var(--success)' },
    { label: 'X', value: lastX.toFixed(0), unit: 'px' },
    { label: 'Y', value: lastY.toFixed(0), unit: 'px' },
    { label: locale.t.metrics.pointerType, value: pointerType || '-' }
  ]);
</script>

<div class="hover-test flex-col">
  <div class="toolbar">
    <span class="status-text">{locale.t.activities.hover.moveStylus}</span>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="hover-area canvas-container" 
    class:is-hover={state === 'hover'} 
    class:is-contact={state === 'contact'}
    onpointerenter={handleEnter}
    onpointerleave={handleLeave}
    onpointermove={handleMove}
    onpointerdown={handleDown}
    onpointerup={handleUp}
  >
    <div class="status-display">
      {#if state === 'out'}
        {locale.t.activities.hover.outOfRange}
      {:else if state === 'hover'}
        {locale.t.activities.hover.hovering}
      {:else}
        {locale.t.activities.hover.contact}
      {/if}
    </div>
    
    {#if state !== 'out'}
      <div 
        class="cursor-tracker"
        style="transform: translate({lastX}px, {lastY}px);"
      ></div>
    {/if}
  </div>

  <MetricsPanel {metrics} />
</div>

<style>
  .hover-test {
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
  .hover-area {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-canvas);
    transition: background-color var(--transition-normal);
    position: relative;
    overflow: hidden;
    touch-action: none;
  }
  .hover-area.is-hover {
    background: rgba(255, 184, 77, 0.1);
    box-shadow: inset 0 0 0 2px var(--warning);
  }
  .hover-area.is-contact {
    background: rgba(76, 235, 154, 0.1);
    box-shadow: inset 0 0 0 2px var(--success);
  }
  .status-display {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }
  .is-hover .status-display { color: var(--warning); }
  .is-contact .status-display { color: var(--success); }
  
  .cursor-tracker {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 10;
  }
  .is-hover .cursor-tracker {
    border: 2px solid var(--warning);
  }
  .is-contact .cursor-tracker {
    background: var(--success);
  }
</style>
