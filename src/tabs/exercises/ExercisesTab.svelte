<script lang="ts">
  import { locale } from '../../i18n/store.svelte.ts';
  import ActivityNav from '../../components/ActivityNav.svelte';
  import GuidedExercises from '../drawing/GuidedExercises.svelte';

  let activeActivity = $state('exercises');

  let activities = $derived([
    { id: 'exercises', name: locale.t.activities.guidedExercises.name },
  ]);

  function handleActivityChange(id: string) {
    activeActivity = id;
  }
</script>

<div class="tab-content fade-in">
  <div class="header-section">
    <h2 class="section-title">{locale.t.tabs.exercises}</h2>
    <ActivityNav {activities} {activeActivity} onActivityChange={handleActivityChange} />
  </div>

  <div class="activity-container">
    {#if activeActivity === 'exercises'}
      <GuidedExercises />
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
