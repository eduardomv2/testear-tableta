<script lang="ts">
  import { locale } from '../i18n/store.svelte.ts';

  let { activeTab, onTabChange }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  } = $props();

  const tabs = [
    { id: 'drawing' },
    { id: 'exercises' },
    { id: 'precision' },
    { id: 'performance' },
  ] as const;

  function getTabName(id: string): string {
    return locale.t.tabs[id as keyof typeof locale.t.tabs] ?? id;
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <h2 class="title">DIAGNOSTICS</h2>
    <span class="version">V2.0.4-STYLUS</span>
  </div>

  <nav class="nav-menu">
    {#each tabs as tab (tab.id)}
      <button
        class="nav-item"
        class:active={activeTab === tab.id}
        onclick={() => onTabChange(tab.id)}
      >
        <span class="nav-label">{getTabName(tab.id)}</span>
      </button>
    {/each}
  </nav>
</aside>

<style>
  .sidebar {
    width: 250px;
    background: var(--bg-primary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: var(--space-lg) 0;
  }

  .sidebar-header {
    padding: 0 var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .title {
    font-size: 18px; /* headline-md roughly */
    font-weight: 600;
    color: var(--accent);
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }

  .version {
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-lg);
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
  }

  .nav-item:hover {
    color: var(--text-primary);
    background: var(--bg-secondary);
  }

  .nav-item.active {
    color: var(--text-primary);
    border-left-color: var(--accent);
    background: var(--bg-secondary);
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .nav-label {
    text-transform: capitalize;
  }
</style>
