import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../constants.js';
import { randomRange } from '../utils/math.js';

export class MainMenu {
  constructor() {
    this.selectedIndex = 0;
    this.options = ['NEW GAME'];
    this.showAdmin = false;
    this.fireParticles = [];
    this.timer = 0;
    this.fadeAlpha = 0; // title fades in

    // Check for admin access
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        this.showAdmin = true;
        this.options.push('ADMIN');
      }
    }

    // Konami code detection
    this.konamiSequence = [];
    this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    // Init fire particles (more for dramatic effect)
    for (let i = 0; i < 120; i++) {
      this.fireParticles.push(this._createParticle());
    }
  }

  _createParticle() {
    return {
      x: randomRange(0, VIEWPORT_WIDTH),
      y: randomRange(VIEWPORT_HEIGHT * 0.3, VIEWPORT_HEIGHT),
      vy: randomRange(-80, -20),
      vx: randomRange(-8, 8),
      life: randomRange(0.5, 3.0),
      maxLife: 3.0,
      size: randomRange(1, 5),
      r: Math.floor(randomRange(200, 255)),
      g: Math.floor(randomRange(30, 200)),
      b: Math.floor(randomRange(0, 30)),
    };
  }

  checkKonami(keyCode) {
    this.konamiSequence.push(keyCode);
    if (this.konamiSequence.length > 10) {
      this.konamiSequence.shift();
    }
    if (this.konamiSequence.length === 10 &&
        this.konamiSequence.every((k, i) => k === this.konamiCode[i])) {
      this.showAdmin = true;
      if (!this.options.includes('ADMIN')) {
        this.options.push('ADMIN');
      }
    }
  }

  update(dt, input) {
    this.timer += dt;

    // Fade in over 2 seconds
    if (this.fadeAlpha < 1) {
      this.fadeAlpha = Math.min(1, this.timer / 2.0);
    }

    // Update fire particles
    for (const p of this.fireParticles) {
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      p.life -= dt;
      if (p.life <= 0) {
        Object.assign(p, this._createParticle());
      }
    }

    // Auto-transition after 4 seconds, or any input after fade-in
    if (this.timer > 4 || (this.fadeAlpha >= 1 && (input.enterJustPressed || input.anyKeyPressed()))) {
      return 'NEW GAME';
    }

    return null;
  }

  render(ctx) {
    // Background - deep dark with fire glow
    ctx.fillStyle = '#110800';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Bottom fire glow gradient
    const glowGrad = ctx.createLinearGradient(0, VIEWPORT_HEIGHT * 0.6, 0, VIEWPORT_HEIGHT);
    glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    glowGrad.addColorStop(0.5, 'rgba(80,20,0,0.3)');
    glowGrad.addColorStop(1, 'rgba(120,30,0,0.5)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Fire particles background
    for (const p of this.fireParticles) {
      const alpha = Math.max(0, p.life / p.maxLife) * 0.7;
      ctx.globalAlpha = alpha * this.fadeAlpha;
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Apply fade-in to all title elements
    ctx.globalAlpha = this.fadeAlpha;

    const cx = VIEWPORT_WIDTH / 2;
    const titleY = 120;

    // Fire glow behind title
    const titleGlowAlpha = 0.15 + Math.sin(this.timer * 3) * 0.05;
    ctx.fillStyle = `rgba(255,80,0,${titleGlowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, titleY + 20, 180, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    // "STUNTLISTING'S" — orange
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 28px monospace';
    ctx.fillText("STUNTLISTING'S", cx, titleY);

    // "PRO FIRE BURNER" — golden with fire glow layers
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('PRO FIRE BURNER', cx, titleY + 44);

    // Flickering fire effect layer 1 (red, offset)
    const flicker1 = Math.sin(this.timer * 8) * 2;
    ctx.globalAlpha = (0.25 + Math.sin(this.timer * 6) * 0.1) * this.fadeAlpha;
    ctx.fillStyle = '#ff4400';
    ctx.fillText('PRO FIRE BURNER', cx + flicker1, titleY + 43);

    // Flickering fire effect layer 2 (bright orange, different phase)
    const flicker2 = Math.sin(this.timer * 11 + 1) * 1.5;
    ctx.globalAlpha = (0.15 + Math.sin(this.timer * 9 + 2) * 0.08) * this.fadeAlpha;
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('PRO FIRE BURNER', cx + flicker2, titleY + 42);

    ctx.globalAlpha = this.fadeAlpha;

    // Rising heat shimmer on title letters
    for (let i = 0; i < 8; i++) {
      const sx = cx - 120 + i * 34;
      const shimmer = Math.sin(this.timer * 5 + i * 0.8) * 3;
      const shimmerAlpha = Math.max(0, 0.3 + Math.sin(this.timer * 4 + i) * 0.2);
      ctx.globalAlpha = shimmerAlpha * this.fadeAlpha;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.ellipse(sx, titleY + 30 + shimmer, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = this.fadeAlpha;

    // Tagline
    ctx.fillStyle = '#aa7744';
    ctx.font = '14px monospace';
    ctx.fillText('"The longer the burn, the bigger the check"', cx, titleY + 76);

    // "Tap to start" prompt (appears after fade-in)
    if (this.fadeAlpha >= 1) {
      const promptBlink = Math.sin(this.timer * 3) > 0;
      if (promptBlink) {
        ctx.fillStyle = '#ff8844';
        ctx.font = '16px monospace';
        ctx.fillText('TAP TO START', cx, VIEWPORT_HEIGHT - 60);
      }
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}
