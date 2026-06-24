<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import TargetPoints from './TargetPoints.svelte';
  import LinesJitter from './LinesJitter.svelte';

  let activeActivity = $state('targetPoints');

  let activities = $derived([
    { id: 'targetPoints', name: locale.t.activities.targetPoints.name },
    { id: 'linesJitter', name: locale.t.activities.linesJitter.name }
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.precision}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'targetPoints'}
      <TargetPoints />
    {:else if activeActivity === 'linesJitter'}
      <LinesJitter />
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
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
