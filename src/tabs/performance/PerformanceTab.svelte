<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import LatencyTest from './LatencyTest.svelte';
  import ReportRate from './ReportRate.svelte';

  let activeActivity = $state('latency');

  let activities = $derived([
    { id: 'latency', name: locale.t.activities.latency.name },
    { id: 'reportRate', name: locale.t.activities.reportRate.name }
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.performance}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'latency'}
      <LatencyTest />
    {:else if activeActivity === 'reportRate'}
      <ReportRate />
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
