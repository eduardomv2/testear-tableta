<script lang="ts">
  import Header from './components/Header.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import DrawingTab from './tabs/drawing/DrawingTab.svelte';
  import ExercisesTab from './tabs/exercises/ExercisesTab.svelte';
  import PrecisionTab from './tabs/precision/PrecisionTab.svelte';
  import PerformanceTab from './tabs/performance/PerformanceTab.svelte';
  import LandingPage from './components/LandingPage.svelte';

  let showApp = $state(false);
  let activeTab = $state('drawing');

  function handleTabChange(tab: string) {
    activeTab = tab;
  }
</script>

{#if !showApp}
  <LandingPage onStart={() => showApp = true} />
{:else}
  <div class="app-container">
    <Header />
    <div class="app-body">
      <Sidebar {activeTab} onTabChange={handleTabChange} />
      <main class="main-content">
        {#if activeTab === 'drawing'}
          <DrawingTab />
        {:else if activeTab === 'exercises'}
          <ExercisesTab />
        {:else if activeTab === 'precision'}
          <PrecisionTab />
        {:else if activeTab === 'performance'}
          <PerformanceTab />
        {/if}
      </main>
    </div>
  </div>
{/if}

<style>
  .app-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100vw;
  }
  .app-body {
    flex: 1;
    display: flex;
    flex-direction: row;
    min-height: 0;
    overflow: hidden;
  }
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    min-height: 0;
    padding: var(--space-lg);
  }
</style>
