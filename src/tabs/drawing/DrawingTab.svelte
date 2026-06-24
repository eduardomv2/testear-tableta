<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import FreeCalligraphy from './FreeCalligraphy.svelte';
  import PressureTest from '../sensors/PressureTest.svelte';
  import TiltTest from '../sensors/TiltTest.svelte';
  import HoverTest from '../sensors/HoverTest.svelte';

  let activeActivity = $state('free');

  let activities = $derived([
    { id: 'free', name: locale.t.activities.freeCalligraphy.name },
    { id: 'pressure', name: locale.t.activities.pressure.name },
    { id: 'tilt', name: locale.t.activities.tilt.name },
    { id: 'hover', name: locale.t.activities.hover.name },
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.drawing}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'free'}
      <FreeCalligraphy />
    {:else if activeActivity === 'pressure'}
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
    gap: var(--space-sm);
  }
  .activity-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
