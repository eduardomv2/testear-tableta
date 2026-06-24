<script lang="ts">
  let { metrics }: {
    metrics: Array<{
      label: string;
      value: string | number;
      unit?: string;
      color?: string;
      progress?: number; // 0 to 100
    }>;
  } = $props();
</script>

<div class="metric-grid">
  {#each metrics as metric (metric.label)}
    <div class="metric-card technical-panel fade-in">
      <div class="metric-header">
        <span class="metric-label">{metric.label}</span>
        <div class="metric-value-row">
          <span
            class="metric-value"
            style={metric.color ? `color: ${metric.color}` : ''}
          >
            {metric.value}
          </span>
          {#if metric.unit}
            <span class="metric-unit">{metric.unit}</span>
          {/if}
        </div>
      </div>
      {#if metric.progress !== undefined}
        <div class="meter-track">
          <div class="meter-fill" style="width: {metric.progress}%"></div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .metric-grid {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
    align-items: stretch;
    /* Minimize height taken by the panel */
    margin-top: auto;
  }

  .metric-card {
    flex: 1;
    min-width: 150px;
    padding: var(--space-xs) var(--space-sm);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .metric-value-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-xs);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .metric-unit {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* Progress bar / Meter */
  .meter-track {
    height: 2px; /* Thinner progress bar */
    background: var(--border);
    border-radius: var(--radius-full);
    overflow: hidden;
    width: 100%;
  }
  .meter-fill {
    height: 100%;
    background: var(--accent);
    transition: width 50ms linear;
  }
</style>
