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

<div class="tab-bar" role="tablist" aria-label="Test categories">
  {#each tabs as tab (tab.id)}
    <button
      class="tab-item"
      class:active={activeTab === tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      id="tab-{tab.id}"
      onclick={() => onTabChange(tab.id)}
    >
      <span class="tab-label">{getTabName(tab.id)}</span>
    </button>
  {/each}
</div>

<style>
  .tab-bar {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-lg);
    border-bottom: 1px solid var(--border);
    background: var(--bg-primary);
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .tab-bar::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    user-select: none;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }

  .tab-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.03);
  }

  .tab-item.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .tab-label {
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    .tab-bar {
      padding: var(--space-xs) var(--space-md);
    }
    .tab-item {
      padding: var(--space-xs) var(--space-sm);
      font-size: 0.8rem;
    }
  }
</style>
