<script lang="ts">
  import { locale } from '../i18n/store.svelte.ts';

  const { onStart } = $props<{
    onStart: () => void;
  }>();
</script>

<div class="landing-page">
  <main class="hero-section fade-in">
    <div class="hero-content">
      <h1 class="hero-title">STYLUS LAB</h1>
      <p class="hero-subtitle">
        HARDWARE TELEMETRY // LATENCY DIAGNOSTICS // PERFORMANCE OPTIMIZATION
      </p>


      
      <div class="video-container">
        <iframe 
          src="/demo-video/index.html" 
          title="Stylus Lab Demo"
          class="demo-iframe"
          frameborder="0"
          scrolling="no">
        </iframe>
      </div>

      <button class="btn-start" onclick={onStart}>
        [ START_DIAGNOSTIC ]
      </button>

      <div class="footer-links">
        <a href="https://github.com/eduardomv2/testear-tableta" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a>
      </div>
    </div>
  </main>
</div>

<style>
  .landing-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    overflow-y: auto;
    align-items: center;
    justify-content: center;
  }

  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-xl) var(--space-md);
    width: 100%;
    max-width: 900px;
    margin-top: 5vh; /* un poco mas abajo */
  }

  .hero-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    width: 100%;
  }

  .hero-title {
    font-size: 32px; /* headline-lg */
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.1em;
    margin: 0;
  }

  .hero-subtitle {
    font-size: 14px; /* body-sm */
    color: var(--accent);
    letter-spacing: 0.05em;
    margin: 0;
  }

  .footer-links {
    margin-top: var(--space-xl);
    display: flex;
    justify-content: center;
  }

  .footer-links a {
    color: var(--text-secondary);
    transition: color var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .footer-links a:hover {
    color: var(--text-primary);
  }

  .video-container {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .demo-iframe {
    width: 100%;
    height: 100%;
    border: none;
    /* The iframe content is 1280x720. We use CSS scaling to fit it if needed, but flex/aspect-ratio handles the container. Since the iframe content has hardcoded 1280px width on body, we'll use CSS transform to scale it down, or let the iframe scale natively. Actually, we can just use CSS container queries or let CSS scale it. */
  }

  .btn-start {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: var(--space-md) var(--space-xl);
    cursor: pointer;
    letter-spacing: 0.1em;
    transition: all var(--transition-fast);
    margin-top: var(--space-md);
    margin-bottom: var(--space-2xl);
  }

  .btn-start:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(168, 85, 247, 0.05);
  }
</style>
