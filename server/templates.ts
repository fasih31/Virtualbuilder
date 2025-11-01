
export const websiteTemplates = {
  portfolio: {
    html: `<div class="portfolio">
  <header class="hero">
    <h1>John Doe</h1>
    <p>Full Stack Developer</p>
  </header>
  <section class="projects">
    <h2>My Projects</h2>
    <div class="project-grid">
      <div class="project-card">
        <h3>Project 1</h3>
        <p>Amazing web application</p>
      </div>
    </div>
  </section>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; }
.hero { text-align: center; padding: 100px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.projects { padding: 60px 20px; max-width: 1200px; margin: 0 auto; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
.project-card { background: #1a1a1a; padding: 2rem; border-radius: 12px; border: 1px solid #333; }`,
    js: `console.log('Portfolio loaded');`
  },
  landing: {
    html: `<div class="landing">
  <nav class="navbar">
    <div class="logo">BrandName</div>
    <button class="cta-btn">Get Started</button>
  </nav>
  <section class="hero">
    <h1>Build Amazing Products Faster</h1>
    <p>The all-in-one platform for modern development</p>
    <button class="cta-btn-large">Start Free Trial</button>
  </section>
  <section class="features">
    <div class="feature">
      <h3>⚡ Fast</h3>
      <p>Lightning-fast performance</p>
    </div>
    <div class="feature">
      <h3>🔒 Secure</h3>
      <p>Enterprise-grade security</p>
    </div>
    <div class="feature">
      <h3>📈 Scalable</h3>
      <p>Grows with your needs</p>
    </div>
  </section>
</div>`,
    css: `.navbar { display: flex; justify-content: space-between; padding: 1rem 2rem; background: rgba(0,0,0,0.9); }
.hero { text-align: center; padding: 120px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.cta-btn-large { padding: 1rem 2rem; font-size: 1.2rem; background: #fff; color: #667eea; border: none; border-radius: 8px; cursor: pointer; }
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; padding: 60px 20px; max-width: 1200px; margin: 0 auto; }`,
    js: `document.querySelectorAll('.cta-btn, .cta-btn-large').forEach(btn => {
  btn.addEventListener('click', () => alert('Sign up functionality coming soon!'));
});`
  }
};

export const aiTemplates = {
  chat: {
    systemPrompt: "You are a helpful, friendly AI assistant. Answer questions clearly and concisely.",
    name: "Chat Assistant"
  },
  writer: {
    systemPrompt: "You are a professional content writer. Create engaging, SEO-optimized blog posts with proper structure.",
    name: "Blog Writer"
  },
  debugger: {
    systemPrompt: "You are an expert programmer. Analyze code for bugs, suggest fixes, and explain issues clearly.",
    name: "Code Debugger"
  }
};

export const gameTemplates = {
  platformer: `
// Kaboom.js Platformer
import kaboom from "kaboom"

kaboom()

loadSprite("player", "/sprites/player.png")

scene("game", () => {
  add([
    sprite("player"),
    pos(120, 80),
    area(),
    body(),
    "player",
  ])
  
  add([
    rect(width(), 48),
    outline(4),
    pos(0, height() - 48),
    area(),
    body({ isStatic: true }),
    color(127, 200, 255),
  ])
  
  onKeyPress("space", () => {
    const player = get("player")[0]
    if (player.isGrounded()) {
      player.jump()
    }
  })
})

go("game")
`,
  shooter: `
// Simple Space Shooter
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const player = { x: 375, y: 500, width: 50, height: 50, speed: 5 };
const bullets = [];
const enemies = [];

function drawPlayer() {
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

gameLoop();
`
};
