<script lang="ts">
  let { activities, activeActivity, onActivityChange }: {
    activities: Array<{ id: string; name: string }>;
    activeActivity: string;
    onActivityChange: (id: string) => void;
  } = $props();
</script>

<div class="activity-nav" role="tablist" aria-label="Activity selection">
  {#each activities as activity (activity.id)}
    <button
      class="activity-pill"
      class:active={activeActivity === activity.id}
      role="tab"
      aria-selected={activeActivity === activity.id}
      id="activity-{activity.id}"
      onclick={() => onActivityChange(activity.id)}
    >
      [{activity.name}]
    </button>
  {/each}
</div>

<style>
  .activity-nav {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-wrap: wrap;
    margin-bottom: var(--space-md);
  }

  .activity-pill {
    padding: var(--space-xs) var(--space-sm);
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    user-select: none;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .activity-pill:hover {
    color: var(--text-primary);
    border-color: var(--border);
    background: var(--bg-secondary);
  }

  .activity-pill.active {
    color: var(--accent);
    border-color: var(--accent);
    background: rgba(168, 85, 247, 0.1); /* accent-dim */
    font-weight: 600;
  }
</style>
