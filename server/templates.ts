
export const websiteTemplates = {
  portfolio: {
    html: `<div class="portfolio">
  <header class="hero">
    <h1 class="hero-title">John Doe</h1>
    <p class="hero-subtitle">Full Stack Developer</p>
    <button class="cta-button">Get In Touch</button>
  </header>
  <section class="projects">
    <h2>My Projects</h2>
    <div class="project-grid">
      <div class="project-card" data-aos="fade-up">
        <div class="project-icon">🚀</div>
        <h3>Project Alpha</h3>
        <p>Full-stack web application built with React and Node.js</p>
        <div class="tech-stack">
          <span class="tech-badge">React</span>
          <span class="tech-badge">Node.js</span>
          <span class="tech-badge">MongoDB</span>
        </div>
      </div>
      <div class="project-card" data-aos="fade-up" data-aos-delay="100">
        <div class="project-icon">💡</div>
        <h3>Project Beta</h3>
        <p>AI-powered analytics dashboard with real-time insights</p>
        <div class="tech-stack">
          <span class="tech-badge">Python</span>
          <span class="tech-badge">TensorFlow</span>
          <span class="tech-badge">D3.js</span>
        </div>
      </div>
      <div class="project-card" data-aos="fade-up" data-aos-delay="200">
        <div class="project-icon">🎨</div>
        <h3>Project Gamma</h3>
        <p>Mobile-first design system and component library</p>
        <div class="tech-stack">
          <span class="tech-badge">Figma</span>
          <span class="tech-badge">CSS</span>
          <span class="tech-badge">Storybook</span>
        </div>
      </div>
    </div>
  </section>
  <footer class="footer">
    <p>&copy; 2024 John Doe. Built with VirtuBuild</p>
  </footer>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
.hero { text-align: center; padding: 120px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; }
.hero::before { content: ''; position: absolute; inset: 0; background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></svg>'); }
.hero-title { font-size: 4rem; margin-bottom: 1rem; font-weight: 800; animation: fadeInUp 1s ease; }
.hero-subtitle { font-size: 1.5rem; opacity: 0.9; margin-bottom: 2rem; animation: fadeInUp 1s ease 0.2s both; }
.cta-button { padding: 1rem 2.5rem; font-size: 1.1rem; background: #fff; color: #667eea; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; transition: all 0.3s; animation: fadeInUp 1s ease 0.4s both; }
.cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,255,255,0.3); }
.projects { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
.projects h2 { text-align: center; font-size: 2.5rem; margin-bottom: 3rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
.project-card { background: linear-gradient(145deg, #1a1a1a, #0f0f0f); padding: 2.5rem; border-radius: 20px; border: 1px solid #333; transition: all 0.4s; cursor: pointer; }
.project-card:hover { transform: translateY(-10px); border-color: #667eea; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3); }
.project-icon { font-size: 3rem; margin-bottom: 1rem; }
.project-card h3 { font-size: 1.5rem; margin-bottom: 1rem; color: #fff; }
.project-card p { color: #aaa; line-height: 1.6; margin-bottom: 1.5rem; }
.tech-stack { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tech-badge { padding: 0.4rem 1rem; background: rgba(102, 126, 234, 0.2); border: 1px solid rgba(102, 126, 234, 0.4); border-radius: 20px; font-size: 0.85rem; color: #a8b4ff; }
.footer { text-align: center; padding: 3rem; background: #0a0a0a; border-top: 1px solid #222; color: #666; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`,
    js: `document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = \`all 0.6s ease \${index * 0.1}s\`;
    observer.observe(card);
  });

  document.querySelector('.cta-button')?.addEventListener('click', () => {
    alert('Contact form coming soon!');
  });
});`
  },
  landing: {
    html: `<div class="landing">
  <nav class="navbar">
    <div class="logo">🚀 BrandName</div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
    </div>
    <button class="cta-btn">Get Started Free</button>
  </nav>
  <section class="hero">
    <h1 class="hero-title">Build Amazing Products<br/>10x Faster</h1>
    <p class="hero-subtitle">The all-in-one platform for modern development. No code required.</p>
    <div class="cta-buttons">
      <button class="cta-btn-large primary">Start Free Trial</button>
      <button class="cta-btn-large secondary">Watch Demo</button>
    </div>
    <div class="social-proof">
      <span>⭐⭐⭐⭐⭐</span>
      <p>Trusted by 10,000+ developers</p>
    </div>
  </section>
  <section id="features" class="features">
    <h2>Why Choose Us?</h2>
    <div class="feature-grid">
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Lightning Fast</h3>
        <p>Deploy in seconds with our optimized infrastructure</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Secure by Default</h3>
        <p>Enterprise-grade security built into every layer</p>
      </div>
      <div class="feature">
        <div class="feature-icon">📈</div>
        <h3>Infinitely Scalable</h3>
        <p>From startup to enterprise, we grow with you</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🎨</div>
        <h3>Beautiful UI</h3>
        <p>Stunning templates that convert visitors to customers</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <h3>AI-Powered</h3>
        <p>Smart automation saves you hours every day</p>
      </div>
      <div class="feature">
        <div class="feature-icon">💰</div>
        <h3>Cost Effective</h3>
        <p>Pay only for what you use, no hidden fees</p>
      </div>
    </div>
  </section>
  <footer class="footer">
    <p>© 2024 BrandName. All rights reserved. Built with VirtuBuild</p>
  </footer>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 4rem; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.1); }
.logo { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; gap: 2rem; }
.nav-links a { color: #fff; text-decoration: none; transition: color 0.3s; }
.nav-links a:hover { color: #667eea; }
.cta-btn { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4); }
.hero { text-align: center; padding: 150px 20px 100px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%); }
.hero-title { font-size: 4.5rem; margin-bottom: 1.5rem; font-weight: 900; line-height: 1.2; animation: fadeInUp 1s ease; }
.hero-subtitle { font-size: 1.5rem; opacity: 0.95; margin-bottom: 3rem; max-width: 700px; margin-left: auto; margin-right: auto; animation: fadeInUp 1s ease 0.2s both; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 3rem; animation: fadeInUp 1s ease 0.4s both; }
.cta-btn-large { padding: 1.2rem 2.5rem; font-size: 1.2rem; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.3s; }
.cta-btn-large.primary { background: #fff; color: #667eea; }
.cta-btn-large.primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(255,255,255,0.3); }
.cta-btn-large.secondary { background: transparent; color: #fff; border: 2px solid #fff; }
.cta-btn-large.secondary:hover { background: rgba(255,255,255,0.1); }
.social-proof { animation: fadeInUp 1s ease 0.6s both; }
.social-proof span { font-size: 1.5rem; }
.social-proof p { margin-top: 0.5rem; font-size: 1rem; opacity: 0.9; }
.features { padding: 100px 20px; max-width: 1400px; margin: 0 auto; }
.features h2 { text-align: center; font-size: 3rem; margin-bottom: 4rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2.5rem; }
.feature { background: linear-gradient(145deg, #1a1a1a, #0f0f0f); padding: 3rem; border-radius: 20px; border: 1px solid #333; transition: all 0.4s; text-align: center; }
.feature:hover { transform: translateY(-10px); border-color: #667eea; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3); }
.feature-icon { font-size: 4rem; margin-bottom: 1.5rem; }
.feature h3 { font-size: 1.8rem; margin-bottom: 1rem; color: #fff; }
.feature p { color: #aaa; line-height: 1.8; font-size: 1.1rem; }
.footer { text-align: center; padding: 3rem; background: #0a0a0a; border-top: 1px solid #222; color: #666; margin-top: 5rem; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 768px) { .hero-title { font-size: 2.5rem; } .cta-buttons { flex-direction: column; } .nav-links { display: none; } }`,
    js: `document.querySelectorAll('.cta-btn, .cta-btn-large').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = '✓ Coming Soon!';
    setTimeout(() => btn.textContent = btn.classList.contains('primary') ? 'Start Free Trial' : btn.classList.contains('secondary') ? 'Watch Demo' : 'Get Started Free', 2000);
  });
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target?.scrollIntoView({ behavior: 'smooth' });
  });
});`
  },
  blog: {
    html: `<div class="blog">
  <header class="blog-header">
    <h1>My Blog</h1>
    <p>Thoughts on tech, design, and life</p>
  </header>
  <main class="blog-grid">
    <article class="post-card">
      <div class="post-image">📝</div>
      <div class="post-meta">
        <span class="date">Dec 15, 2024</span>
        <span class="category">Technology</span>
      </div>
      <h2>Getting Started with AI Development</h2>
      <p>Learn how to build your first AI-powered application in just a few hours...</p>
      <a href="#" class="read-more">Read More →</a>
    </article>
    <article class="post-card">
      <div class="post-image">🎨</div>
      <div class="post-meta">
        <span class="date">Dec 10, 2024</span>
        <span class="category">Design</span>
      </div>
      <h2>Modern UI Design Trends for 2024</h2>
      <p>Exploring the latest design patterns that are shaping the web...</p>
      <a href="#" class="read-more">Read More →</a>
    </article>
  </main>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #f5f5f5; color: #333; }
.blog-header { text-align: center; padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
.blog-header h1 { font-size: 3rem; margin-bottom: 0.5rem; }
.blog-grid { max-width: 1200px; margin: 50px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
.post-card { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.3s; }
.post-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.post-image { font-size: 4rem; margin-bottom: 1rem; }
.post-meta { display: flex; gap: 1rem; margin-bottom: 1rem; }
.post-meta span { font-size: 0.9rem; color: #666; }
.category { background: #667eea; color: #fff; padding: 0.25rem 0.75rem; border-radius: 20px; }
.post-card h2 { margin-bottom: 1rem; color: #222; }
.post-card p { color: #555; line-height: 1.6; margin-bottom: 1.5rem; }
.read-more { color: #667eea; font-weight: 600; text-decoration: none; }`,
    js: `document.querySelectorAll('.read-more').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Full article coming soon!');
  });
});`
  },
  saas: {
    html: `<div class="saas-dashboard">
  <nav class="sidebar">
    <div class="logo">📊 DashBoard</div>
    <ul class="nav-menu">
      <li class="active">Dashboard</li>
      <li>Analytics</li>
      <li>Projects</li>
      <li>Settings</li>
    </ul>
  </nav>
  <main class="main-content">
    <header class="top-bar">
      <h1>Dashboard Overview</h1>
      <button class="btn-primary">+ New Project</button>
    </header>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-value">12,345</p>
        <span class="stat-change positive">+12.5%</span>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p class="stat-value">$45,678</p>
        <span class="stat-change positive">+8.3%</span>
      </div>
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-value">89</p>
        <span class="stat-change negative">-2.1%</span>
      </div>
    </div>
  </main>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #f8f9fa; }
.saas-dashboard { display: flex; height: 100vh; }
.sidebar { width: 250px; background: #1a1a1a; color: #fff; padding: 2rem 0; }
.logo { font-size: 1.5rem; font-weight: 800; padding: 0 1.5rem; margin-bottom: 2rem; }
.nav-menu { list-style: none; }
.nav-menu li { padding: 1rem 1.5rem; cursor: pointer; transition: all 0.3s; }
.nav-menu li:hover, .nav-menu li.active { background: rgba(102, 126, 234, 0.2); border-left: 3px solid #667eea; }
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }
.top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-primary { padding: 0.75rem 1.5rem; background: #667eea; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.stat-card { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.stat-card h3 { color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: 800; color: #222; margin-bottom: 0.5rem; }
.stat-change { font-size: 0.9rem; font-weight: 600; }
.stat-change.positive { color: #28a745; }
.stat-change.negative { color: #dc3545; }`,
    js: `document.querySelector('.btn-primary')?.addEventListener('click', () => {
  alert('Create new project modal coming soon!');
});`
  },
  ecommerce: {
    html: `<div class="ecommerce">
  <header class="shop-header">
    <div class="logo">🛍️ ShopName</div>
    <div class="cart">Cart (0)</div>
  </header>
  <main class="product-grid">
    <div class="product-card">
      <div class="product-image">📱</div>
      <h3>Product Name</h3>
      <p class="price">$99.99</p>
      <button class="add-to-cart">Add to Cart</button>
    </div>
    <div class="product-card">
      <div class="product-image">💻</div>
      <h3>Product Name</h3>
      <p class="price">$199.99</p>
      <button class="add-to-cart">Add to Cart</button>
    </div>
  </main>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #fff; }
.shop-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3rem; background: #667eea; color: #fff; }
.logo { font-size: 1.5rem; font-weight: 800; }
.cart { cursor: pointer; }
.product-grid { max-width: 1400px; margin: 50px auto; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.product-card { background: #f9f9f9; border-radius: 12px; padding: 2rem; text-align: center; transition: all 0.3s; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.product-image { font-size: 5rem; margin-bottom: 1rem; }
.product-card h3 { margin-bottom: 0.5rem; }
.price { font-size: 1.5rem; font-weight: 700; color: #667eea; margin: 1rem 0; }
.add-to-cart { width: 100%; padding: 0.75rem; background: #667eea; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }`,
    js: `let cartCount = 0;
document.querySelectorAll('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;
    document.querySelector('.cart').textContent = \`Cart (\${cartCount})\`;
    btn.textContent = '✓ Added';
    setTimeout(() => btn.textContent = 'Add to Cart', 1500);
  });
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
  platformer: `// HTML5 Canvas Platformer Game
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = '2px solid #333';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const player = { x: 100, y: 400, width: 40, height: 40, velY: 0, jumping: false, speed: 5 };
const gravity = 0.8;
const jumpStrength = -15;
const platforms = [
  { x: 0, y: 550, width: 800, height: 50 },
  { x: 200, y: 400, width: 150, height: 20 },
  { x: 500, y: 300, width: 150, height: 20 }
];
let score = 0;
const coins = [{ x: 250, y: 350 }, { x: 550, y: 250 }];

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function update() {
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  if (keys['ArrowUp'] && !player.jumping) {
    player.velY = jumpStrength;
    player.jumping = true;
  }
  
  player.velY += gravity;
  player.y += player.velY;
  
  platforms.forEach(platform => {
    if (player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height) {
      player.y = platform.y - player.height;
      player.velY = 0;
      player.jumping = false;
    }
  });
  
  coins.forEach((coin, i) => {
    if (Math.abs(player.x - coin.x) < 30 && Math.abs(player.y - coin.y) < 30) {
      coins.splice(i, 1);
      score += 10;
    }
  });
}

function draw() {
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#8B4513';
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));
  
  ctx.fillStyle = '#FFD700';
  coins.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.fillStyle = '#FF4444';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Arrow Keys to Move, Up to Jump', 10, 60);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();`,
  shooter: `// Space Shooter Game
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
canvas.style.border = '2px solid #333';
canvas.style.background = '#000';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
const bullets = [];
const enemies = [];
let score = 0;
let gameOver = false;

const keys = {};
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ' && !gameOver) {
    bullets.push({ x: player.x + 20, y: player.y, width: 5, height: 15, speed: 10 });
  }
});
document.addEventListener('keyup', e => keys[e.key] = false);

function spawnEnemy() {
  if (enemies.length < 5 && Math.random() < 0.02) {
    enemies.push({
      x: Math.random() * (canvas.width - 40),
      y: -50,
      width: 40,
      height: 40,
      speed: 2 + Math.random() * 2
    });
  }
}

function update() {
  if (gameOver) return;
  
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
  
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  });
  
  enemies.forEach((e, i) => {
    e.y += e.speed;
    if (e.y > canvas.height) {
      enemies.splice(i, 1);
      gameOver = true;
    }
    
    bullets.forEach((b, j) => {
      if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
      }
    });
  });
  
  spawnEnemy();
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#0F0';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  ctx.fillStyle = '#FF0';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
  
  ctx.fillStyle = '#F00';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
  
  ctx.fillStyle = '#FFF';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Space to Shoot, Arrows to Move', 10, 60);
  
  if (gameOver) {
    ctx.font = '48px Arial';
    ctx.fillText('GAME OVER', canvas.width/2 - 150, canvas.height/2);
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width/2 - 80, canvas.height/2 + 40);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();`,
  puzzle: `// Matching Game
const canvas = document.createElement('canvas');
canvas.width = 600;
canvas.height = 600;
canvas.style.border = '2px solid #333';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
const cards = [];
let flipped = [];
let matched = [];
let score = 0;

for (let i = 0; i < 6; i++) {
  cards.push({ color: colors[i], id: i });
  cards.push({ color: colors[i], id: i });
}
cards.sort(() => Math.random() - 0.5);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / 150);
  const row = Math.floor(y / 150);
  const index = row * 4 + col;
  
  if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
    flipped.push(index);
    if (flipped.length === 2) {
      setTimeout(() => {
        if (cards[flipped[0]].id === cards[flipped[1]].id) {
          matched.push(...flipped);
          score += 10;
        }
        flipped = [];
        draw();
      }, 1000);
    }
  }
  draw();
});

function draw() {
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  cards.forEach((card, i) => {
    const x = (i % 4) * 150;
    const y = Math.floor(i / 4) * 150;
    
    if (flipped.includes(i) || matched.includes(i)) {
      ctx.fillStyle = card.color;
    } else {
      ctx.fillStyle = '#34495E';
    }
    
    ctx.fillRect(x + 5, y + 5, 140, 140);
    ctx.strokeStyle = '#ECF0F1';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 5, y + 5, 140, 140);
  });
  
  ctx.fillStyle = '#FFF';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 10, canvas.height - 10);
  
  if (matched.length === cards.length) {
    ctx.font = '48px Arial';
    ctx.fillText('YOU WIN!', canvas.width/2 - 100, canvas.height/2);
  }
}

draw();`
};
