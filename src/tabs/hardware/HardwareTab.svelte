<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import StylusButtons from './StylusButtons.svelte';
  import ActiveArea from './ActiveArea.svelte';

  let activeActivity = $state('stylusButtons');

  let activities = $derived([
    { id: 'stylusButtons', name: locale.t.activities.stylusButtons.name },
    { id: 'activeArea', name: locale.t.activities.activeArea.name }
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.hardware}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'stylusButtons'}
      <StylusButtons />
    {:else if activeActivity === 'activeArea'}
      <ActiveArea />
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
