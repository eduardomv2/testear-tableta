<script lang="ts">
  import { locale } from '../i18n/store.svelte.ts';
</script>

<header class="top-bar">
  <div class="left-section">
    <span class="brand">STYLUS_OS</span>
  </div>
  <div class="right-section">
    <a href="https://github.com/eduardomv2" target="_blank" rel="noopener noreferrer" class="nav-link" aria-label="GitHub">
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
    </a>
    <button class="lang-toggle" onclick={() => locale.toggle()}>
      {locale.current === 'es' ? 'ES' : 'EN'}
    </button>
  </div>
</header>

<style>
  .top-bar {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--space-md);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
  }

  .brand {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-primary);
  }

  .right-section {
    display: flex;
    gap: var(--space-md);
    align-items: center;
  }

  .nav-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }

  .nav-link:hover {
    color: var(--text-primary);
  }

  .lang-toggle {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    padding: 2px 6px;
    font-size: 10px;
    cursor: pointer;
    font-family: inherit;
  }
  .lang-toggle:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
  }
</style>
