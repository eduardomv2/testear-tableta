<div align="center">
  <h1>🖋️ Stylus Lab (TabletTest)</h1>
  <p><strong>The ultimate diagnostic suite for digital creators and hardware enthusiasts.</strong></p>

  <p>
    <a href="https://github.com/eduardomv2"><img src="https://img.shields.io/badge/Developed%20by-eduardomv2-A855F7?style=for-the-badge&logo=github" alt="Author"></a>
    <img src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="Svelte">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  </p>
</div>

<br />

**Stylus Lab** is a high-performance, web-based diagnostic application designed to evaluate the true capabilities of your graphics tablet or stylus directly in the browser. Without installing any additional drivers or third-party software, you can test hardware limits such as input latency, pressure sensitivity, tilt detection, and stroke jitter using the native Canvas API and modern Web Pointer Events.

Built with an "Obsidian Technical" aesthetic, the UI is hyper-minimalist, brutalist, and built for maximum speed and readability.

---

## 🚀 Key Features

* **Free Calligraphy & Drawing Sensors:** Test the responsiveness of your pen in real-time. Dynamically monitor pressure (`%`) and tilt (`X/Y`) while drawing smoothly on the canvas.
* **Precision Targets (Aim Lab style):** Evaluate your hand-eye coordination and hardware accuracy. Tap appearing targets and get instant telemetry on average time, deviation in pixels, and overall accuracy.
* **Ultra-Low Latency Testing:** An oscilloscope-style moving graph visualizes the raw hardware polling rate (up to `240Hz+`). Check for event drops and calculate exact latency from physical touch to browser registration.
* **Guided Exercises:** Trace circles, spirals, and zigzags to measure line jitter and stroke smoothness when drawing slowly or at complex angles.
* **Native Web Technologies:** Achieves native-like performance using HTML5 Canvas 2D, `getCoalescedEvents()`, and `PointerEvent` APIs to capture the rawest hardware data possible.
* **Cinematic Demo:** Features a fully native HTML/CSS/GSAP embedded 60fps animation on the landing page, completely removing the need for heavy MP4 video files.

## Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** Pure Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Animation:** [GSAP](https://gsap.com/) (for the interactive landing page demo)
- **Internationalization:** Custom reactive `i18n` store (ES / EN)

##  Local Development

If you want to run Stylus Lab locally to test your own hardware or contribute to the code:

1. **Clone the repository**
   ```bash
   git clone https://github.com/eduardomv2/testear-tableta.git
   cd testear-tableta
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

##  Deployment (Vercel)

This project is fully optimized to be deployed on platforms like Vercel or Netlify. 
Since it is a statically generated Vite/Svelte SPA, Vercel will automatically detect the framework and deploy it in seconds. 
Just connect your repository and click **Deploy**.

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a Pull Request if you want to add new diagnostic tests or improve the UI.


