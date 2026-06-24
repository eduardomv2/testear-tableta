import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

// Polyfill to ensure pen taps consistently trigger clicks on buttons.
// Graphic tablets often fire pointerdown/up but swallow the click if the pen moves even 1 pixel.
document.addEventListener('pointerup', (e) => {
  if (e.pointerType === 'pen') {
    const btn = (e.target as HTMLElement)?.closest('button');
    if (btn) {
      // Small timeout to allow natural events to finish, then force click if needed
      setTimeout(() => btn.click(), 10);
    }
  }
});

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
