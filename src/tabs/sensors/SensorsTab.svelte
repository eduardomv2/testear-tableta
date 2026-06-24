<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import PressureTest from './PressureTest.svelte';
  import TiltTest from './TiltTest.svelte';
  import HoverTest from './HoverTest.svelte';

  let activeActivity = $state('pressure');

  let activities = $derived([
    { id: 'pressure', name: locale.t.activities.pressure.name },
    { id: 'tilt', name: locale.t.activities.tilt.name },
    { id: 'hover', name: locale.t.activities.hover.name }
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.sensors}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'pressure'}
      <PressureTest />
    {:else if activeActivity === 'tilt'}
      <TiltTest />
    {:else if activeActivity === 'hover'}
      <HoverTest />
    {/if}
  </div>
</div>

<style>
  .header-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  .activity-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
